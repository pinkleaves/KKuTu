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
		getAuto.call(my, my.game.theme, 3).then(function(list){
			if(my.opts.stlong) list.sort((a, b) => a._id.length - b._id.length);
			else if(my.opts.ltshrt) list.sort((a, b) => b._id.length - a._id.length);
			else list.sort(() => Math.random() - 0.5);
			my.game.themewords = list;
			if(my.opts.mission) my.game.mission = getMission(my.rule.lang);
			my.byMaster('roundReady', {
				round: my.game.round,
				theme: my.game.theme,
				mission: my.game.mission
			}, true);
			my.game.turnTimer = setTimeout(my.turnStart, 2400/my.gameSpeed);
		});
		//my.game.themewords.sort(() => Math.random() - 0.5);
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
	my.game.turnTimer = setTimeout(my.turnEnd, Math.min(my.game.roundTime, my.game.turnTime + (100/my.gameSpeed)));
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
	getAuto.call(my, my.game.theme, 0).then(function(w){
		my.byMaster('turnEnd', {
			ok: false,
			target: target ? target.id : null,
			score: score,
			hint: w
		}, true);
		my.game._rrt = setTimeout(my.roundReady, 3000/my.gameSpeed);
	});
	clearTimeout(my.game.robotTimer);
};
exports.submit = function(client, text, data){
	var score, l, t;
	var my = this;
	var tv = (new Date()).getTime();
	var mgt = my.game.seq[my.game.turn];
	var percent = 1;
	if(!mgt) return;
	if(!mgt.robot) if(mgt != client.id) return;
	if(!my.game.theme) return;
	if(my.game.chain.indexOf(text) == -1 || my.opts.return){
		l = my.rule.lang;
		my.game.loading = true;
		function onDB($doc){
			//$doc = JSON.parse($doc);
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
					cs: client.game.score,
					ok: true,
					value: text,
					mean: $doc.mean,
					theme: $doc.theme,
					wc: $doc.type,
					score: score,
					bonus: (my.game.mission === true) ? score - my.getScore(text, t, true) : 0,
					baby: $doc.baby
				}, true);
				if(my.game.mission === true){
					my.game.mission = getMission(my.rule.lang);
				}
				setTimeout(my.turnNext, my.opts.rightgo ? my.game.turnTime / 12 : my.game.turnTime / 6);
				if(!client.robot && !my.opts.inftime && !my.opts.hack){
					if(my.opts.rightgo) percent /= 1.25;
					if(my.opts.return) percent /= 2;
					if(my.gameSpeed > 1) percent /= my.gameSpeed;
					client.invokeWordPiece(text, percent);
					my.increaseHit(text, l);
				}
			}
			function denied(code){
				if(client.noChat) text = "";
				my.game.loading = false;
				client.publish('turnError', { code: code || 404, value: text }, true);
			}
			if($doc){
				if($doc.theme.match(toRegex(my.game.theme)) == null) denied(407);
				else preApproved();
			}else{
				denied();
			}
		}
		DB.kkt[l].find(text).then(onDB);
		//DB.kkutu[l].findOne([ '_id', text ]).on(onDB);
	} else {
		if(client.noChat) text = "";
		client.publish('turnError', { code: 409, value: text }, true);
	}
};
exports.getScore = function(text, delay, ignoreMission, theme){
	var my = this;
	var tr = 1 - delay / my.game.turnTime;
	var avg = 8;
	if(tr <= 0.05) tr = 0.05;
	if(tr >= 0.75) tr = 0.75 + ((tr - 0.75)/1.4);
	if(my.game.chain && my.game.chain.length && my.game.chain.length > 20){
		var temp = 0;
		for(var i=0; i<my.game.chain.length; i++){
			temp += my.game.chain[i] ? my.game.chain[i].length : 4;
		}
		avg = temp / my.game.chain.length;
	}
	var score = Const.getPreScore(text, my.game.chain, tr, false, true, avg <= 8);
	var arr;
	if(!ignoreMission) if(arr = text.match(new RegExp(my.game.mission, "g"))){
		var W = arr.length;
		if(W>=5) W = 5+((W-5)/3.75);
		score += (score / 1.15) * 0.45 * W;
		my.game.mission = true;
	}
	if(my.opts.scboost) my.game.score *= 100000;
	return Math.round(score);
};
exports.readyRobot = function(robot){
	var my = this;
	var level = robot.level;
	var delay = ROBOT_START_DELAY[level];
	var w, text;
	
	/*getAuto.call(my, my.game.theme, 2).then(function(list){
		if(list.length){
			list.sort(function(a, b){ return b.hit - a.hit; });
			if(ROBOT_HIT_LIMIT[level] > list[0].hit) denied();
			else pickList(list);
		}else denied();
	});*/
	if(my.game.themewords.length) pickList(my.game.themewords || []);
	else denied();
	
	function denied(){
		text = "... T.T";
		after();
	}
	function pickList(list){
		if(list) do{
			if(!(w = list.shift())) break;
		}while(false);
		if(w){
			text = w._id;
			delay += 500 * ROBOT_THINK_COEF[level] * Math.random() / Math.log(1.1 + w.hit);
			if(my.game.chain.indexOf(text)!=-1){
				pickList(my.game.themewords);
				after();
			}else after();
		}else denied();
	}
	function after(){
		//JLog.log("Bot_Type: Msg #AiLevel" + String(level) + ": " + text + " on Daneo mode");
		delay += text.length * ROBOT_TYPE_COEF[level];
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
		2 단어 목록 (123개)
		3 단어 목록 (전체)
	*/
	var my = this;
	var R = new Lizard.Tail();
	var bool = type == 1;
	
	var aqs = [[ 'theme', toRegex(theme) ]];
	var aft;
	var raiser;
	var lst = false;
	
	if(my.game.chain) aqs.push([ '_id', { '$nin': my.game.chain } ]);
	if(type == 3) raiser = DB.kkutu[my.rule.lang].find.apply(this, aqs).limit([ '_id', true ]);
	else raiser = DB.kkutu[my.rule.lang].find.apply(this, aqs).limit(bool ? 1 : 123);
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
		case 3:
			aft = function($md){
				R.go($md);
			};
			break;
	}
	raiser.on(aft);
	
	return R;
}