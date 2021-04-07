/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var Const = require('../../const');
var Lizard = require('../../sub/lizard');
var JLog = require('../../sub/jjlog');
var DB;
var DIC;

const ROBOT_START_DELAY = [ 1200, 800, 400, 200, 0 ];
const ROBOT_TYPE_COEF = [ 1250, 750, 500, 250, 0 ];
const ROBOT_THINK_COEF = [ 4, 2, 1, 0, 0 ];
const ROBOT_HIT_LIMIT = [ 4, 2, 1, 0, 0 ];


exports.init = function(_DB, _DIC){
	DB = _DB;
	DIC = _DIC;
};
exports.getTitle = function(){
	var R = new Lizard.Tail();
	var my = this;
	
	setTimeout(function(){
		R.go("①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮");
	}, 500);
	return R;
};
exports.roundReady = function(){
	var my = this;
	var ijl = my.opts.injpick.length;
	
	clearTimeout(my.game.turnTimer);
	my.game.round++;
	my.game.roundTime = my.time * 1000;
	if(my.game.round <= my.round){
		my.game.theme = my.opts.injpick[Math.floor(Math.random() * ijl)];
		my.game.chain = [];
		if(my.opts.mission) my.game.mission = getMission(my.rule.lang);
		my.byMaster('roundReady', {
			round: my.game.round,
			theme: my.game.theme,
			mission: my.game.mission
		}, true);
		my.game.turnTimer = setTimeout(my.turnStart, 2400/my.gameSpeed);
	}else{
		my.roundEnd();
	}
};
exports.turnStart = function(force){
	var my = this;
	var speed;
	var si;
	
	if(!my.game.chain) return;
	var mst = my.time * 1000;
	if(my.time > 600 && !my.opts.inftime) my.game.roundTime = Math.min(my.game.roundTime, Math.max(10000, mst - my.game.chain.length * 1500));
	else if(!my.opts.inftime) my.game.roundTime = Math.min(my.game.roundTime, Math.max(10000, 600000 - my.game.chain.length * 1500));
	else my.game.roundTime = my.time * 1000;
	speed = my.getTurnSpeed(my.game.roundTime);
	clearTimeout(my.game.turnTimer);
	clearTimeout(my.game.robotTimer);
	my.game.late = false;
	my.game.turnTime = 15000 - 1400 * speed;
	my.game.turnTime /= my.gameSpeed;
	my.game.turnAt = (new Date()).getTime();
	my.byMaster('turnStart', {
		turn: my.game.turn,
		speed: speed,
		roundTime: my.game.roundTime,
		turnTime: my.game.turnTime,
		mission: my.game.mission,
		seq: force ? my.game.seq : undefined
	}, true);
	my.game.turnTimer = setTimeout(my.turnEnd, Math.min(my.game.roundTime, my.game.turnTime + (100 / my.gameSpeed)));
	if(si = my.game.seq[my.game.turn]) if(si.robot){
		my.readyRobot(si);
	}
};
exports.turnEnd = function(){
	var my = this;
	var target = DIC[my.game.seq[my.game.turn]] || my.game.seq[my.game.turn];
	var score;
	
	if(my.game.loading){
		my.game.turnTimer = setTimeout(my.turnEnd, 100/my.gameSpeed);
		return;
	}
	if(!my.game.chain) return;
	
	my.game.late = true;
	if(target) if(target.game){
		score = Const.getPenalty(my.game.chain, target.game.score);
		target.game.score += score;
	}
	/*getAuto.call(my, my.game.theme, 0).then(function(w){
		my.byMaster('turnEnd', {
			ok: false,
			target: target ? target.id : null,
			score: score,
			hint: w
		}, true);
		my.game._rrt = setTimeout(my.roundReady, my.opts.faster ? 1500 : 3000);
	});*/
	my.byMaster('turnEnd', {
		ok: false,
		target: target ? target.id : null,
		score: score,
		hint: ''
	}, true);
	my.game._rrt = setTimeout(my.roundReady, 3000/my.gameSpeed);
	clearTimeout(my.game.robotTimer);
};
exports.submit = function(client, text, data){
	var score, l, t;
	var my = this;
	var tv = (new Date()).getTime();
	var mgt = my.game.seq[my.game.turn];
	var percent = 0.6;
	if(my.game.chain.indexOf(text) == -1 || my.opts.return){
		l = my.rule.lang;
		my.game.loading = true;
		function onDB($doc){
			function preApproved(){
				if(my.game.late) return;
				if(!my.game.chain) return;
				
				my.game.loading = false;
				my.game.late = true;
				clearTimeout(my.game.turnTimer);
				t = tv - my.game.turnAt;
				score = my.getScore(text, t);
				my.game.chain.push(text);
				if(!my.opts.inftime) my.game.roundTime -= t;
				client.game.score += score;
				client.publish('turnEnd', {
					ok: true,
					value: text,
					mean: $doc.mean,
					theme: $doc.theme,
					wc: $doc.type,
					score: score,
					bonus: (my.game.mission === true) ? score - my.getScore(text, t, true) : 0,
					baby: $doc.baby,
					cs: client.game.score
				}, true);
				if(my.game.mission === true){
					my.game.mission = getMission(my.rule.lang);
				}
				setTimeout(my.turnNext, my.opts.rightgo ? my.game.turnTime / 12 : my.game.turnTime / 6);
				if(!client.robot && !my.opts.inftime && !my.opts.hack){
					if(my.opts.rightgo) percent /= 1.25;
					if(my.opts.return) percent /= 2;
					if(my.gameSpeed > 1) percent /= my.gameSpeed;
					client.invokeWordPiece('', percent, true);
				}
			}
			function spreApproved(){
				if(my.game.late) return;
				if(!my.game.chain) return;
				
				my.game.loading = false;
				my.game.late = true;
				clearTimeout(my.game.turnTimer);
				t = tv - my.game.turnAt;
				score = my.getScore(text, t);
				my.game.chain.push(text);
				if(!my.opts.inftime) my.game.roundTime -= t;
				client.game.score += score;
				client.publish('turnEnd', {
					ok: true,
					value: text,
					score: score,
					cs: client.game.score,
					bonus: (my.game.mission === true) ? score - my.getScore(text, t, true) : 0,
				}, true);
				if(my.game.mission === true){
					my.game.mission = getMission(my.rule.lang);
				}
				if(!client.robot && !my.opts.inftime && !my.opts.hack){
					if(my.opts.rightgo) percent /= 1.25;
					if(my.opts.return) percent /= 2;
					if(my.gameSpeed > 1) percent /= my.gameSpeed;
					client.invokeWordPiece('', percent, true);
				}
				var qTT = my.game.turnTime;
				setTimeout(my.turnNext, my.opts.rightgo ? qTT / 12 : qTT / 6);
			}
			function denied(code){
				if(client.noChat) text = "";
				my.game.loading = false;
				client.publish('turnError', { code: code || 404, value: text }, true);
			}
			if($doc){
				preApproved();
			}else{
				if(text.indexOf('<') != -1 || text.indexOf('>') != -1 || (text.indexOf('null')!=-1 && !my.opts.mission)) {
					if(client.noChat) text = "";
					my.game.loading = false;
					client.publish('turnError', { code: 410, value: text }, true);
				}else {
					spreApproved();
				}
			}
		}
		DB.kkt[l].find(text).then(onDB);
	} else {
		client.publish('turnError', { code: 409, value: text }, true);
	}
};
exports.getScore = function(text, delay, ignoreMission){
	var my = this;
	var tr = 1 - delay / my.game.turnTime;
	var score = Const.getPreScore(text, my.game.chain, tr, true);
	var arr;
	
	if(!ignoreMission) if(arr = text.match(new RegExp(my.game.mission, "g"))){
		score += 1.75 + score * 0.4 * arr.length;
		my.game.mission = true;
	}
	if(my.opts.scboost) score = score * 10000000;
	return Math.round(score/1.75);
};
exports.readyRobot = function(robot){
	var my = this;
	var level = robot.level;
	var delay = 0;
	var w, text;
	
	denied();

	function denied(){
		if(my.opts.mission && my.opts.return){
			if(!my.opts.sblt && !my.opts.sbsg && !my.opts.sbl1 && !my.opts.sbhk){
				text = ""
				var kp = Math.floor(Math.random() * 30) + 1;
				for(p = 0; p < kp; p++){
					text = text + my.game.mission;
				}
			} else if(my.opts.sblt && !my.opts.sbsg && !my.opts.sbl1 && !my.opts.sbhk){
				text = ""
				var kp = Math.floor(Math.random() * 4) + 1;
				for(p = 0; p < kp; p++){
					text = text + my.game.mission + my.game.mission;
				}
			} else if(my.opts.sbsg && !my.opts.sblt && !my.opts.sbl1 && !my.opts.sbhk){
				text = ""
				var kp = Math.floor(Math.random() * 100) + 1;
				for(p = 0; p < kp; p++){
					text = text + my.game.mission + my.game.mission;
				}
			} else if(!my.opts.sbsg && !my.opts.sblt && my.opts.sbl1 && !my.opts.sbhk){
				text = my.game.mission;
			} else if(!my.opts.sbsg && !my.opts.sblt && !my.opts.sbl1 && my.opts.sbhk){
				text = ""
				var kp = Math.floor(Math.random() * 125) + 1;
				for(p = 0; p < kp; p++){
					text = text + my.game.mission + my.game.mission + my.game.mission + my.game.mission;
				}
			} else {
				text = "...T.T";
			}
		} else {
			text = "...T.T";
		}
		after();
	}
	function after(){
		//JLog.log("Bot_Type: Msg #AiLevel" + String(level) + ": " + text + " on All mode");
		delay += (text.length/50) * ROBOT_TYPE_COEF[level];
		setTimeout(my.turnRobot, delay/my.gameSpeed, robot, text);
	}
};
function toRegex(theme){
	return new RegExp(`(^|,)${theme}($|,)`);
}
function getMission(l){
	var arr = (l == "ko") ? Const.MISSION_ko : Const.MISSION_en;
	
	if(!arr) return "-";
	return arr[Math.floor(Math.random() * arr.length)];
}
function getAuto(theme, type){
	/* type
		0 무작위 단어 하나
		1 존재 여부
		2 단어 목록
	*/
	var my = this;
	var R = new Lizard.Tail();
	var bool = type == 1;
	
	var aqs = [[ 'theme', toRegex(theme) ]];
	var aft;
	var raiser;
	var lst = false;
	
	if(my.game.chain) aqs.push([ '_id', { '$nin': my.game.chain } ]);
	raiser = DB.kkutu[my.rule.lang].find.apply(this, aqs).limit(bool ? 1 : 123);
	switch(type){
		case 0:
		default:
			aft = function($md){
				R.go($md[Math.floor(Math.random() * $md.length)]);
			};
			break;
		case 1:
			aft = function($md){
				R.go($md.length ? true : false);
			};
			break;
		case 2:
			aft = function($md){
				R.go($md);
			};
			break;
	}
	raiser.on(aft);
	
	return R;
}