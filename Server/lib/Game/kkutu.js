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

const ClientVersion = '4.1.3';
var GUEST_PERMISSION;
var noMode = [ "KDA", "KAD", "EDA", "EAD", "HUN", "KSD", "ESD" ];
var QLast = {};
var RoomLimit = {};
var GLOBAL = require('../sub/global.json');
var Cluster = require("cluster");
var Const = require('../const');
var Lizard = require('../sub/lizard');
var GLOBAL = require('../sub/global.json');
var ReqExp = require('../sub/reqexp');
var JLog = require('../sub/jjlog');
var Cron = require('node-cron');
// 망할 셧다운제 var Ajae = require("../sub/ajae");
var DB;
var MS = GLOBAL.MASTER;
var SHOP;
var DIC;
var ROOM;
var _rid;
var chatblocked = false;
var _roomblocked = false;
var Rule;
var guestProfiles = [];
var CHAN;
var channel = process.env['CHANNEL'] || 0;
var prid;
var ridch = false;
var SLOW = 0;
var DoS = {};
var Hwak = {};
var Penalty = {};
var Last = {};
var rLast = {};
var LastAct = {};
var isJamsuAvailable = true;
var jamsuDown = true;
const NUM_SLAVES = 4;
const GUEST_IMAGE = "/img/kkutu/guest.png";
const MAX_OKG = 18;
const ALL_OKG = 288;
const PER_OKG = 300000;
const MAX_MISSION = 3;
const hyogwa = [120, 125, 150, 190, 220, 260, 300, 340, 400, 500, 600, 800, 1000, 1250, 1500, 2000, 2500, 3000, 3750, 5000, 5000];
const MISSION_ALL = [
	[ 'Enter', 1 ],
	[ 'ClearALL', 4 ]
];
const MISSIONS = [
	[ 'SearchDict', 1 ],
	[ 'Access', [ 30, 60, 90 ] ],
	[ 'CharFactory', [ 1, 3, 5 ] ],
	[ 'ChangeDress', 1 ]
	//[ 'PlayKSH', [ 1, 2, 3 ] ],
	//[ 'PlayAllMode', [ 3, 5, 10 ] ]
];
function assignMission(){
	var MISSION = [];
	/*
		무조건 성공: 0
		쉬움: 1
		보통: 2
		어려움: 3
		
		a: 횟수 (or 시간)
		b: 난이도
		c: 보상 방식 0: EXP 1: MNY 2: ETC 3: EXP MNY (Developing)
	*/
	var used = [];
	MISSION.push({ name: MISSION_ALL[0][0], reward: 3, level: 0, goal: 1, success: false, now: 1 });
	var NOW;
	var Q;
	var isNoLv;
	while(true){
		if(MISSION.length >= 5) break;
		NOW = MISSIONS[Math.floor(Math.random()*MISSIONS.length)];
		if(used.includes(NOW[0])) continue;
		used.push(NOW[0]);
		isNoLv = typeof NOW[1] == "number";
		Q = Math.floor(Math.random()*3)+1;
		MISSION.push({ name: NOW[0], reward: Math.floor(Math.random()*2), level: isNoLv?1:Q, goal: isNoLv?NOW[1]:NOW[1][Q-1], success: false, now: 0 });
	}
	//MISSION.push({ name: MISSION_ALL[1][0], reward: 3, level: 0, goal: 4, success: false, now: 0 });
	return MISSION;
}
function levelBonus(level, evt){
	if(evt){
		var lvbonus = level>=2000?0:level*5;
		if(level>=1000) lvbonus+=level>=2000?0:Math.floor(((level-1000)*15));
		if(level>=1000&&level<2000) lvbonus+=36000*2.5;
		if(level>=1100&&level<2000) lvbonus+=36000*4;
		if(level>=1200&&level<2000) lvbonus+=36000*8;
		if(level>=1300&&level<2000) lvbonus+=36000*12;
		if(level>=1400&&level<2000) lvbonus+=36000*20;
		if(level>=1500&&level<2000) lvbonus+=36000*50;
		if(level>=1600&&level<2000) lvbonus+=36000*25;
		if(level>=1700&&level<2000) lvbonus+=36000*25;
		if(level>=1800&&level<2000) lvbonus+=36000*30;
		if(level>=1900&&level<2000) lvbonus+=72000*75;
	}else{
		var lvbonus = level>=2000?0:level*5;
		if(level>=1000) lvbonus+=level>=2000?0:Math.floor(((level-1000)*15));
		if(level>=1000&&level<2000) lvbonus+=36000*2;
		if(level>=1100&&level<2000) lvbonus+=36000*4;
		if(level>=1200&&level<2000) lvbonus+=36000*10;
		if(level>=1300&&level<2000) lvbonus+=36000*15;
		if(level>=1400&&level<2000) lvbonus+=36000*20;
		if(level>=1500&&level<2000) lvbonus+=36000*25;
		if(level>=1750&&level<2000) lvbonus+=36000*50;
		if(level>=1900&&level<2000) lvbonus+=72000*100;
	}
	return evt ? lvbonus * 1.4 : lvbonus*1.5;
}
function checkDoS(ses){
	var K = false;
	var now = new Date();
	try{
		if(DoS[ses]){
			if(now.getTime() - DoS[ses] <= 3000){
				K = true;
				DoS[ses] = now.getTime();
			}else{
				DoS[ses] = now.getTime();
				K = false;
			}
		}else{
			K = false;
			DoS[ses] = now.getTime();
		}
	}catch(e){
		JLog.log(e.toString());
		K = true;
	}
	return K;
}
exports.NIGHT = false;
exports.init = function(_DB, _DIC, _ROOM, _GUEST_PERMISSION, _CHAN){
	var i, k;
	
	DB = _DB;
	DIC = _DIC;
	ROOM = _ROOM;
	GUEST_PERMISSION = _GUEST_PERMISSION;
	CHAN = _CHAN;
	_rid = Math.floor(Math.random() * 999) + 1;
	// 망할 셧다운제 if(Cluster.isMaster) setInterval(exports.processAjae, 60000);
	DB.kkutu_shop.find().on(function($shop){
		SHOP = {};
		
		$shop.forEach(function(item){
			SHOP[item._id] = item;
		});
	});
	Rule = {};
	for(i in Const.RULE){
		k = Const.RULE[i].rule;
		Rule[k] = require(`./games/${k.toLowerCase()}`);
		Rule[k].init(DB, DIC);
	}
};
exports.initWords = function(DB, lang){
	var Lang = [ "ko", "en" ], Redis = DB.kkt[lang], v, w = 0, x, y;
	if(!Lang.includes(lang)) return console.log(`Invalid Language ${lang}`);
	Redis.flush().then(function(){
		DB.kkutu[lang].find().on(function($w){
			y = Object.keys($w).length;
			console.log(`[InitWords] Lang: ${lang}, Length: ${y}`);
			for(i in $w){
				v = $w[i];
				delete v.hit; // 필요없다.
				delete v.flag;
				Redis.hPut(v._id, JSON.stringify(v)).then(function(res){
					x = (100*(w/y)).toFixed(3)+"%";
					w++;
					if(w == y || (w % 100) === 0) console.log(`Processing: ${w}/${y} [${x}]`);
				});
			}
		});
	});
};
/* 망할 셧다운제
exports.processAjae = function(){
	var i;
	
	exports.NIGHT = (new Date()).getHours() < 6;
	if(exports.NIGHT){
		for(i in DIC){
			if(!DIC[i].isAjae){
				DIC[i].sendError(440);
				DIC[i].socket.close();
			}
		}
	}
};
*/
exports.getUserList = function(){
	var i, res = {};
	
	for(i in DIC){
		res[i] = DIC[i].getData();
	}
	
	return res;
};
exports.getRoomList = function(){
	var i, res = {};
	
	for(i in ROOM){
		res[i] = ROOM[i].getData();
	}
	
	return res;
};
exports.narrate = function(list, type, data){
	list.forEach(function(v){
		if(DIC[v]) DIC[v].send(type, data);
	});
};
exports.publish = function(type, data, _room){
	var i;
	
	if(Cluster.isMaster){
		for(i in DIC){
			DIC[i].send(type, data);
		}
	}else if(Cluster.isWorker){
		if(type == "room") process.send({ type: "room-publish", data: data, password: _room });
		else for(i in DIC){
			DIC[i].send(type, data);
		}
	}
};
exports.liblish = function(type, data, _room){
	var i;
	for(i in DIC){
		DIC[i].send(type, data);
	}
};
function botLevel(lv){
	if(lv === -1) return "구경꾼";
	if(lv === 0) return "왕초보";
	if(lv === 1) return "초보";
	if(lv === 2) return "적절";
	if(lv === 3) return "고수";
	if(lv === 4) return "사기";
	else return "?";
}
function defaultData(){
	let v = {};
	for(i in Const.GAME_TYPE){
		v[j = Const.GAME_TYPE[i]] = [0, 0, 0, 0];
		//v.record[j][3] = 0;
	}
	return v;
}
exports.Robot = function(target, place, level){
	var my = this;
	
	my.nickname = "끄투 봇";
	my.id = target + place + Math.floor(Math.random() * 1000000000);
	my.robot = true;
	my.game = { ready: true };
	my.Stats = true;
	my.data = { record: defaultData() };
	my.place = place;
	my.target = target;
	my.equip = {
		robot: true,
		Mskin: "robotskin",
	};
	my.profile = {
		image: "",
		nickname: my.nickname,
		title: my.nickname
	};
	my.getData = function(){
		return {
			id: my.id,
			robot: true,
			game: my.game,
			data: my.data,
			place: my.place,
			target: target,
			equip: my.equip,
			level: my.level,
			ready: my.Stats,
			profile: my.profile,
			score: my.score,
			goal: my.goal,
			aiLevel: level
		};
	};
	my.setStat = function(key){
		if(key == 0){
			my.game.ready = false;
			my.game.form = 'J';
		}
		if(key == 1){
			my.game.ready = true;
			my.game.form = 'J';
		}
		if(key == 2){
			my.game.ready = true;
			my.game.form = 'S';
		}
	}
	my.setLevel = function(level){
		my.nickname = botLevel(level) + " 끄투 봇";
		my.level = level;
		let exp = ReqExp.process();
		let mLv = 1;
		if(level == -1) mLv = 1;
		if(level == 0) mLv = 1 + Math.floor(Math.random()*360);
		if(level == 1) mLv = 360 + Math.floor(Math.random()*360);
		if(level == 2) mLv = 720 + Math.floor(Math.random()*281);
		if(level == 3) mLv = 1200 + Math.floor(Math.random()*301);
		if(level == 4) mLv = 1500 + Math.floor(Math.random()*126);
		my.level = mLv;
		my.score = Math.floor((exp[mLv-1] || 0) * Math.random());
		my.goal = Math.floor((exp[mLv] || 0));
		my.profile = {
			image: "",
			nickname: my.nickname,
			title: my.nickname
		};
	};
	my.setTeam = function(team){
		my.game.team = team;
	};
	my.send = function(){};
	my.obtain = function(){};
	my.pretain = function(){};
	my.invokeWordPiece = function(text, coef){};
	my.publish = function(type, data, noBlock){
		var i;
		
		if(my.target == null){
			for(i in DIC){
				if(DIC[i].place == place) DIC[i].send(type, data);
			}
		}else if(DIC[my.target]){
			DIC[my.target].send(type, data);
		}
	};
	my.chat = function(msg, code){
		my.publish('chat', { value: msg });
	};
	my.setLevel(level);
	my.setTeam(0);
};
exports.Data = function(data){
	var i, j;
	
	if(!data) data = {};
	
	this.score = data.score || 0;
	this.playTime = data.playTime || 0;
	this.connectDate = data.connectDate || 0;
	this.record = {};
	for(i in Const.GAME_TYPE){
		this.record[j = Const.GAME_TYPE[i]] = data.record ? (data.record[Const.GAME_TYPE[i]] || [0, 0, 0, 0]) : [0, 0, 0, 0];
		if(!this.record[j][3]) this.record[j][3] = 0;
	}
	// 전, 승, 점수
};
exports.WebServer = function(socket){
	var my = this;
	
	my.socket = socket;
	
	my.send = function(type, data){
		var i, r = data || {};
		
		r.type = type;
		if(socket.readyState == 1) socket.send(JSON.stringify(r));
	};
	my.onWebServerMessage = function(msg){
		try{ msg = JSON.parse(msg); }catch(e){ JLog.toConsole(e.toString()); return; }
		
		switch(msg.type){
			case 'seek':
				my.send('seek', { value: Object.keys(DIC).length });
				break;
			case 'narrate-friend':
				exports.narrate(msg.list, 'friend', { id: msg.id, s: msg.s, stat: msg.stat });
				break;
			case 'anotice':
				exports.publish('notice', { value: msg.value, noXSS: msg.noXSS });
				break;
			case 'access':
				var w;
				if(w = DIC[GLOBAL.MASTER]){
					w.send('notice', { value: `Access: [#${msg.id}] (${msg.nickname}, ${msg.ip})` });
				}
				break;
			case 'narrate-levelup':
				exports.narrate(msg.list, 'levelup', { user: msg.user, value: msg.value });
				break;
			default:
				break;
		}
	};
	socket.on('message', my.onWebServerMessage);
};
exports.Client = function(socket, profile, sid){
	var my = this;
	var gp, okg;
	if(checkDoS[sid]){
		my.id = sid;
		my.dos = true;
	}else{
		if(profile){
			my.id = profile.id;
			my.profile = profile;
			/* 망할 셧다운제
			if(Cluster.isMaster){
				my.isAjae = Ajae.checkAjae(profile.birth, profile._age);
			}else{
				my.isAjae = true;
			}
			my._birth = profile.birth;
			my._age = profile._age;
			delete my.profile.birth;
			delete my.profile._age;
			*/
			delete my.profile.token;
			delete my.profile.sid;

			if(my.profile.title) my.profile.name = "anonymous";
			my.profile.title = my.nickname || my.profile.title;
		}else{
			gp = guestProfiles[Math.floor(Math.random() * guestProfiles.length)];
			
			my.id = sid;
			my.guest = true;
			my.isAjae = false;
			my.profile = {
				id: sid,
				title: getGuestName(sid),
				image: GUEST_IMAGE
			};
			my.nickname = my.profile.title;
			my.bot = false;
		}
		my.inGame = false;
		my.prev = 0;
		my.socket = socket;
		my.place = 0;
		my.team = 0;
		my.ready = false;
		my.game = {};
		
		my.accessLast = new Date().getTime();
		
		my.subPlace = 0;
		my.error = false;
		my.blocked = false;
		my.spam = 0;
		my._pub = new Date();
		
		if(Cluster.isMaster){
			my.onOKG = function(time){
				// ?? 이럴 일이 없어야 한다.
			};
		}else{
			my.onOKG = function(time){
				var d = (new Date()).getDate();
				
				if(my.guest) return;
				if(d != my.data.connectDate){
					my.data.connectDate = d;
					my.data.playTime = 0;
					my.okgCount = 0;
				}
				my.data.playTime += time;
				
				while(my.data.playTime >= PER_OKG * (my.okgCount + 1)){
					if(my.okgCount >= MAX_OKG) return;
					my.okgCount++;
				}
				my.send('okg', { time: my.data.playTime, count: my.okgCount });
				// process.send({ type: 'okg', id: my.id, time: time });
			};
		}
		socket.on('close', function(code){
			if(ROOM[my.place]) ROOM[my.place].go(my, undefined, undefined, true);
			if(my.subPlace) my.pracRoom.go(my);
			exports.onClientClosed(my, code);
		});
		socket.on('message', function(msg){
			var data, room = ROOM[my.place];
			if(!my) return;
			if(!msg) return;
			var ipAddr = my.socket.upgradeReq.headers['x-forwarded-for'];
			//JLog.log(`Chan @${channel} Msg #${my.id}: ${msg}`);
		
			if(JSON.parse(msg).type !== 'kdn') JLog.log(`[${ipAddr}] Chan @${channel} Msg #${my.id}: ${(JSON.parse(msg).type === 'drawingCanvas' ? 'is drawing data' : msg)}`);
			try{ data = JSON.parse(msg); }catch(e){ data = { error: 400 }; }
			if(Cluster.isWorker && data.type !== 'refresh') process.send({ type: "tail-report", id: my.id, chan: channel, place: my.place, msg: data.error ? msg : data });
			
			exports.onClientMessage(my, data);
		});
		/* 망할 셧다운제
		my.confirmAjae = function(input){
			if(Ajae.confirmAjae(input, my._birth, my._age)){
				DB.users.update([ '_id', my.id ]).set([ 'birthday', input.join('-') ]).on(function(){
					my.sendError(445);
				});
			}else{
				DB.users.update([ '_id', my.id ]).set([ 'black', `[${input.join('-')}] 생년월일이 올바르게 입력되지 않았습니다. 잠시 후 다시 시도해 주세요.` ]).on(function(){
					my.socket.close();
				});
			}
		};
		*/
		my.drawingCanvas = function(msg) {
			let $room = ROOM[my.place];

			if(!$room) return;
			if(!$room.gaming) return;
			if($room.rule.rule != 'Drawing') return;

			$room.drawingCanvas(msg);
		};
		my.getData = function(gaming){
			var o = {
				id: my.id,
				guest: my.guest,
				game: {
					ready: my.ready,
					form: my.form,
					team: my.team,
					practice: my.subPlace,
					score: my.game.score,
					item: my.game.item
				}
			};
			if(!gaming){
				o.profile = my.profile;
				o.place = my.place;
				o.data = my.data;
				o.money = my.money;
				o.equip = my.equip;
				o.exordial = my.exordial;
				o.nickname = my.nickname;
				o.enhance = my.enhance;
				o.bot = my.bot;
				o.goal = ReqExp.process()[my.level-1] || ReqExp.process()[0];
				o.evtMoney = my.evtMoney;
				o.score = Number(my.score || 0);
				o.level = Number(my.level || 1);
				o.admin = GLOBAL.ADMIN.indexOf(o.id)!=-1;
			}
			return o;
		};
		my.send = function(type, data){
			var i, r = data || {};
			
			r.type = type;
			if(socket.readyState == 1) socket.send(JSON.stringify(r));
		};
		my.sendError = function(code, msg){
			my.send('error', { code: code, message: msg });
		};
		my.checkJamsu = function(time, rid){
			my.JamsuPlace = Number(rid);
			my.JamsuTimer = setTimeout(function(){
				if(my){
					if(my.place == my.JamsuPlace){
						if(DIC[MS]) DIC[MS].send('notice', { value: `[Jamsu] #${my.id} No Response #2` });
						my.send('byeroom', { id: my.JamsuPlace });
						my.leave();
					}
				}
			}, (time+2.5) * 1000);
		};
		my.JamsuCallback = function(v){
			clearTimeout(my.JamsuTimer);
			if(!v){
				if(DIC[MS]) DIC[MS].send('notice', { value: `[Jamsu] #${my.id} Pass` });
				my.send('notice', { value: '잠수 테스트에 통과하셨습니다.' });
			}else{
				if(DIC[MS]) DIC[MS].send('notice', { value: `[Jamsu] #${my.id} No Response #1` });
				if(my.place == my.JamsuPlace){
					my.leave();
					my.send('byeroom', { id: my.JamsuPlace });
				}
			}
		};
		my.publish = function(type, data, noBlock, spamCheck){
			if(type == "turnError" && my.noChat){
				if(data && data.value) data.value = "";
			}
			var i;
			var now = new Date(), st = now - my._pub;
			if(my.bot && my.place) st *= 1.5;
			if(type != 'kdn' && (!my.place || my.place && my.place > 0)){
				if((type == 'chat' && spamCheck) || type != 'chat'){
					if(st <= Const.SPAM_ADD_DELAY) my.spam++;
					else if(st >= Const.SPAM_CLEAR_DELAY){
						my.spam = 0;
						my.blocked = false;
					}
					if(my.spam >= ((my.bot || (my.place && ROOM[my.place] && ROOM[my.place].opts.dobae)) && my.place ? Const.SPAM_LIMIT * 1.75 : Const.SPAM_LIMIT)){
						if(!my.blocked) my.numSpam = 0;
						my.blocked = true;
					}
					if(!noBlock){
						my._pub = now;
						if(my.blocked){
							if(st < Const.BLOCKED_LENGTH){
								if(++my.numSpam >= Const.KICK_BY_SPAM){
									if(Cluster.isWorker) process.send({ type: "kick", target: my.id });
									return my.socket.close();
								}
								return spamCheck ? true : my.send('blocked');
							}else my.blocked = false;
						}
					}
				}
			}
			try{if(type == 'chat' && data.value == '') return;}catch(e){}
			data.profile = my.profile;
			data.profile.title = my.nickname;

			if(my.subPlace && type != 'chat') my.send(type, data);
			else for(i in DIC){
				if(DIC[i].place == my.place) DIC[i].send(type, data);
			}
			if(Cluster.isWorker && type == 'user') process.send({ type: "user-publish", data: data });
		};
		my.chat = function(msg, code, r){
			var GLOBAL = require('../sub/global.json');
			var admincheck = GLOBAL.ADMIN.indexOf(my.id) != -1;
			var mgmtcheck = GLOBAL.MGMTUSER.indexOf(my.id) != -1;
			var du, da = "";
			//if(my.publish('chat', { value: '', notice: false }, undefined, true) == true) return my.send('blocked');
			if(my.noChat || (my.noLobby && !my.place)){
				my.send('notice', { value: '채팅을 이용할 수 없습니다.' });
				return;
			}
			if(!my.place) my.send('slow', { q: SLOW });
			else if(my.place){
				let $room = ROOM[my.place];
				try{
					var kka = $room.slow;
				}catch(e){
					var kka = 0;
				}
				my.send('roomslow', { i: my.place, q: kka });
			}
			if(msg.substr(0, 10) == '#SLOWMODE '){
				if(admincheck || mgmtcheck){
					msg = msg.replace('#SLOWMODE ', '');
					if(msg == 'OFF') var jtime = 0;
					else var jtime = Number(msg);
					if(jtime > 30) return;
					SLOW = jtime;
					exports.liblish('slow', { q: SLOW });
					return;
				}
			}
			if(msg == '#CHATBLOCK ON'){
				if(admincheck || mgmtcheck){
					my.send('notice', { value: 'Chat Block ON' });
					chatblocked = true;
					return;
				}
			}
			if(msg == '#CHATBLOCK OFF'){
				if(admincheck || mgmtcheck){
					my.send('notice', { value: 'Chat Block OFF' });
					chatblocked = false;
					return;
				}
			}
			if(msg == '#ROOMBLOCK ON'){
				if(admincheck || mgmtcheck){
					my.send('notice', { value: 'Room Block ON' });
					_roomblocked = true;
					return;
				}
			}
			if(msg == '#ROOMBLOCK OFF'){
				if(admincheck || mgmtcheck){
					my.send('notice', { value: 'Room Block OFF' });
					_roomblocked = false;
					return;
				}
			}
			if(msg.toLowerCase() == '#clearchat' || msg.toLowerCase() == '#cleanchat' || msg.toLowerCase() == '#chatclear' || msg.toLowerCase() == '#chatclean'){
				if(admincheck){
					if(Cluster.isMaster) my.publish('chatclear', { error: false });
					else if(Cluster.isWorker) exports.publish('chatclear', { error: false });
					return;
				}
			}
			if(msg.substr(0, 10) == '#ROOMSLOW '){
				try{
					var ks = msg.replace('#ROOMSLOW ', '');
					var ki = ks.split(' ');
					var raid = ki[0];
					var $room = ROOM[Number(raid)];
					if(!$room){
						JLog.log(`ROOMSLOW ERROR: NO ROOM EXIST [${raid}]`);
						return;
					}else{
						var jk = Number(raid) == my.place && $room.master == my.id;
						if(jk){
							var st = Number(ki[1]);
							if(st > 30) return;
							$room.slow = st;
							my.publish('roomslow', { i: Number(raid), q: st });
							return;
						}
					}
				}catch(e){
					JLog.log(e.toString());
				}
			}
			if(msg.substr(0, 10) == '!ROOMSLOW '){
				try{
					var ks = msg.replace('!ROOMSLOW ', '');
					var ki = ks.split(' ');
					var raid = ki[0];
					var $room = ROOM[Number(raid)];
					if(!$room){
						JLog.log(`ROOMSLOW ERROR: NO ROOM EXIST [${raid}]`);
						return;
					}else{
						if(admincheck){
							var st = Number(ki[1]);
							if(st > 30) return;
							$room.slow = st;
							my.publish('roomslow', { i: Number(raid), q: st });
							return;
						}
					}
				}catch(e){
					JLog.log(e.toString());
				}
			}
			if(my.noChat) return my.send('chat', { notice: true, code: 443 });
			if(chatblocked && !my.place && !admincheck) return my.send('chat', { notice: true, code: 985 });
			if(admincheck) return my.publish('chat', { value: msg, notice: code ? true : false, code: code });
			var kk = new Date();
			var mn = kk.getTime() / 1000;
			if(mn - Last[my.id] < SLOW && !my.place){
				var slo = SLOW - (mn - Last[my.id]);
				slo = slo >= 1 ? Math.floor((SLOW - (mn - Last[my.id]))) : Math.floor((SLOW - (mn - Last[my.id])) * 10) / 10;
				if(slo < 0.1) slo = '잠시 후';
				else slo = String(slo) + '초 후';
				return my.send('notice', { value: `슬로우 모드가 적용되었습니다. ${slo}에 채팅이 가능합니다.` });
			}
			try{
				if(my.place){
					let $room = ROOM[my.place];
					if(mn - rLast[my.id] < $room.slow){
						var slo = $room.slow - (mn - rLast[my.id]);
						slo = slo >= 1 ? Math.floor(($room.slow - (mn - rLast[my.id]))) : Math.floor(($room.slow - (mn - rLast[my.id])) * 10) / 10;
						if(slo < 0.1) slo = '잠시 후';
						else slo = String(slo) + '초 후';
						return my.send('notice', { value: `슬로우 모드가 적용되었습니다. ${slo}에 채팅이 가능합니다.` });
					}
					rLast[my.id] = kk.getTime() / 1000;
				}
			}catch(e){
				
			}
			//var kk = new Date();
			Last[my.id] = kk.getTime() / 1000;
			/*try{
				if(r){
					if(r == "r"){
						if(msg.indexOf('>')!=-1 || msg.indexOf('<')!=-1) return;
						if(my.box['rainbow_chat']){
							if(my.box['rainbow_chat'] -= 1 <= 0) delete my.box['rainbow_chat'];
							my.publish('chat', { value: msg, notice: false, rainbow: true });
							my.flush(my.box);
							return;
						}
					}
				}
			}catch(err){
				JLog.log(err.toString());
			}*/
			my.publish('chat', { value: msg, notice: code ? true : false, code: code });
		};
		my.kdn = function(){
			//my.publish('kdn', { id: my.id });
		};
		my.levelup = function(v){
			var GLOBAL = require('../sub/global.json');
			if(!my.admin) return;
			if(GLOBAL.MASTER !== my.id) return;
			v = Number(v);
			if(!v || isNaN(v) || (v % 1) || v < 1 || v > 2000) return my.send('notice', { value: "Input correct value. #1" });
			var w = ReqExp.getLevel(my.data.score);
			if(w + v > 2000) return my.send('notice', { value: 'Input correct value. #2' });
			var t = ReqExp.process();
			var k = (t[(w+v)-2] || t[0]) - my.data.score;
			var p = Number(my.data.score) + k;
			my.data.score = p;
			var x = ReqExp.getLevel(my.data.score);
			DB.users.update([ '_id', my.id ]).set([ 'kkutu', my.data ]).on(function(){
				my.processLevelNotice(w, x, my.nickname);
				my.send('notice', { value: 'Obtained EXP: '+commify(k) });
				my.send('updateme', { kkutu: my.data });
				return;
			});
		};
		my.hwak = function(msg, item){
			
			if(my.box && my.box[item]){
				item = my.box[item];
				item.enhance = my.enhance[item] || 0;
			}else item = undefined;
			
			if(my.guest) return;
			if(!msg || msg.replace(/\s/g, '') == "") return;
			msg = msg.substr(0, 200);
			if(my.noChat) return my.send('notice', { value: '확성기를 이용할 수 없습니다.' });
			if(Cluster.isMaster){
				DB.users.findOne([ '_id', my.id ]).on(function($hwak){
					if(!$hwak) return;
					if(!$hwak.fingerprint || $hwak.fingerprint == null || $hwak.fingerprint == undefined) return;
					//var fp = $hwak.fingerprint;
					var fp = my.socket.upgradeReq.headers['x-forwarded-for'];
					var Time = new Date().getTime();
					var prev;
					if(prev = Hwak[fp]){
						if(Time - Number(prev) < 300000 && !my.admin) return my.send('notice', { value: '확성기는 5분에 1회 사용 가능합니다.' });
						else{
							Hwak[fp] = Time;
							exports.publish('hwak', { value: msg, sender: my.id, item: item });
						}
					}else{
						Hwak[fp] = Time;
						exports.publish('hwak', { value: msg, sender: my.id, item: item });
					}
				});
			}
		};
		my.postItem = function(item, cost){
			my.checkExpire();
			if(my.guest) return;
			if(!my.box[item]) return;
			if(!my.fingerprint) return;
			var Id = Math.floor(Date.now()+(Math.random()*100000000));
			DB.trade.findOne([ '_id', Id ]).on(function(_tr){
				var sx;
				if(_tr) return;
				else{
					DB.trade.insert(
						[ '_id', Id ],
						[ 'cost', Number(cost) ],
						[ 'item', item ],
						[ 'due', Date.now() + 60 * 60 * 24 * 1000 ],
						[ 'expire', (sx = my.box[item].expire) ? sx : -1 ],
						[ 'user', { id: my.id, pf: my.fingerprint } ],
						[ 'finished', false ],
						[ 'enhance', my.enhance[item] || 0 ]
					).on(function($done){
						delete my.box[item];
						my.flush(my.box);
					});
				}
			});
		};
		my.checkExpire = function(){
			var now = new Date();
			var d = now.getDate();
			var i, expired = [];
			var gr;
			
			now = now.getTime() * 0.001;
			if(d != my.data.connectDate){
				my.data.connectDate = d;
				my.data.playTime = 0;
			}
			for(i in my.box){
				if(!my.box[i]){
					delete my.box[i];
					continue;
				}
				if(i == "CDCoin"){
					delete my.box[i];
					expired.push(i);
					continue;
				}
				if(!my.box[i].expire) continue;
				if(my.box[i].expire < now){
					gr = SHOP[i].group;
					
					if(gr.substr(0, 3) == "BDG") gr = "BDG";
					if(my.equip[gr] == i) delete my.equip[gr];
					delete my.box[i];
					expired.push(i);
				}
			}
			if(expired.length){
				my.send('expired', { list: expired });
				my.flush(my.box, my.equip);
			}
		};
		my.nickchange = function(nik){
			//DIC[my.id].nickname = 
			try{
				/*if(my.guest){
					R.go({ result: 400 });
				}
				DB.users.findOne([ '_id', my.id ]).on(function($nir){
					if(!$nir) return;
					if(!$nir.nikc) return;
					if($nir.nikc == 0) return;
					DB.users.update([ '_id', my.id ]).set([ 'nikc', 0 ]).on();
					my.nickname = $nir.nickname;
					exports.liblish('nikc', { value: $nir.nickname, usr: my.id });
					R.go({ result: 200 });
				});*/
				if(!my.guest) my.nickname = nik;
			}catch(e){
				JLog.log(err.toString());
			}
		};
		my.rank = function(id, pg, type){
			if(type === "redis"){
				type = "redis2";
				let db = DB[type], t, v = [], temp, cor = !1, rnk, send = [], lk = 0;
				
				db.getAll(true).then(function($v){
					try{
					for(t in $v){
						temp = JSON.parse($v[t]);
						temp.id = t;
						v.push(temp);
					}
					v.sort(function(a, b){
						if(b.level == a.level) return b.score - a.score;
						else return b.level-a.level;
					});
					for(t in v){
						temp = v[t];
						temp.rank = Number(lk);
						v[lk] = temp;
						lk+=1;
					}
					for(var i=(pg*15); i<(15*pg)+15; i++){
						if(v[i]) send.push(v[i]);
						else break;
					}
					my.send('rankData', { data: send });
					if(id){
						return my.send('notice', { value: '일시적으로 사용이 제한된 기능입니다.' });
						for(t in v){
							if(v[t].id == id){
								cor = true;
								rnk = v[t].rank;
								break;
							}
						}
						if(cor){
							for(var i=0; i<15; i++){
								if(v[rnk]) send.push(v[rnk]);
								rnk += 1;
							}
							return my.send('rankData', { data: v });
						}
					}
					}catch(e){console.log(e);}
				});
				return;
			}
			if(!DB[type] || !DB[type].getPage) return;
			if(id){
				DB[type].getSurround(id, 15).then(function($body){
					if($body){
						var preva = onRank($body, $body, type);
					}
				});
			}else{
				if(isNaN(pg)) pg = 0;
				DB[type].getPage(pg, 15).then(function($body){
					if($body){
						onRank($body, $body, type);
					}
				});
			}
			function onRank(list, $body, type){
				var gnk = {};
				
				Lizard.all(list.data.map(function(v){
					if(gnk[v.id]) return null;
					else{
						gnk[v.id] = true;
						return getProfile(v.id);
					}
				})).then(function(data){
					my.send('rank', { data: $body, list: data, ranktype: type });
				});
			}
			function getProfile(id){
				var R = new Lizard.Tail();
				
				if(id) DB.users.findOne([ '_id', id ]).on(function($u){
					try{
						R.go({ nick: $u.nickname, prev: $u.rank });
					}catch(e){
						R.go({ nick: null, prev: null });
					}
				}); else R.go({ nick: null, prev: null });
				return R;
			}
		};
		my.exordialc = function(){
			try{
				var R = new Lizard.Tail();
				if(my.guest){
					R.go({ result: 400 });
				}
				DB.users.findOne([ '_id', my.id ]).on(function($nir){
					if(!$nir) return;
					if(!$nir.exordial) return;
					my.exordial = $nir.exordial;
					exports.liblish('exoc', { value: $nir.exordial, usr: my.id });
					R.go({ result: 200 });
				});
			}catch(err){
				JLog.log(err.toString());
			}
		};
		my.checkClientVersion = function(){
			my.send('getVersion', { value: true });
			setTimeout(function(){
				if(!my.hasOwnProperty('ClientVersion')){
					return my.send('notice', { value: '클라이언트 버전 정보를 확인할 수 없습니다. 정상적인 서비스 이용을 위해 가급적 재접속을 진행하여 주시기 바랍니다.' });
				}
			}, 7500);
		};
		my.checkCallback = function(ver){
			my.ClientVersion = ver == 'SKKuTu' ? ClientVersion : ver;
			if(my.ClientVersion != ClientVersion) return my.send('yell', { value: '적용되지 않은 클라이언트 패치/업데이트가 있습니다.<br>Shift+F5를 클릭하여 재접속을 하시면 적용됩니다.' });
		};
		my.renderRes = function(data, clear, me){
			delete data.data._id;
			data.data.acv = {value:clear||0,level:data.data.acv.level};
			data.data.lvl = {value:my.level,level:data.data.lvl.level};
			data.data.enc = {value:Number(me.encmoney||0),level:data.data.enc.level};
			data.data.etr = {value:Number(me.enctry||0),level:data.data.etr.level};
			data.data.acs = {value:Number(me.chulseok||0),level:data.data.acs.level};
			return data;
		};
		my.getClears = function($av, acv, res){
			var _av = $av, _acv = acv, _res = res, i, cType, cur, cl = 0;
			for(i in _acv){
				if(!_av[i]) _av[i] = {};
				if(!_av[i].level) _av[i].level = 0;
				if(!_av[i].value) _av[i].value = 0;
				cType = _acv[i][0].type;
				_acv[i].sort(function(a,b){return a.goal-b.goal});
				pri = _res.data[i].level;
				for(var j=0; j<_acv[i].length; j++){
					cur = _acv[i][j];
					if(cur.goal<=_res.data[i].value){
						cl++;
					}
				}
			}
			return cl;
		};
		my.checkAcv = function(force){//force: 사용자가 직접 과제를 요청했는가?
			if(my.guest) return;
			var i, v, q, acv = {}, _acv = [], cType, cur, pri, reward = { exp: 0, mny: 0, etc: {} }, isReward = false, clears = 0;
			DB.users.findOne([ '_id', my.id ]).on(function($me){
				my.initAcv(force).then(function(res){
					if(!res.s) return;
					DB.acv.find().on(function($av){
						for(i in $av){
							v = $av[i];
							if(!acv[v.type]) acv[v.type] = [v];
							else acv[v.type].push(v);
						}
						clears = my.getClears($av, acv, res);
						res = my.renderRes(res, clears, $me);
						//console.log('#'+my.id);
						//console.log(res);
						try{
							for(i in acv){
								if(!$av[i]) $av[i] = {};
								if(!$av[i].level) $av[i].level = 0;
								if(!$av[i].value) $av[i].value = 0;
								cType = acv[i][0].type;
								acv[i].sort(function(a,b){return a.goal-b.goal});
								//1단계부터 순차적으로 확인한다.
								pri = res.data[i].level;
								for(var j=0; j<acv[i].length; j++){
									if((j+1)<=pri) continue;//현 단계보다 res.data의 단계가 높으면..
									cur = acv[i][j];//현재 레벨의 요구 수치이다.
									if(cur.goal<=res.data[i].value){
										// 도전 과제가 완료되었다!
										isReward = true;
										if(cur.reward){
											reward.exp += cur.reward.exp || 0;
											reward.mny += cur.reward.mny || 0;
											if(cur.reward.etc){
												for(q in cur.reward.etc){
													reward.etc[q] = reward.etc[q] ? reward.etc[q] + 1 : 1;
												}
											}
										}
										res.data[i].level = (Number(res.data[i].level || 0) || 0) + 1;
										my.send('acv', { acv: acv[i][j]._id });
										DB.acv.update([ '_id', acv[i][j]._id ]).set([ 'clear', (Number(acv[i][j].clear) || 0) + 1 ]).on();
									}
								}
							}
							DB.uacv.update(["_id",my.id]).set(res.data).on();
						}catch(e){
							JLog.toConsole(`Error Occurred on Acv / Ignored current Check.`);
							console.log(e.toString());
							return;
						}
						try{
							for(i in acv){
								if(!$av[i]) $av[i] = {};
								if(!$av[i].level) $av[i].level = 0;
								if(!$av[i].value) $av[i].value = 0;
								cType = acv[i][0].type;
								acv[i].sort(function(a,b){return a.goal-b.goal});
								//1단계부터 순차적으로 확인한다.
								pri = res.data[i].level;
								for(var j=0; j<acv[i].length; j++){
									if((j+1)<=pri) continue;//현 단계보다 res.data의 단계가 높으면..
									cur = acv[i][j];//현재 레벨의 요구 수치이다.
									if(cur.goal<=res.data[i].value){
										// 도전 과제가 완료되었다!
										isReward = true;
										if(cur.reward){
											reward.exp += cur.reward.exp || 0;
											reward.mny += cur.reward.mny || 0;
											if(cur.reward.etc){
												for(i in cur.reward.etc){
													reward.etc[i] = reward.etc[i] ? reward.etc[i] + 1 : 1;
												}
											}
										}
										res.data[i].level += 1;
										my.send('acv', { acv: acv[i][j]._id });
										DB.uacv.update(["_id",my.id]).set(res.data).on();
									}
								}
							}
						}catch(e){
							if(typeof i !== "undefined") JLog.toConsole(`Error on ${i}`);
							JLog.toConsole(`Error Occurred on Acv2 / Ignored current Check.`);
							console.log(e.toString());
							return;
						}
						if(isReward){
							if(reward.exp){
								if(my.level < 3000){
									my.score += reward.exp;
									my.send('notice', { value: `도전 과제 완료 보상으로 ${commify(reward.exp)} 경험치를 획득하셨습니다.` });
								}else my.send('notice', { value: `이미 최대 레벨이므로 경험치를 획득할 수 없습니다.` });
							}if(reward.mny){
								my.money += reward.mny;
								my.send('notice', { value: `도전 과제 완료 보상으로 ${commify(reward.mny)}핑이 지급되었습니다.` });
							}if(reward.etc && JSON.stringify(reward.etc) != "{}"){
								for(i in reward.etc){
									// 획득 처리
									cur = reward.etc[i];
									my.obtain(i,cur);
									my.send('notice', { value: `도전 과제 완료 보상으로 ${i == 'boxB2' ? "희귀 휘장 상자" : "??"}가 ${cur}개 지급되었습니다.` });
								}
							}
							my.flush(true);
							my.send('updateme', { kkutu: my.data, money: my.money });
							//DB.users.update([ '_id', my.id ]).set([ 'kkutu', my.data ], [ 'money', my.money ], [ 'box', my.box ]).on();
						}
					});
				});
			});
		};
		my.initAcv = function(fc){
			var R = new Lizard.Tail();
			var def = {value:0,level:0};
			DB.uacv.findOne(['_id',my.id]).on(function(_res){
				if(_res) R.go({s:true,init:false,data:_res});
				else if(fc){
					DB.uacv.insert(
						[ '_id', my.id ],
						[ 'acs', def ],
						[ 'acv', {value:1,level:0} ],
						[ 'enc', def ],
						[ 'etr', def ],
						[ 'lvl', def ],
						[ 'scr', def ],
						[ 'wpa', def ],
						[ 'bx2', def ]
					).on(function(res){
						DB.uacv.findOne(['_id',my.id]).on(function(__res){
							R.go({s:true,init:true,data:__res});
						});
					});
				}else R.go({s:false,init:false,data:null});
			});
			return R;
		};
		my.getInfo = function(id, nick){
			var rank;
			var temp = {};
			var i, w;
			var Avail = [ "kkutu", "exordial", "nickname", "_id" ];
			if(id && nick) return my.send('bot.error', { message: 'Only id or nickname should be given.' });
			if(!id && !nick) return my.send('bot.error', { message: 'Id or nickname should be given.' });
			if(!my.bot || my.guest) return;
			else{
				DB.users.findOne(id ? [ '_id', id ] : [ 'nickname', nick ]).on(function($bot){
					if(!$bot) return my.send('bot.user', { data: null });
					else{
						for(i in Avail){
							w = Avail[i];
							if(w == "kkutu"){
								temp["data"] = new exports.Data($bot.kkutu);
							}else temp[w] = $bot[w];
						}
						DB.redis.getGlobal($bot._id).then(function(r){
							if(!isNaN(Number(r))) rank = r;
							else rank = undefined;
							temp["rank"] = rank;
							my.send('bot.user', { data: temp });
						});
					}
				});
			}
		};
		my.processBlack = function(black2, level){
			my.blacklv = level;
			if(!black2 || black2 == "null") return false;
			if(black2 == "chat" && !level){
				my.noChat = true;
				return false;
			}
			/*
				0, 기존 게임 이용 제한
				1, 채팅 금지 (로비만)
				2, 채팅 금지 (전체)
				3, 제재 Lv1 (경험치/핑 20%만 지급, 커뮤니티 제한)
				4, 제재 Lv2 (경험치/핑 10%만 지급, 커뮤니티 제한)
				5, 게임 이용 제한 (접속만 가능)
			*/
			if(level && level !== 0){
				if(level === 1){
					my.noLobby = true;
				}else if(level === 2){
					my.noChat = true;
				}else if(level === 3){
					my.penalty = 1;
					my.disableCommunity();
				}else if(level === 4){
					my.penalty = 2;
					my.disableCommunity();
				}else if(level === 5){
					my.disableCommunity();
					my.onlyAccess = true;
				}
				return false;
			}
			if(!level || level === 0){ return true; }
			return false;
		};
		my.disableCommunity = function(){
			my.noChat = true;
			my.noWhisper = true;
			my.noHwak = true;
			my.svAvail = true;
		};
		my.noticeBlack = function(r, du){
			if(r && r != "null"){
				var da, du, mss;
				if(du && du > 0){
					du = new Date(Number(du));
					mss = du.getMonth() + 1;
					da = du.getFullYear() + '년 ' + mss + '월 ' + du.getDate() + '일 ';
					da += fullt(du) + ' 까지';
				}else da = "무기한";
				if(my.noLobby) my.send('notice', { value: `관리자에 의해 회원님의 로비 채팅 이용이 제한되었습니다.<br><br>제재 사유: ${r}<br>제재 기간: ${da}` });
				if(my.noChat) my.send('notice', { value: `관리자에 의해 회원님의 채팅 이용이 제한되었습니다.<br><br>제재 사유: ${r}<br>제재 기간: ${da}` });
			}
		};
		my.getTotalEnhance = function(){
			var i, j, t = 0;
			if(!my.enhance || !my.equip) return 0;
			for(i in my.enhance){
				for(j in my.equip){
					if(my.equip[j] == i && j.toLowerCase() != "mskin") t += my.enhance[i];
				}
			}
			return t || 0;
		};
		my.getEnhanceBonus = function(){
			var bn = 0;
			var v = my.getTotalEnhance();
			if(v >= 200) bn += 1;
			if(v >= 190) bn += 0.7;//총합 0.7
			if(v >= 150) bn += 0.5;//1.2
			if(v >= 100) bn += 0.3;//1.5
			if(v >= 70) bn += 0.3;//1.8
			if(v >= 30) bn += 0.2;//2.0
			return bn;
		}
		my.refresh = function(start){
			var R = new Lizard.Tail();
			var GLOBAL = require('../sub/global.json');
			var ip = my.socket.upgradeReq.headers['x-forwarded-for'];
			if(!ip){
				my.socket.send(JSON.stringify({ type: 'alert', code: 998 }));
				my.socket.close();
				return;
			}
			DB.black_ip.findOne([ 'ip', ip ]).on(function($gy){
				if(!!$gy){
					if(($gy.blackt && Number($gy.blackt) > Date.now()) || !$gy.blackt || $gy.blackt < 0){
						JLog.log(`Black IP [${ip}] by ${my.id}`);
						my.socket.send(JSON.stringify({ type: 'alert', code: 999 }));
						my.socket.close();
						return;
					}
				}
			});
			if(my.guest){
				my.equip = {};
				my.data = new exports.Data();
				my.money = 0;
				my.friends = {};
				
				R.go({ result: 200 });
			}else DB.users.findOne([ '_id', my.id ]).on(function($user){
				var first = !$user;
				var ble = false;
				try{
					if($user.hasOwnProperty('blackt') && $user.blackt != null && $user.blackt != undefined && $user.black){
						if($user.blackt < 0) ble = false;
						else ble = $user.blackt;
					}
				}catch(e){}
				var blackend = ble ? $user.blackt <= Date.now() : false;
				if(!first && blackend && ($user.black != "null" && $user.black != "")){
					DB.users.update([ '_id', my.id ]).set([ 'blackt', 0 ], [ 'black', 'null' ]).on();
					$user.black = "";
					JLog.log(`UNBAN [${my.id}]`);
				}
				var black = first ? "" : $user.black;
				var blacklv = $user && $user.blacklv ? $user.blacklv : 0;
				var kss = new Date();
				var ss = false;
				var fakess = false;
				var jss = String(kss.getFullYear()) + String(kss.getMonth()) + String(kss.getDate());
				var weekend = kss.getDay() == 6 || kss.getDay() == 0;
				if(first){ $user = { money: 0, lastaccess: Number(jss) };
					fakess = true;
				}else{
					if(!$user.lastaccess) ss = true;
					else if($user.lastaccess != jss) ss = true;
				}
				if(ss || fakess){
					DB.users.update([ '_id', my.id ]).set([ 'lastaccess', Number(jss) ]).on();
				}
				if(black == "null") black = false;
				/*if(black == "chat"){
					black = false;
					my.noChat = true;
				}*/
				if(my.processBlack(black, Number(blacklv))) black = true;
				else black = false;
				
				if(!my.last) my.last = 1;
				if(!rLast[my.id]) rLast[my.id] = 1;
				if(!Last[my.id]) Last[my.id] = 1;
				var pst;
				var cdval = 30;
				if(!$user.accessTime) $user.accessTime = { date: jss, time: 0 };
				if($user.accessTime.date != jss){
					my.accessTime = 0;
					$user.accessTime = { date: jss, time: 0 };
				}
				/* 망할 셧다운제
				if(Cluster.isMaster && !my.isAjae){ // null일 수는 없다.
					my.isAjae = Ajae.checkAjae(($user.birthday || "").split('-'));
					if(my.isAjae === null){
						if(my._birth) my._checkAjae = setTimeout(function(){
							my.sendError(442);
							my.socket.close();
						}, 300000);
						else{
							my.sendError(441);
							my.socket.close();
							return;
						}
					}
				}*/
				if(my.accessTime) $user.accessTime.time = my.accessTime;
				my.exordial = $user.exordial || "";
				my.nickname = $user.nickname || "";
				my.stat = $user.stat || {exp:0,mny:0};
				my.enhance = $user.enhance || {};
				my.equip = $user.equip || {};
				my.box = $user.box || {};
				my.accessTime = $user.accessTime.time;
				my.data = new exports.Data($user.kkutu);
				//if(my.data.score && !Number($user.level) && !Number($user.score)) my.changeLevel();
				my.money = Number($user.money);
				my.evtMoney = Number($user.evtMoney || 0) || 0;
				my.friends = $user.friends || {};
				my.bot = $user.bot || 0;
				my.level = $user.level || 1;
				my.score = $user.score || 0;
				var now = Date.now();
				if(Cluster.isMaster && my.prev && my.inGame && (!my.place || (my.place && ROOM[my.place] && !ROOM[my.place].gaming)) && !my.bot && isJamsuAvailable){
					//var now = Date.now();
					var mgmt = GLOBAL.MGMTUSER.includes(my.id) || GLOBAL.DESIGN.includes(my.id) || GLOBAL.WORDUSER.includes(my.id);
					var gm = GLOBAL.ADMIN.includes(my.id);
					var kv = my.getEnhanceBonus();
					var Acs = (now - my.prev)/1000; // 시간 (단위: 초)
					var Reward = (Math.pow(getLvBonus(my.level, true), 1.075)*600)/60;
					var _prev = my.level;
					if(kss.getHours() < 8) Reward *= 0.7;
					var Rw = Math.floor(Reward*Acs*4.7*2/(jamsuDown ? 2 : 1));
					if(my.score) my.score = (Number(my.score || 0) || 0) + Rw;
					if(mgmt) my.score += Math.floor(Rw * 0.4);
					if(gm) my.score += Math.floor(Rw * 1);
					var _now = my.level;
					var _per = 100 * (Rw / (ReqExp.process(true)[_prev-1] || 1));
					_per = _per.toFixed(4);
					my.processLevelNotice(_prev, _now, my.nickname);
					JLog.log(`[AccessEXP] #${my.id}: [Level: ${_prev}, Exp: ${Rw}, ${_per}%]`);
					if(mgmt){
						_per = 100 * (Math.floor(Rw * 0.4) / (ReqExp.process(true)[_prev-1] || 1));
						JLog.log(`[AccessEXP] #${my.id}: [Level: ${_prev}, Exp: ${Math.floor(Rw*0.4)}, ${(_per).toFixed(4)}%] (Bonus)`);
					}
					if(kv){
						my.score += Math.floor(Rw * kv);
						_per = 100 * (Math.floor(Rw * kv) / (ReqExp.process(true)[_prev-1] || 1));
						JLog.log(`[AccessEXP] #${my.id}: [Level: ${_prev}, Exp: ${Math.floor(Rw*kv)}, ${(_per).toFixed(4)}%] (Enhance / Total ${kv})`);
					}
					DB.users.update([ '_id', my.id ]).set([ 'kkutu', my.data ], [ 'score', my.score ], [ 'level', my.level ]).on(function($ud){
						my.send('updateme', { score: my.score, level: my.level, goal: my.goal });
						my.send('jamsuExp', { value: Rw });
						if(mgmt) my.send('jamsuExp', { value: Math.floor(Rw * 0.4) });
						if(gm) my.send('jamsuExp', { value: Rw });
						if(kv) my.send('jamsuExp', { value: Math.floor(Rw * kv) });
					});
				}
				my.inGame = true;
				my.prev = now;
				if(first) my.flush();
				else{
					my.checkExpire();
					my.checkAcv(false);
					my.okgCount = Math.floor((my.data.playTime || 0) / PER_OKG);
				}
				if(!my.guest){
					DB.users.update([ '_id', my.id ]).set([ 'accessTime', $user.accessTime ]).on();
					if(!$user.post){
						$user.post = {};
						DB.users.update([ '_id', my.id ]).set([ 'post', $user.post ]).on();
					}
					if(!$user.mission){
						$user.mission = { mission: assignMission(), date: jss };
						DB.users.update([ '_id', my.id ]).set([ 'mission', $user.mission ]).on();
					}
					if($user.mission.date != jss){
						$user.mission = { date: jss, mission: assignMission() };
						DB.users.update([ '_id', my.id ]).set([ 'mission', $user.mission ]).on();
					}
					var GOT = false;
					var rewardArrived = '우편함에 보상 도착! 우측 상단의 메뉴 (<i class="fa fa-bars"></i>) 에서 우편함 (<i class="fa fa-envelope"></i>) 을 클릭하여 보상을 확인해 보세요!';
					if($user.mission && $user.mission.date == jss){
						var M;
						var PREV = {m:JSON.stringify($user.mission),p:JSON.stringify($user.post)};
						for(i in $user.mission.mission){
							M = $user.mission.mission[i];
							if(M.name == 'Access'){
								$user.mission.mission[i].now = Math.floor(my.accessTime/60000) >= M.goal ? M.goal : Math.floor(my.accessTime/60000);
							}
							if(M.goal <= M.now && !M.success){
								$user.mission.mission[i].success = true;
								if(M.name == 'Enter'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									JLog.log(`[${my.id}] DailyMission Cleared`);
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: {exp:{amount:Math.ceil((Math.random()+1)*70*(levelBonus(my.level)/1.275))},mny:{amount:Math.floor(Math.random()*100000)+100000}}};
								}
								if(M.name == 'Access'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((1+(M.level/6))*(Math.random()+1)*40*(levelBonus(my.level)/1.275)) }}:{mny:{amount:Math.floor(Math.random()*20000*(1+(M.level/6)))+30000 }}};
								}
								if(M.name == 'CharFactory'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((Math.random()+1)*10*(levelBonus(my.level)/1.275)) }}:{mny:{amount:Math.floor(Math.random()*20000*(1+(M.level/6)))+10000 }}};
								}
								if(M.name == 'ChangeDress'){
									GOT = true;
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((Math.random()+1)*10*(levelBonus(my.level)/1.275)) }}:{mny:{amount:Math.floor(Math.random()*10000)+10000 }}};
								}
								if(M.name == 'SearchDict'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((Math.random()+1)*5*(levelBonus(my.level)/1.275)) }}:{mny:{amount:Math.floor(Math.random()*5000*(1+(M.level/6)))+5000 }}};
								}
								if(M.name == 'DictPage'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((Math.random()+1)*10*(levelBonus(my.level)/1.275)) }}:{mny:{amount:Math.floor(Math.random()*2500*(1+(M.level/6)))+2500 }}};
								}
								if(M.name == 'PlayAllMode'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount: Math.ceil((Math.random()+1+M.level)*10*(levelBonus(my.level)/1.275)) }}:{mny:{amount:Math.floor(Math.random()*2000*(1+(M.level/6)))+2000 }}};
								}
							}
						}
						if(PREV.m != JSON.stringify($user.mission) || PREV.p != JSON.stringify($user.post)){
							DB.users.update([ '_id', my.id ]).set([ 'post', $user.post ], [ 'mission', $user.mission ]).on();
						}
					}
					if(ss){
						$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = {
							name: '강화 비용 지원', 
							item: {mny:{amount:100000+Math.floor(Math.random()*100001)}}
						};
						if(jss == '2021022'){
							$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = {
								name: '1주년 통합 미션 보상', 
								item: {exp:{amount:Math.floor(2100*levelBonus(ReqExp.getLevel(my.data.score), true)*0.520210122)},mny:{amount:3000000}}
							};
							my.send('notice', { value: '분홍끄투 1주년 통합 미션 성공 보상이 지급되었습니다.' });
						}
						GOT = true;
						DB.users.update([ '_id', my.id ]).set([ 'post', $user.post ], [ 'chulseok', (Number($user.chulseok) || 0) + 1 ]).on();
					}
				}
				//my.changeLevel();
				var nW = new Date();
				if(!my.guest){
					if($user && $user.box && $user.hasOwnProperty('lvup') && $user.lvup != 1 && nW.getTime() < 1611413999000){
						$user.box['box_lvSupport'] = {value:1,expire:1611413999};
						DB.users.update([ '_id', my.id ]).set(
							[ 'box', $user.box ],
							[ 'lvup', 1 ]
						).on();
						my.send('notice', { value: '레벨업 지원 상자가 지급되었습니다. 아이템 보관함에서 사용 가능합니다.' });
					}
				}
				if(start && $user.black) my.noticeBlack($user.black, $user.blackt);
				my.checkLevel();
				if(GOT) my.send('notice', { value: rewardArrived });
				if(!my.guest) my.send('post', { data: $user.post, accessTime: $user.accessTime });
				//console.log(black);
				if(black) R.go({ result: 444, black: black });
				//else if(Cluster.isMaster && $user.server) R.go({ result: 409, black: $user.server });
				else if(exports.NIGHT && my.isAjae === false) R.go({ result: 440 });
				else R.go({ result: 200 });
			});
			my.ping();
			return R;
		};
		my.viewstat = function(){
			if(my.guest) return;
			DB.users.findOne([ '_id', my.id ]).on(function($stat){
				if(!$stat) return;
				var Remain = renderStatusPoint(my.level);
				var Current = 0;
				if($stat.stat){
					if($stat.stat.exp) Current += Number($stat.stat.exp);
					if($stat.stat.mny) Current += Number($stat.stat.mny);
					if(Current > Remain){
						DB.users.update(['_id',my.id]).set(['stat',{exp:0,mny:0}]).on();
						my.send('notice', { value: '보유하고 계신 포인트가 정상 지급 포인트 양보다 많아 포인트가 초기화되었습니다.<br>포인트를 다시 분배해 주세요.' });
						return;
					}						
				}
				if(!$stat.stat){
					$stat.stat = {exp:0,mny:0};
					DB.users.update(['_id',my.id]).set(['stat',$stat.stat]).on();
				}
				my.stat = $stat.stat;
				my.send('viewstat', { exp: $stat.stat.exp, mny: $stat.stat.mny, remain: Remain - Current });
			});
		};
		my.applystat = function(target, value){
			if(my.guest) return;
			if(!target || !value) return;
			DB.users.findOne([ '_id', my.id ]).on(function($stat){
				if(!$stat) return;
				var Remain = renderStatusPoint(my.level);
				var Current = 0;
				if($stat.stat){
					if($stat.stat.exp) Current += Number($stat.stat.exp);
					if($stat.stat.mny){
						if($stat.stat.mny < 9000) Current += Number($stat.stat.mny);
						else return my.send('notice', { value: '해당 효과에 사용 가능한 최대 포인트를 초과했습니다.' });
					}
					if(Current > Remain){
						var def = {exp:0,mny:0};
						DB.users.update(['_id',my.id]).set([ 'stat', def ]).on();
						return my.send('notice', { value: '보유하고 계신 포인트가 정상 지급 포인트 양보다 많아 포인트가 초기화되었습니다.<br>포인트를 다시 분배해 주세요.' });
					}
				}
				if(!$stat.stat) $stat.stat = {exp:0,mny:0};
				if(Current == Remain) return my.send('notice', { value: '더 이상 사용할 수 있는 포인트가 없습니다.' });
				if((Current + value) > Remain) return my.send('notice', { value: '포인트가 부족합니다.' });
				if(target != "exp" && target != "mny") return;
				$stat.stat[target] = Number($stat.stat[target]) + Number(value);
				DB.users.update([ '_id', my.id ]).set([ 'stat', $stat.stat ]).on();
				my.viewstat();
			});
		};
		my.statreset = function(){
			DB.users.update([ '_id', my.id ]).set([ 'stat', {exp:0,mny:0} ]).on();
			my.viewstat();
		};
		function renderStatusPoint(lv){
			//var lv = ReqExp.getLevel(Number(exp));
			if(lv<=1000) return 4 * lv;
			else{
				return 4000 + (10 * (lv - 1000)) + (lv > 1500 ? 10 * (lv - 1500) : 0);
			}
		}
		my.getMission = function(){
			DB.users.findOne([ '_id', my.id ]).on(function($me){
				if($me) my.send('mission', { data: $me.mission || {} });
			});
		};
		my.receiveItem = function(id){
			var prev;
			DB.users.findOne([ '_id', my.id ]).on(function($post){
				if(!$post) return;
				if($post.post[id]){
					var target = $post.post[id].item;
					if(target.exp){
						prev = Number($post.level);
						$post.score = Number($post.score) + (target.exp.amount || 0);
						if(prev < ReqExp.MAX_LEVEL){
							my.score = $post.score;
							my.send('notice', { value: '경험치를 획득했습니다: ' + commify(target.exp.amount) });
							my.checkLevel();
						}else my.send('notice', { value: '이미 최대 레벨이므로 경험치를 획득할 수 없습니다.' });
						my.processLevelNotice(prev, my.level, my.nickname);
					}
					if(target.mny){
						$post.money = Number($post.money) + (target.mny.amount || 0);
						my.money = $post.money;
						my.send('notice', { value: '핑을 획득했습니다: ' + commify(target.mny.amount) });
					}
				}
				delete $post.post[id];
				DB.users.update([ '_id', my.id ]).set(
					[ 'kkutu', $post.kkutu ],
					[ 'money', $post.money ],
					[ 'post', $post.post ]
				).on();
				my.send('updateme', { kkutu: $post.kkutu, money: $post.money, post: $post.post, level: my.level, score: my.score });
			});
		}
		my.flush = function(box, equip, friends){
			var R = new Lizard.Tail();
			
			if(my.guest){
				R.go({ id: my.id, prev: 0 });
				return R;
			}
			DB.users.upsert([ '_id', my.id ]).set(
				!isNaN(my.money) ? [ 'money', my.money ] : undefined,
				(my.data && !isNaN(my.score)) ? [ 'kkutu', my.data ] : undefined,
				box ? [ 'box', my.box ] : undefined,
				equip ? [ 'equip', my.equip ] : undefined,
				friends ? [ 'friends', my.friends ] : undefined
			).on(function(__res){
				DB.redis.getGlobal(my.id).then(function(_res){
					//분홍꽃 수정..
					if(my.level >= 3000){
						/*DB.redis.remove(my.id).then(function(res){
							JLog.log(`FLUSHED [${my.id}] DELETE / PTS=${my.score} MNY=${my.money} NICK=${my.nickname}`);
							//R.go({ id: my.id, prev: _res })
						});*/
						/*DB.ping.putGlobal(my.id, my.money).then(function(res){
							JLog.log(`FLUSHED [${my.id}] PING / PTS=${my.score} MNY=${my.money} NICK=${my.nickname}`);
						});*/
						/*DB.myeong.putGlobal(my.id, my.data.score).then(function(res){
							JLog.log(`FLUSHED [${my.id}] MYEONG / PTS=${my.score} MNY=${my.money} NICK=${my.nickname}`);
							R.go({ id: my.id, prev: _res });
						});*/
					} else {
						/*DB.ping.putGlobal(my.id, my.money).then(function(res){
							JLog.log(`FLUSHED [${my.id}] PING / PTS=${my.score} MNY=${my.money} NICK=${my.nickname}`);
						});*/
						DB.redis2.hPut(my.id, JSON.stringify({ score: my.score, level: my.level, nick: my.nickname })).then(function(res){
							JLog.log(`FLUSHED [${my.id}] LEVEL=${my.level} EXP=${my.score} MNY=${my.money} NICK=${my.nickname}`);
							R.go({ id: my.id, prev: _res });
						});
						/*DB.redis.putGlobal(my.id, my.data.score).then(function(res){
							JLog.log(`FLUSHED [${my.id}] PTS=${my.score} MNY=${my.money} NICK=${my.nickname}`);
							R.go({ id: my.id, prev: _res });
						});*/
					}
				});
				/*var tkid = my.id + "*" + encodeURI(my.nickname);
				DB.redis.getGlobal(my.id).then(function(_res){
					DB.redis.putGlobal(my.id, my.data.score).then(function(res){
						JLog.log(`FLUSHED [${my.id}] PTS=${my.data.score} MNY=${my.money} NICK=${my.nickname}`);
						R.go({ id: my.id, prev: _res });
					});
				});*/
			});
			return R;
		};
		my.invokeWordPiece = function(text, coef, free){
			var nss = new Date();
			if(nss.getHours() == 12 || nss.getHours() == 22) coef += coef * 0.3;
			if(!my.game.wpc) return;
			if(!my.game.wpb) return;
			if(!my.game.wpa) return;
			//if(!my.game.gwb) return;
			var v;
			if(!free){
				if(Math.random() <= 0.0018 * coef){
					v = text.charAt(Math.floor(Math.random() * text.length));
					if(!v.match(/[a-z가-힣]/)) return;
					my.game.wpa.push(v);
				}else if(Math.random() <= 0.0073 * coef){
					v = text.charAt(Math.floor(Math.random() * text.length));
					if(!v.match(/[a-z가-힣]/)) return;
					my.game.wpb.push(v);
				}else if(Math.random() <= 0.04 * coef){
					v = text.charAt(Math.floor(Math.random() * text.length));
					if(!v.match(/[a-z가-힣]/)) return;
					my.game.wpc.push(v);
				}
			}
			/*if(Math.random() <= (0.0815 + 0.04) * coef){
				my.game.gwb.push('1');
			}*/
		};
		my.enter = function(room, spec, pass){
			var GLOBAL = require('../sub/global.json');
			var $room, i, temp, k, v, s, d;
			if(_roomblocked && !GLOBAL.ADMIN.includes(my.id)){
				return my.send('palert', { value: '운영자에 의해 방 생성 및 입장이 제한되었습니다.' });
			}
			if(temp = Penalty[my.id]){
				k = temp.last;
				v = (new Date()).getTime();
				s = temp.count * 1000 * 180;
				v = v - k;
				if(s - v >= 0){
					my.send('palert', { value: `중도 퇴장으로 인해 방 개설 및 입장이 불가능합니다.<br>남은 시간: ${prettyTime(s - v)}<script>$("#ctr-close").trigger('click');</script>` });
					return;
				}
			}
			if(my.place){
				my.send('roomStuck');
				JLog.warn(`Enter the room ${room.id} in the place ${my.place} by ${my.id}!`);
				return;
			}else if(room.id){
				// 이미 있는 방에 들어가기... 여기서 유효성을 검사한다.
				
				$room = ROOM[room.id];
				
				if(!$room){
					if(Cluster.isMaster){
						for(i in CHAN) CHAN[i].send({ type: "room-invalid", room: room });
					}else{
						process.send({ type: "room-invalid", room: room });
					}
					return my.sendError(430, room.id);
				}
				if(my.bot && Const.GAME_TYPE[$room.mode] != "TAK") return my.sendError(448);
				if(!spec){
					if($room.gaming){
						return my.send('error', { code: 416, target: $room.id });
					}else if(my.guest) if(!GUEST_PERMISSION.enter){
						return my.sendError(401);
					}
				}
				if($room.players.length >= $room.limit + (spec ? Const.MAX_OBSERVER : 0) && !($room.gaming && checkGM($room.players))){
					adminch = GLOBAL.ADMIN.indexOf(my.id) != -1;
					if(!adminch){
						return my.sendError(429);
					}
				}
				if($room.players.length < $room.limit && $room.opts && $room.opts.gameconn && spec){
					// GC: undefined (미통과), 1 (통과, 게임중 연결), 2 (통과, 관전)
					if(!room.gc) return my.send('error', { code: 915, target: $room.id });
				}
				if($room.players.indexOf(my.id) != -1){
					return my.sendError(409);
				}
				if(Cluster.isMaster){
					my.send('preRoom', { id: $room.id, pw: room.password, channel: $room.channel });
					CHAN[$room.channel].send({ type: "room-reserve", session: sid, room: room, spec: spec, pass: pass });
					
					$room = undefined;
				}else{
					var GLOBAL = require('../sub/global.json');
					adminch = GLOBAL.ADMIN.indexOf(my.id) != -1;
					if(!pass && $room && !adminch){
						if($room.kicked.indexOf(my.id) != -1){
							return my.sendError(406);
						}
						if($room.password != room.password && $room.password && !adminch){
							$room = undefined;
							return my.sendError(403);
						}
					}
				}
				try{
					var jg = $room && $room != undefined && $room.slow != undefined;
				}catch(e){
					var jg = false;
				}
				my.send('roomslow', { i: room.id, q: jg ? $room.slow : 0 });
			}else if(my.guest && !GUEST_PERMISSION.enter){
				my.sendError(401);
			}else{
				if(my.bot && Const.GAME_TYPE[room.mode] != "TAK") return my.sendError(449);
				// 새 방 만들어 들어가기
				/*
					1. 마스터가 ID와 채널을 클라이언트로 보낸다.
					2. 클라이언트가 그 채널 일꾼으로 접속한다.
					3. 일꾼이 만든다.
					4. 일꾼이 만들었다고 마스터에게 알린다.
					5. 마스터가 방 정보를 반영한다.
				*/
				if(d = RoomLimit[my.id]){
					if(d >= 10) return my.send("palert", { value: '짧은 시간 내에 방을 너무 많이 생성하여<br>방 생성이 임시적으로 제한되었습니다.' });
					else RoomLimit[my.id] = d + 1;
				}else RoomLimit[my.id] = 1;
				var GLOBAL = require('../sub/global.json');
				adminch = GLOBAL.ADMIN.indexOf(my.id) != -1;
				if(ridch){
					ridch = false;
					_rid = prid;
				}
				if(room.password.indexOf('RID: ')!=-1 && adminch){
					try{
						var pps = room.password.replace('RID: ', '');
						ridch = true;
						prid = _rid;
						pps = Number(pps);
						_rid = pps;
					}catch(e){
						ridch = false;
					}
					room.password = "";
				}
				if(Cluster.isMaster){
					var av = getFreeChannel();
					
					room.id = _rid;
					room._create = true;
					my.send('preRoom', { id: _rid, channel: av });
					CHAN[av].send({ type: "room-reserve", create: true, session: sid, room: room });
					
					do{
						if(++_rid > 999) _rid = 1;
					}while(ROOM[_rid]);
				}else{
					if(room._id){
						room.id = room._id;
						delete room._id;
					}
					if(my.place != 0){
						my.sendError(409);
					}
					$room = new exports.Room(room, getFreeChannel());
					
					process.send({ type: "room-new", target: my.id, room: $room.getData() });
					ROOM[$room.id] = $room;
					spec = false;
				}
			}
			if($room){
				if(spec) $room.spectate(my, room.password, room.gc);
				else $room.come(my, room.password, pass);
			}
		};
		my.spdCheck = function(type){
			var w;
			if(w = QLast[my.id]){
				if(Date.now() - w <= 300) return true;
			}
			QLast[my.id] = Date.now();
			return false;
		};
		my.leave = function(kickVote, force){
			var $room = ROOM[my.place];
			
			if(my.subPlace){
				my.pracRoom.go(my);
				if($room) my.send('room', { target: my.id, room: $room.getData() });
				my.publish('user', my.getData());
				if(!kickVote) return;
			}
			if($room) $room.go(my, kickVote, force);
		};
		my.setForm = function(mode){
			if(my.spdCheck('ft')) return my.send('notice', { value: '속도가 너무 빠릅니다. 잠시 후 다시 시도해주세요.' });
			var $room = ROOM[my.place];
			
			if(!$room) return;
			LastAct[my.place] = Date.now();
			my.form = mode;
			my.ready = false;
			my.refresh().then(function(res){
				my.publish('user', my.getData());
			});
		};
		my.setTeam = function(team){
			if(my.spdCheck('ft')) return my.send('notice', { value: '속도가 너무 빠릅니다. 잠시 후 다시 시도해주세요.' });
			LastAct[my.place] = Date.now();
			my.team = team;
			my.refresh().then(function(res){
				my.publish('user', my.getData());
			});
		};
		my.kick = function(target, kickVote, byAdmin){
			var $room = ROOM[my.place];
			var i, $c;
			var len = $room.players.length;
			LastAct[my.place] = Date.now();
			if(target == null){ // 로봇 (이 경우 kickVote는 로봇의 식별자)
				$room.removeAI(kickVote);
				return;
			}
			/*for(i in $room.players){
				if($room.players[i].robot) len--;
			}*/
			kickVote = { target: target, Y: 1, N: 0, byAdmin: byAdmin };
			if(kickVote){
				$room.kicked.push(target);
				$room.kickVote = null;
				if(DIC[target]) DIC[target].leave(kickVote);
			}/*else{
				$room.kickVote = { target: target, Y: 1, N: 0, list: [] };
				for(i in $room.players){
					$c = DIC[$room.players[i]];
					if(!$c) continue;
					if($c.id == $room.master) continue;
					
					$c.kickTimer = setTimeout($c.kickVote, 10000, $c, true);
				}
				my.publish('kickVote', $room.kickVote, true);
			}*/
		};
		my.kickVote = function(client, agree){
			var $room = ROOM[client.place];
			var $m;
			
			if(!$room) return;
			
			$m = DIC[$room.master];
			if($room.kickVote){
				$room.kickVote[agree ? 'Y' : 'N']++;
				if($room.kickVote.list.push(client.id) >= $room.players.length - 2){
					if($room.gaming) return;
					
					if($room.kickVote.Y >= $room.kickVote.N) $m.kick($room.kickVote.target, $room.kickVote);
					else $m.publish('kickDeny', { target: $room.kickVote.target, Y: $room.kickVote.Y, N: $room.kickVote.N }, true);
					
					$room.kickVote = null;
				}
			}
			clearTimeout(client.kickTimer);
		};
		my.toggle = function(){
			var $room = ROOM[my.place];
			
			if(!$room) return;
			if($room.master == my.id) return;
			if(my.form != "J") return;
			
			my.ready = !my.ready;
			my.publish('user', my.getData());
		};
		my.start = function(){
			var $room = ROOM[my.place], m;
			
			if(!$room) return;
			if($room.master != my.id && !my.admin) return;
			if($room.players.length < 1) return my.sendError(411);
			if((m = Const.GAME_TYPE[$room.mode]) == 'TAK') return my.send('palert', { value: '대화방에서는 게임을 시작할 수 없습니다.' });
			if(_roomblocked) return my.send('palert', { value: '운영자에 의해 게임 시작이 제한되었습니다.' });
			$room.ready();
		};
		my.renew = function(){
			my.send('renew', { room: exports.getRoomList(), user: exports.getUserList() });
		};
		my.evtStat = function(){
			DB.evt.findOne([ '_id', '1staniv' ]).on(function($evt){
				try{
					my.send('evtStat2', { evtKey: $evt.evtKey });
				}catch(e){
					my.send('evtStat2', { evtKey: $evt.evtKey });
				}
			});
		}
		my.ping = function(){
			var lH = Math.floor(my.accessTime/1000/3600);
			my.accessTime += new Date().getTime() - my.accessLast;
			var nH = Math.floor(my.accessTime/1000/3600);
			my.accessLast = new Date().getTime();
			if(lH < nH){
				if(Cluster.isMaster) my.send('notice', {
					value: '게임 접속 시간이 '+nH+'시간을 경과했습니다.'+(nH>3?' 과도한 게임 이용은 정상적인 일상생활에 지장을 줄 수 있습니다.':'')				
				});
			}
		};
		my.dict = function(word, lang, mode){
			var MainDB = DB.kkutu[lang];
			DB.users.findOne([ '_id', my.id ]).on(function($user){
				if($user && $user.mission && $user.mission.mission){
					var A;
					var B;
					for(A in $user.mission.mission){
						B = $user.mission.mission[A];
						if(B.name == 'SearchDict'){
							if(!B.success){
								$user.mission.mission[A].now = 1;
								DB.users.update([ '_id', my.id ]).set([ 'mission', $user.mission ]).on();
							}
						}
					}
				}
			});
			if(!MainDB) return my.send('dict', { error: 400 });
			if(!MainDB.findOne) return my.send('dict', { error: 400 });
			MainDB.findOne([ '_id', word ]).on(function($word){
				if(!$word) return my.send('dict', { error: 404, mode: mode || 1 });
				my.send('dict', {
					word: $word._id,
					mean: $word.mean,
					theme: $word.theme,
					type: $word.type,
					mode: mode || 1,
				});
			});
		};
		my.cfView = function(text, level, blend){
			my.send('cfR', getCFRewards(text, Number(level || 0), blend == "1"));
		};
		function blendWord(word){
			var lang = parseLanguage(word);
			var i, kl = [];
			var kr = [];
			
			if(lang == "en") return String.fromCharCode(97 + Math.floor(Math.random() * 26));
			if(lang == "ko"){
				for(i=word.length-1; i>=0; i--){
					var k = word.charCodeAt(i) - 0xAC00;
					
					kl.push([ Math.floor(k/28/21), Math.floor(k/28)%21, k%28 ]);
				}
				[0,1,2].sort((a, b) => (Math.random() < 0.5)).forEach((v, i) => {
					kr.push(kl[v][i]);
				});
				return String.fromCharCode(((kr[0] * 21) + kr[1]) * 28 + kr[2] + 0xAC00);
			}
		}
		function parseLanguage(word){
			return word.match(/[a-zA-Z]/) ? "en" : "ko";
		}
		my.cnsItem = function(gid){
			if(my.guest) return;
			var uid = my.id;
			var isDyn = gid.charAt() == '$';
			var prev = ReqExp.getLevel(my.score);
			
			DB.users.findOne([ '_id', uid ]).on(function($user){
				if(!$user) return my.send('cns', { error: 400 });
				if(!$user.box) return my.send('cns', { error: 400 });
				if(!$user.lastLogin) $user.lastLogin = new Date().getTime();
				var q = $user.box[gid];
				var output;
				if(gid == 'dictPage'){
					return my.send('notice', { value: '사용이 일시적으로 제한된 아이템입니다.' });
					/*var naw = new Date();
					var ndate = String(naw.getYear())+String(naw.getMonth())+String(naw.getDate());
					if(!$user.dict) $user.dict = {date:ndate, count:0};
					if($user.dict.date == ndate && $user.dict.count && $user.dict.count >= 1000) return my.send('palert', { value: '하루에 최대 1000개만 사용 가능합니다.' });
					if($user.dict.date != ndate) $user.dict = { date: ndate, count: 0 };
					$user.dict.count = Number($user.dict.count || 0) + 1;
					my.send('notice', { value: '오늘 사용한 백과사전 낱장 개수: ' + $user.dict.count + ' / 1000' });*/
				}
				
				if(!q) return my.send('cns', { error: 430 });
				
				DB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
					if(!$item) return my.send('cns', { error: 430 });
					consume($user, gid, 1);
					output = useItem($user, $item, gid);
					/*if(prev < 2000) my.data.score = $user.kkutu.score;
					else my.send('notice', { value: '이미 최대 레벨이므로 경험치를 획득할 수 없습니다.' });*/
					//my.processLevelNotice(prev, ReqExp.getLevel($user.kkutu.score), my.nickname);
					DB.users.update([ '_id', uid ]).set($user).on(function($res){
						output.result = 200;
						output.box = $user.box;
						output.data = $user.kkutu;
						output.mny = $user.money;
						my.send('cns', output);
					});
				});
			});
		};
		my.processLevelNotice = function(prev,now,nick){
			var VAL = false;
			if(!my.friends) my.friends = {};
			var fr = Object.keys(my.friends);
			//console.log(fr);
			/*if(prev <= 1099 && now >= 1100){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="green">1100레벨</font>을 달성했습니다!';
			}
			if(prev <= 1199 && now >= 1200){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="purple">1200레벨</font>을 달성했습니다!';
			}
			if(prev <= 1299 && now >= 1300){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="purple">1300레벨</font>을 달성했습니다!';
			}
			if(prev <= 1399 && now >= 1400){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="purple">1400레벨</font>을 달성했습니다!';
			}
			if(prev <= 1499 && now >= 1500){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="navy">1500레벨</font>을 달성했습니다! 모두 축하해주세요!';
			}
			if(prev <= 1599 && now >= 1600){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="navy">★ 1600레벨 ★</font>을 달성했습니다!';
			}
			if(prev <= 1699 && now >= 1700){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="blue">★♩ 1700레벨 ♪★</font>을 달성했습니다!';
			}
			if(prev <= 1749 && now >= 1750){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="blue">1750레벨</font>을 달성했습니다! 모두 축하해주세요!';
			}
			if(prev <= 1799 && now >= 1800){
				VAL = '[속보] ' + (nick || '(알 수 없음) ') + '님이 <font color="red">1800레벨</font>을 달성했습니다!';
			}
			if(prev <= 1849 && now >= 1850){
				VAL = '[속보] ' + (nick || '(알 수 없음) ') + '님이 <font color="red">1850레벨</font>을 달성했습니다!! 모두 축하해주세요.';
			}
			if(prev <= 1899 && now >= 1900){
				VAL = (nick || '(알 수 없음)') + '님이 <font color="red">1900레벨</font>을 달성했습니다!! <del>곧 만렙을...??</del>';
			}
			if(prev <= 1924 && now >= 1925){
				VAL = (nick || '(알 수 없음)') + '님이 <font color="red">1925레벨</font>을 달성했습니다!! 만렙 달성까지 <del>고작</del> 75레벨 남았습니다.';
			}
			if(prev <= 1949 && now >= 1950){
				VAL = (nick || '(알 수 없음)') + '님이 <font color="red">1950레벨</font>을 달성했습니다!! 이제 만렙 달성까지 <font color="blue"75레벨</font> 남았습니다.';
			}
			if(prev <= 1974 && now >= 1975){
				VAL = (nick || '(알 수 없음)') + '님이 <font color="red">1975레벨</font>을 달성했습니다!!';
			}*/
			if(prev <= 1999 && now >= 2000){
				VAL = (nick || '(알 수 없음)') + '님이 <font color="blue">2000레벨</font>을 달성했습니다!';
			}
			if(Cluster.isMaster){
				if(now > prev) exports.narrate(fr, 'levelup', { user: my.id, value: now });
				if(VAL) exports.publish('notice', { value: VAL });
			}else if(Cluster.isWorker){
				if(now > prev) process.send({ type: 'levelup', user: my.id, value: now, friends: my.friends });
				if(VAL) process.send({ type: 'lvnotice', value: VAL });
			}
		}
		my.checkLevel = function(){
			let tmp = ReqExp.process(), v, levelup;
			my.score = Number(my.score) + my.data.score;
			my.data.score = 0;
			//JLog.toConsole(`Level(C): ${my.level}`);
			while((v = (tmp[my.level-1] || tmp[0])) <= my.score){
				my.score -= v;
				my.level++;
			}
			DB.users.update([ '_id', my.id ]).set(
				[ 'score', my.score ],
				[ 'level', my.level ],
				[ 'kkutu', my.data ]
			).on();
		};
		/*my.changeLevel = function(){
			if(!my.level){
				my.level = 1;
				my.score = my.data.score;
				my.data.score = 0;
				let tmp = ReqExp.process(), v;
				while((v = (tmp[my.level-1] || tmp[0])) <= my.score){
					my.score -= v;
					my.level += 1;
				}
				JLog.toConsole(`Level(L): ${my.level}`);
				DB.users.update([ '_id', my.id ]).set(
					[ 'score', my.score ],
					[ 'level', my.level ],
					[ 'kkutu', my.data ]
				).on();
			}
		};*/
		my.cnsAll = function(gid){
			if(my.guest) return;
			var uid = my.id;
			// 1200, 1500, 1750, 1800, 1850, 1900, 1950, 1990~2000
			var isDyn = gid.charAt() == '$';
			if(gid != 'dictPage') return my.send('cns', { error: 400 });
			if(my && my.level) var prev = my.level;
			DB.users.findOne([ '_id', uid ]).on(function($user){
				if(!$user) return my.send('cns', { error: 400 });
				if(!$user.box) return my.send('cns', { error: 400 });
				if(!$user.lastLogin) $user.lastLogin = new Date().getTime();
				var q = $user.box[gid];
				var output;
				if(!q) return my.send('cns', { error: 430 });
				if(gid == 'dictPage'){
					return my.send('notice', { value: '사용이 일시적으로 제한된 아이템입니다.' });
					/*var naw = new Date();
					var ndate = String(naw.getYear())+String(naw.getMonth())+String(naw.getDate());
					if(!$user.dict) $user.dict = {date:ndate, count:0};
					if($user.dict.date == ndate && $user.dict.count && $user.dict.count >= 1000) return my.send('palert', { value: '하루에 최대 1000개만 사용 가능합니다.' });
					if($user.dict.date != ndate) $user.dict = { date: ndate, count: 0 };
					q = (1000 - $user.dict.count)<q?1000-$user.dict.count:q;
					$user.dict.count = Number($user.dict.count || 0) + q;
					my.send('notice', { value: '오늘 사용한 백과사전 낱장 개수: ' + $user.dict.count + ' / 1000' });*/
				}
				DB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
					if(!$item) return my.send('cns', { error: 430 });
					
					for(var i=0; i<q; i++) consume($user, gid, 1);
					output = useExp($user, $item, gid, q);
					/*if(prev < ReqExp.MAX_LEVEL) my.score = $user.score;
					else my.send('notice', { value: '이미 최대 레벨이므로 경험치를 획득할 수 없습니다.' });*/
					my.processLevelNotice(prev, my.level, my.nickname);
					DB.users.update([ '_id', uid ]).set($user).on(function($res){
						output.result = 200;
						output.box = $user.box;
						output.data = $user.kkutu;
						my.send('cns', output);
					});
				});
			});
		}
		my.cfReward = function(tray){
			if(my.guest) return my.send('cfV', { error: 400 });
			var uid = my.id;
			var tray = tray.split('|');
			var i, o;
			
			if(tray.length < 1 || tray.length > 7) return my.send('cfV', { error: 400 });
			DB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ], ['mission',true]).on(function($user){
				if(!$user) return my.send('cfV', { error: 400 });
				if(!$user.box) $user.box = {};
				var req = {}, word = "", level = 0;
				var cfr, gain = [];
				var blend;
				
				for(i in tray){
					word += tray[i].slice(4);
					level += 68 - tray[i].charCodeAt(3);
					req[tray[i]] = (req[tray[i]] || 0) + 1;
					if(($user.box[tray[i]] || 0) < req[tray[i]]) return my.send('cfV', { error: 434 });
				}
				DB.kkutu[parseLanguage(word)].findOne([ '_id', word ]).on(function($dic){
					if(!$dic){
						if(word.length == 3){
							blend = true;
						}else return my.send('cfV', { error: 404 });
					}
					cfr = getCFRewards(word, level, blend);
					if($user.money < cfr.cost) return my.send('cfV', { error: 407 });
					for(i in req) consume($user, i, req[i]);
					for(i in cfr.data){
						o = cfr.data[i];
						
						if(Math.random() >= o.rate) continue;
						if(o.key.charAt(4) == "?"){
							o.key = o.key.slice(0, 4) + (blend ? blendWord(word) : word.charAt(Math.floor(Math.random() * word.length)));
						}
						if(o.key == "boxB2"){
							DB.uacv.findOne(['_id',my.id]).on(function(_v){
								if(_v){
									delete _v._id;
									if(_v['bx2']) _v['bx2'].value = _v['bx2'].value ? _v['bx2'].value + 1 : 1;
									else _v['bx2'] = {value:1,level:0};
									DB.uacv.update(['_id',my.id]).set(_v).on(function(v){
										JLog.log(`[boxB2] ${my.id} Success!`);
									});
								}
							});
						}
						obtain($user, o.key, o.value, o.term);
						gain.push(o);
					}
					$user.money -= cfr.cost;
					if($user && $user.mission && $user.mission.mission){
						var A;
						var B;
						for(A in $user.mission.mission){
							B = $user.mission.mission[A];
							if(B.name == 'CharFactory'){
								if(!B.success){
									$user.mission.mission[A].now = Number(B.now)+1;
									DB.users.update([ '_id', my.id ]).set([ 'mission', $user.mission ]).on();
								}
							}
						}
					}
					DB.users.update([ '_id', uid ]).set([ 'money', $user.money ], [ 'box', $user.box ], [ 'mission', $user.mission ]).on(function($res){
						my.send('cfV', { result: 200, box: $user.box, money: $user.money, gain: gain });
					});
				});
			});
		};
		function getCFRewards(word, level, blend){
			var R = [];
			var f = {
				len: word.length, // 최대 6
				lev: level // 최대 18
			};
			var cost = 50 * f.lev;
			var wur = f.len / 36; // 최대 2.867
			// f.len / 36 -> 33
			if(blend){
				if(wur >= 0.5){
					R.push({ key: "$WPA?", value: 1, rate: 1 });
				}else if(wur >= 0.35){
					R.push({ key: "$WPB?", value: 1, rate: 1 });
				}else if(wur >= 0.05){
					R.push({ key: "$WPC?", value: 1, rate: 1 });
				}
				cost = Math.round(cost * 0.2);
			}else{
				R.push({ key: "dictPage", value: f.len, rate: 1 });
				R.push({ key: "boxB4", value: 1, rate: Math.min(1, f.lev / 3) });
				if(f.lev >= 5){
					R.push({ key: "boxB3", value: 1, rate: Math.min(1, f.lev / 10) });
					cost += 20 * f.lev;
					wur += f.lev / 20;
				}
				if(f.lev >= 10){
					R.push({ key: "boxB2", value: 1, rate: Math.min(1, f.lev / 20) });
					cost += 40 * f.lev;
					wur += f.lev / 10;
				}
				if(wur >= 0.05){
					if(wur > 1) R.push({ key: "$WPC?", value: Math.floor(wur), rate: 1 });
					R.push({ key: "$WPC?", value: 1, rate: wur % 1 });
				}
				if(wur >= 0.35){
					if(wur > 2) R.push({ key: "$WPB?", value: Math.floor(wur / 1.98), rate: 1 });
					R.push({ key: "$WPB?", value: 1, rate: (wur / 1.9) % 1 });
				}
				if(wur >= 0.5){
					R.push({ key: "$WPA?", value: 1, rate: wur / 2.3 });
				}
				if(wur >= 0.3){
					R.push({ key: "exp_e", value: 1, rate: Math.min(1, f.lev / 210) });
				}
			}
			return { data: R, cost: cost };
		}
		function consume($user, key, value, force){
			var bd = $user.box[key];
			
			if(bd.value){
				if((bd.value -= value) <= 0){
					if(force || !bd.expire) delete $user.box[key];
				}
			}else{
				if(($user.box[key] -= value) <= 0) delete $user.box[key];
			}
		}
		function obtain($user, key, value, term, addValue){
			var now = (new Date()).getTime();
			if(term){
				if($user.box[key]){
					if(addValue) $user.box[key].value += value;
					else $user.box[key].expire += term;
				}else $user.box[key] = { value: value, expire: Math.round(now * 0.001 + term) }
			}else{
				$user.box[key] = ($user.box[key] || 0) + value;
			}
		}
		function useExp($user, $item, gid, much){
			var R = { gain: [] };
			var zzs;
			switch($item._id){
				case 'dictPage':
					JLog.log(much);
					JLog.log(gid);
					var epp = $user.kkutu.score;
					for(var i=0; i<much; i++){
						if(i==0) R.exp = 0;
						zzs = Math.round(Math.sqrt(1 + 2 * (epp || 0))) * 2;
						epp += zzs;
						R.exp += zzs;
					}
					$user.kkutu.score += R.exp;
					break;
				default:
					JLog.warn(`Unhandled consumption type: ${$item._id}`);
			}
			function got(key, value, term){
				obtain($user, key, value, term);
				R.gain.push({ key: key, value: value });
			}
			function pick(arr){
				return arr[Math.floor(Math.random() * arr.length)];
			}
			return R;
		}
		function getLevel(score){
			return ReqExp.getLevel(score);
		}
		function getLvup(exp){
			return 0;
		}
		function useItem($user, $item, gid){
			var R = { gain: [] };
			
			switch($item._id){
				case 'exp_up':
					var sq = getLvup($user.kkutu.score);
					R.exp = sq;
					$user.kkutu.score += R.exp;
					break;
				case 'boxB2':
					got(pick([ 'b2_fire', 'b2_metal' ]), 1, 604800);
					break;
				case 'boxB3':
					got(pick([ 'b3_do', 'b3_hwa', 'b3_pok' ]), 1, 604800);
					break;
				case 'boxB4':
					got(pick([ 'b4_bb', 'b4_hongsi', 'b4_mint' ]), 1, 604800);
					break;
				case 'dictPage':
					R.exp = Math.round(Math.sqrt(1 + 2 * ($user.kkutu.score || 0))) * 4;
					$user.kkutu.score += R.exp;
					break;
				case 'exp_n':
					R.exp = 200;
					$user.kkutu.score += R.exp;
					break;
				case 'exp_r':
					R.exp = 6000;
					$user.kkutu.score += R.exp;
					break;
				case 'exp_cr':
					R.exp = 14000;
					$user.kkutu.score += R.exp;
					break;
				case 'exp_e':
					R.exp = 80000;
					$user.kkutu.score += R.exp;
					break;
				case 'exp_l':
					R.exp = 200000;
					$user.kkutu.score += R.exp;
					break;
				case 'exp_n3':
					var rand = Math.floor(Math.random() * 10) + 1;
					if(rand < 7){
						R.exp = 300;
						$user.kkutu.score += R.exp;
					} else {
						R.exp = 0;
					}
					break;
				case '100up':
					if(ReqExp.getLevel($user.kkutu.score) < 150){
						R.exp = ReqExp.process()[148] - $user.kkutu.score;
						$user.kkutu.score += R.exp;
					}else{
						R.exp = 0;
						$user.kkutu.score += 0;
					}
					break;
				case 'CDCoin':
					MainDB.evt.findOne([ '_id', 'cday' ]).on(function($evt){
						MainDB.evt.update([ '_id', 'cday' ]).set([ 'evtKey', Number($evt.evtKey) + 1 ]).on();
						var uis = Number($evt.evtKey) + 1;
						JLog.log(`[CDCoin] + 1 / Now: ${uis}`);
					});
					R.cde = 100;
					break;
				case 'box_ping':
					R.money = Math.floor(Math.random() * 2000001) + 1000000;
					$user.money = Number($user.money) + Number(R.money);
					break;
				case 'box_lvSupport':
					var lev = ReqExp.getLevel($user.kkutu.score);
					var support = getSupportEXP(lev);
					R.exp = Math.ceil(Math.random()*(support.max-support.min))+support.min;
					R.money = Math.floor(Math.random()*200001)+300000;
					got(pick([ 'b2_fire', 'b2_metal' ]), 1, 86400*14);
					got(pick([ 'b3_do', 'b3_hwa', 'b3_pok' ]), 1, 86400*21);
					got(pick([ 'b4_bb', 'b4_hongsi', 'b4_mint' ]), 1, 86400*35);
					got('exp100',1,3600*12);
					delete $user.box['box_lvSupport'];
					$user.money = Number($user.money) + Number(R.money);
					$user.kkutu.score = Number($user.kkutu.score) + Number(R.exp);
					break;
				default:
					JLog.warn(`Unhandled consumption type: ${$item._id}`);
			}
			function got(key, value, term){
				obtain($user, key, value, term);
				R.gain.push({ key: key, value: value });
			}
			function pick(arr){
				return arr[Math.floor(Math.random() * arr.length)];
			}
			return R;
		};
		function getSupportEXP(lv){
			if(lv<1000) return {min:1500000,max:40000000};//1~1000
			if(lv<1100) return {min:60000000,max:125000000};//1000~1100
			if(lv<1200) return {min:125000000,max:200000000};//1100~1200
			if(lv<1300) return {min:250000000,max:300000000};//1200~1300
			if(lv<1400) return {min:500000000,max:600000000};//1300~1400
			if(lv<1500) return {min:1200000000,max:1500000000};//1400~1500
			if(lv<1600) return {min:3000000000,max:4000000000};//1500~1600
			if(lv<1700) return {min:5000000000,max:7500000000};//1600~1700
			if(lv<1800) return {min:5000000000,max:8000000000};//1700~1800
			if(lv<1900) return {min:9000000000,max:12000000000};//1800~1900
			if(lv<1950) return {min:10000000000,max:25000000000};//1900~1950
			if(lv<1990) return {min:25000000000,max:40000000000};//1950~1990
			if(lv<2000) return {min:50000000000,max:75000000000};//1990~2000
			return {min:0,max:0};
			/*var xp = ReqExp.process(true);
			var wp = Math.floor(lv/100)*100;
			return {min:xp[wp-1]*((2000-wp)/400),max:xp[wp+48]*((2000-wp)/200)};*/
		}
		my.reqBox = function(){
			if(my.guest) return my.send('box', { error: 400 });
			DB.users.findOne([ '_id', my.id ]).limit([ 'box', true ]).on(function($body){
				if(!$body){
					my.send('box', { error: 400 });
				}else{
					my.send('box', { box: $body.box });
				}
			});
		};
		my.reqEquip = function(id, isLeft){
			if(my.guest) return my.send('equip', { error: 400 });
			var uid = my.id;
			var gid = id;
			var now = Date.now() * 0.001;
			
			DB.users.findOne([ '_id', uid ]).limit([ 'box', true ], [ 'equip', true ], [ 'mission', true ]).on(function($user){
				if(!$user) return my.send('equip', { error: 400 });
				if(!$user.box) $user.box = {};
				if(!$user.equip) $user.equip = {};
				var q = $user.box[gid], r;
				if($user && $user.mission && $user.mission.mission){
					var A;
					var B;
					for(A in $user.mission.mission){
						B = $user.mission.mission[A];
						if(B.name == 'ChangeDress') $user.mission.mission[A].now = 1;
					}
				}
				DB.kkutu_shop.findOne([ '_id', gid ]).limit([ 'group', true ]).on(function($item){
					if(!$item) return my.send('equip', { error: 430 });
					if(!Const.AVAIL_EQUIP.includes($item.group)) return my.send('equip', { error: 400 });
					
					var part = $item.group;
					if(part.substr(0, 3) == "BDG") part = "BDG";
					if(part == "Mhand") part = isLeft ? "Mlhand" : "Mrhand";
					var qid = $user.equip[part];
					
					if(qid){
						r = $user.box[qid];
						if(r && r.expire){
							obtain($user, qid, 1, r.expire, true);
						}else{
							obtain($user, qid, 1, now + $item.term, true);
						}
					}
					if(qid == $item._id){
						delete $user.equip[part];
					}else{
						if(!q) return my.send('equip', { error: 430 });
						consume($user, gid, 1);
						$user.equip[part] = $item._id;
					}
					DB.users.update([ '_id', uid ]).set([ 'mission', $user.mission ], [ 'box', $user.box ], [ 'equip', $user.equip ]).on(function($res){
						my.send('equip', { result: 200, box: $user.box, equip: $user.equip });
					});
				});
			});
		};
		my.practice = function(level){
			var $room = ROOM[my.place];
			var ud;
			var pr;
			
			if(!$room) return;
			if(my.subPlace) return;
			if(my.form != "J") return;
			if($room && Const.GAME_TYPE[$room.mode] == 'TAK') return my.send('palert', { value: '대화방에서는 연습을 할 수 없습니다.' });
			
			my.team = 0;
			my.ready = false;
			ud = my.getData();
			my.pracRoom = new exports.Room($room.getData());
			my.pracRoom.id = $room.id + 1000;
			ud.game.practice = my.pracRoom.id;
			if(pr = $room.preReady()) return my.sendError(pr);
			my.publish('user', ud);
			my.pracRoom.time /= my.pracRoom.rule.time;
			my.pracRoom.limit = 1;
			my.pracRoom.password = "";
			my.pracRoom.practice = true;
			my.subPlace = my.pracRoom.id;
			my.pracRoom.come(my);
			my.pracRoom.start(level);
			my.pracRoom.game.hum = 1;
		};
		my.setRoom = function(room){
			var $room = ROOM[my.place];
			
			if($room){
				if(my.bot && Const.GAME_TYPE[room.mode] != "TAK") my.sendError(431);
				else if(!$room.gaming || my.admin){
					if($room.master == my.id || my.admin){
						$room.set(room);
						exports.publish('room', { target: my.id, room: $room.getData(), modify: true }, room.password);
					}else{
						my.sendError(400);
					}
				}
			}else{
				my.sendError(400);
			}
		};
		function calculateMoneytoExp(lv, val){
			var wlv = lv;
			lv = wlv>=1000 ? lv/50 : lv/250;
			if(wlv>=360) lv += 1;
			if(wlv>=500) lv += 1;
			if(wlv>=750) lv += 1;
			if(wlv>=1000) lv += 20;
			if(wlv>=1200) lv += 30;
			if(wlv>=1500) lv += 30;
			if(wlv>=1750) lv += 40;
			if(wlv>=1900) lv += 50;
			if(lv<1) lv = 1;
			return Math.floor(Math.pow(lv,1.1)*val);
		}
		my.changeExp = function(amount){
			//var prev = 2000;
			if(my.guest) return;
			if(isNaN(amount)) return;
			amount = Math.floor(amount);
			if(!amount || amount <= 0) return;
			amount = Number(amount);
			DB.users.findOne([ '_id', my.id ]).on(function($exp){
				try{
					if(!$exp) return my.send('notice', { value: '회원님의 정보를 찾을 수 없습니다. 잠시 후 다시 시도해 주세요.' });
					if(!$exp.money || !$exp.kkutu) return my.send('notice', { value: '회원님의 정보를 찾을 수 없습니다. 잠시 후 다시 시도해 주세요.' });
					if(Number($exp.money) < amount) return my.send('notice', { value: '핑이 부족합니다.' });
					var obtainExp = calculateMoneytoExp(ReqExp.getLevel(Number($exp.kkutu.score)), amount);
					prev = ReqExp.getLevel(Number($exp.kkutu.score));
					$exp.kkutu.score = Number($exp.kkutu.score) + obtainExp;
					$exp.money = Number($exp.money) - amount;
					//my.processLevelNotice(prev, ReqExp.getLevel($exp.kkutu.score), my.nickname);
					DB.users.update([ '_id', my.id ]).set([ 'kkutu', $exp.kkutu ], [ 'money', $exp.money ]).on(function($res){
						my.send('notice', { value: '경험치를 획득했습니다: ' + commify(obtainExp) });
						my.send('updateme', { kkutu: $exp.kkutu, money: $exp.money, score: my.score, level: my.level });
					});
				}catch(e){
					JLog.toConsole(e.toString());
					return my.send('notice', { value: '처리 중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.' });
				}
			});
		};
		my.flushWeekly = function(rw){
			if(my.guest) return;
			var __score = 0;
			var op;
			var _score = Math.round(rw.score);
			DB.uacv.findOne([ '_id', my.id ]).on(function(av){
				if(av){
					delete av._id;
					if(av['scr']) av['scr'].value = av['scr'].value ? av['scr'].value + _score : _score;
					else av['scr'] = {value:_score,level:0};
					DB.uacv.update([ '_id', my.id ]).set(av).on();
				}
			});
			DB.weekly.getMe(my.id).then(function($v){
				if($v) __score = $v;
				var score = _score + Number(__score);
				DB.weekly.putGlobal(my.id, score).then(function($d){
					JLog.toConsole(`Weekly [${my.id}] SCORE=${score} NICK=${my.nickname}`);
				});
			});
			/*DB.users.findOne([ '_id', my.id ]).limit([ 'evtMoney', true ]).on(function($evt){
				if($evt.evtMoney) $evt.evtMoney = Number($evt.evtMoney);
				else $evt.evtMoney = 0;
				op = Math.floor(_score * 0.7139690239);
				$evt.evtMoney += op;
				my.send('notice', { value: `이벤트 포인트를 얻었습니다: ${op}` });
				DB.users.update([ '_id', my.id ]).set([ 'evtMoney', $evt.evtMoney ]).on();
			});*/
		};
		my.applyEquipOptions = function(rw, wa, wu, mode){
			rw.score *= 14;
			var $obj;
			var i, j;
			var pm = rw.playTime / 60000;
			var aw = mode == "KAW" || mode == "EAW" || mode == "KJH" || mode == "EJH";
			rw._score = Math.round(rw.score);
			rw._money = Math.round(rw.money);
			rw._blog = [];
			my.checkExpire();
			var equipbonus = { gEXP: 0, gMNY: 0, hEXP: 0, hMNY: 0 }
			var enhance = { gEXP: 0, gMNY: 0 }
			
			var level = my.level;
			var lvbonus = getLvBonus(level) * 2;
			var itembonus = getIB(level);
			var pingbonus = 2;
			if(aw) lvbonus /= 1.225;
			JLog.log(`LvBonus [${my.id}] ${lvbonus/3}`);
			var miBonus = (lvbonus/30) < 1 ? 1 : lvbonus/30;
			var wfd = aw ? 24 : 32;
			rw.score += rw._score * wfd;
			rw.money += rw._money * wfd;
			rw._blog.push("egEXP" + wfd);
			rw._blog.push("egMNY" + wfd);
			var nss = new Date();
			var current = 0;
			var hotime = nss.getHours() == 12 || nss.getHours() == 22;
			if(lvbonus>=2){
				rw.score += (current=rw._score * (lvbonus/3));
				rw._blog.push("fhEXP" + current);
				rw.money += (current=rw._money * (pingbonus));
				rw._blog.push("fhMNY" + current);
			}
			var rwScore = rw.score;
			var rwMoney = rw.money;
			//var current = 0;
			if(nss.getDay() == 6 || nss.getDay() == 0){
				var jdd = 0.2;
				rw.score += (current = rwScore * jdd);
				rw._blog.push("jhEXP" + current);
				rw.money += (current = rwMoney * jdd);
				rw._blog.push("jhMNY" + current);
			}
			if(hotime){
				var qld = 0.2;
				var uld = 0.2;
				rw.score += (current = rwScore * qld);
				rw._blog.push("thEXP" + current);
				rw.money += (current = rwMoney * uld);
				rw._blog.push("thMNY" + current);
			}
			// 여기서 아이템 보너스를 계산한다.
			var Crent = 0;
			if(my.stat){
				if(my.stat.exp) Crent += Number(my.stat.exp);
				if(my.stat.mny){
					Crent += Number(my.stat.mny) > 9000 ? 9000 : Number(my.stat.mny);
					if(Number(my.stat.mny) > 9000) my.send('notice', { value: '일부 효과에 사용하신 포인트가 최대 사용 가능 포인트를 초과하여 최대 효과로 적용되었습니다.<br>포인트를 다시 분배해 주세요.' });
				}
				var Crnt = renderStatusPoint(my.level);
				if(Crent <= Crnt){
					rw.score += (current = rwScore * (my.stat.exp*0.001));
					rw._blog.push("shEXP" + current);
					rw.money += (current = rwMoney * (my.stat.mny*0.0005));
					rw._blog.push("shMNY" + current);
				}
			}
			for(aq in my.equip){
				i = my.equip[aq];
				if(!i) continue;
				if(!my.enhance[i]) continue;
				$obj = SHOP[i];
				if(!$obj) continue;
				if(!$obj.options) continue;
				for(j in $obj.options){
					if(j == "gEXP"){
						enhance.gEXP += $obj.options[j] * ((hyogwa[my.enhance[i] - 1] - 100) / 100);
						continue;
					}else if(j == "gMNY") enhance.gMNY += $obj.options[j] * ((hyogwa[my.enhance[i] - 1] - 100) / 100);
					else continue;
				}
			}
			for(j in enhance){
				if(!enhance[j] || enhance[j] <= 0) continue;
				if(j == "gEXP") rw.score += (current = rwScore * enhance[j]);
				else if(j == "gMNY") rw.money += (current = rwMoney * enhance[j]);
				rw._blog.push("lh" + j.slice(1) + current);
			}
			for(i in my.equip){
				$obj = SHOP[my.equip[i]];
				if(!$obj) continue;
				if(!$obj.options) continue;
				for(j in $obj.options){
					if(j == "gEXP") equipbonus.gEXP += $obj.options[j];
					else if(j == "hEXP") equipbonus.hEXP += $obj.options[j] * pm;
					else if(j == "gMNY") equipbonus.gMNY += $obj.options[j];
					else if(j == "hMNY") equipbonus.hMNY += $obj.options[j] * pm;
					else continue;
				}
			}
			for(j in equipbonus){
				if(!equipbonus[j] || equipbonus[j] <= 0) continue;
				if(j == "gEXP") rw.score += (current=rwScore * equipbonus[j]);
				else if(j == "hEXP") rw.score += (current = equipbonus[j] * getLvBonus2(level));
				else if(j == "gMNY") rw.money += (current = rwMoney * equipbonus[j]);
				else if(j == "hMNY") rw.money += (current = equipbonus[j]);
				else continue;
				rw._blog.push("qh" + j.slice(1) + current);
			}
			if(rw.together){
				var well = true;
				var rdn = Math.floor(Math.random() * 100) + 1;	// 1~70사이의 난수 생성
				rdn = rdn * 0.01 * miBonus;
				var pex = rw._score;
				if(pex < 1) well = false; // 경험치 / 91.5가 1보다 작으면 진행하지 않기.
				if(well){
					pex = Math.floor(rdn * pex);
				}
				rw.score += pex;
				rw._blog.push("rgEXP" + rdn);
			}
			if(rw.together && my.okgCount > 0 && !aw){
				my.okgCount = my.okgCount > ALL_OKG ? ALL_OKG : my.okgCount;
				if(my.okgCount > MAX_OKG){
					i = 0.12 * (MAX_OKG + ((my.okgCount - MAX_OKG)/21)) * ((lvbonus/3)/30);
					j = 0.12 * (MAX_OKG + ((my.okgCount - MAX_OKG)/21));
				}else{
					i = 0.12 * my.okgCount * ((lvbonus/3)/10);
					j = 0.12 * my.okgCount;
				}
				
				rw.score += rw._score * i;
				rw.money += rw._money * j;
				rw._blog.push("kgEXP" + i);
				rw._blog.push("kgMNY" + j);
			} else if(!rw.together && my.okgCount > 0 && !aw){
				my.okgCount = my.okgCount > ALL_OKG ? ALL_OKG : my.okgCount;
				if(my.okgCount > MAX_OKG){
					i = 0.018 * (MAX_OKG + ((my.okgCount - MAX_OKG)/22)) * ((lvbonus/3)/60);
					j = 0.018 * (MAX_OKG + ((my.okgCount - MAX_OKG)/22));
				}else{
					i = 0.018 * my.okgCount * ((lvbonus/3)/10);
					j = 0.018 * my.okgCount;
				}
				
				rw.score += rw._score * i;
				rw.money += rw._money * j;
				rw._blog.push("kgEXP" + i);
				rw._blog.push("kgMNY" + j);
			}
			if(rw.together && wa){
				var wb = 1;
				
				rw.score += (current = rw.score * wb);
				rw.money += (current = rw.money * wb);
				rw._blog.push("whEXP" + current);
				rw._blog.push("whMNY" + current);
			}
			if(rw.together && wu){
				var wb = 0.2;
				
				rw.score += (current=rw.score * wb);
				rw._blog.push("uhEXP" + current);
				rw.money += (current=rw.money * wb);
				rw._blog.push("uhMNY" + current);
			}
			/*if(new Date().getTime() <= 1610377199000){
				var wb = 2.2;
				var kb = 0.4;
				rw.score += (current = rw.score * wb);
				rw._blog.push("whEXP" + current);
				rw.money += (current = rw.money * kb);
				rw._blog.push("whMNY" + current);
			}*/
			rw.score = Math.round(rw.score);
			rw.money = Math.round(rw.money);
			/*if(rw.together && wa){
				var wb = 1;
				
				rw.score += rw._score * wb * miBonus;
				rw.money += rw._money * wb;
				rw._blog.push("wgEXP" + wb);
				rw._blog.push("wgMNY" + wb);
			}
			if(rw.together && wu){
				var wb = 0.2;
				
				rw.score += rw._score * wb * miBonus;
				rw.money += rw._money * wb;
				rw._blog.push("ugEXP" + wb);
				rw._blog.push("ugMNY" + wb);
			}*/
			
		};
		my.obtain = function(k, q, flush){
			if(my.guest && k != "taegeuk") return;
			if(k != "taegeuk"){
				if(my.box[k]) my.box[k] += q;
				else my.box[k] = q;
			}
			
			my.send('obtain', { key: k, q: q });
			if(flush) my.flush(true);
		};
		my.pretain = function(k, q, flush){
			if(my.guest) return;
			if(my.box[k]) my.box[k] += q;
			else my.box[k] = q;
			
			my.send('pretain', { key: k, q: q });
			if(flush) my.flush(true);
		};
		my.addFriend = function(id){
			var fd = DIC[id];
			
			if(!fd) return;
			my.friends[id] = fd.profile.title || fd.profile.name;
			my.flush(false, false, true);
			my.send('friendEdit', { friends: my.friends });
		};
		my.removeFriend = function(id){
			DB.users.findOne([ '_id', id ]).limit([ 'friends', true ]).on(function($doc){
				if(!$doc) return;
				
				var f = $doc.friends;
				
				delete f[my.id];
				DB.users.update([ '_id', id ]).set([ 'friends', f ]).on();
			});
			delete my.friends[id];
			my.flush(false, false, true);
			my.send('friendEdit', { friends: my.friends });
		};
	}
};
exports.Room = function(room, channel){
	var my = this;
	
	my.slow = 0;
	my.id = room.id || _rid;
	my.channel = channel;
	my.opts = {};
	my.lastForm = (new Date()).getTime()
	/*my.title = room.title;
	my.password = room.password;
	my.limit = Math.round(room.limit);
	my.mode = room.mode;
	my.rule = Const.getRule(room.mode);
	my.round = Math.round(room.round);
	my.time = room.time * my.rule.time;
	my.opts = {
		manner: room.opts.manner,
		extend: room.opts.injeong,
		mission: room.opts.mission,
		loanword: room.opts.loanword,
		injpick: room.opts.injpick || []
	};*/
	my.master = null;
	my.tail = [];
	my.players = [];
	my.kicked = [];
	my.kickVote = null;
	
	my.gaming = false;
	my.game = {};
	
	my.getData = function(){
		var i, readies = {};
		var pls = [];
		var seq = my.game.seq ? my.game.seq.map(filterRobot) : [];
		var o;
		
		for(i in my.players){
			if(o = DIC[my.players[i]]){
				readies[my.players[i]] = {
					r: o.ready || o.game.ready,
					f: o.form || o.game.form,
					t: o.team || o.game.team
				};
			}
			pls.push(filterRobot(my.players[i]));
		}
		return {
			id: my.id,
			channel: my.channel,
			title: my.title,
			password: my.password ? true : false,
			limit: my.limit,
			mode: my.mode,
			round: my.round,
			time: my.time,
			master: my.master,
			gameSpeed: my.gameSpeed || 1,
			players: pls,
			readies: readies,
			gaming: my.gaming,
			game: {
				round: my.game.round,
				turn: my.game.turn,
				seq: seq,
				title: my.game.title,
				mission: my.game.mission
			},
			practice: my.practice ? true : false,
			opts: my.opts
		};
	};
	my.addAI = function(caller){
		if(my.players.length >= my.limit){
			return caller.sendError(429);
		}
		if(my.gaming){
			return caller.send('error', { code: 416, target: my.id });
		}
		if(!my.rule.ai){
			return caller.sendError(415);
		}
		my.players.push(new exports.Robot(null, my.id, 4));
		my.export();
	};
	my.setAI = function(target, level, team, status){
		var i;
		
		for(i in my.players){
			if(!my.players[i]) continue;
			if(!my.players[i].robot) continue;
			if(my.players[i].id == target){
				my.players[i].setLevel(level);
				my.players[i].setTeam(team);
				my.players[i].setStat(status);
				my.export();
				return true;
			}
		}
		return false;
	};
	my.removeAI = function(target, noEx){
		var i, j;
		
		for(i in my.players){
			if(!my.players[i]) continue;
			if(!my.players[i].robot) continue;
			if(!target || my.players[i].id == target){
				if(my.gaming){
					j = my.game.seq.indexOf(my.players[i]);
					if(j != -1) my.game.seq.splice(j, 1);
				}
				my.players.splice(i, 1);
				if(!noEx) my.export();
				return true;
			}
		}
		return false;
	};
	my.come = function(client){
		if(!my.practice) client.place = my.id;
		
		if(my.players.push(client.id) == 1){
			my.master = client.id;
		}
		if(Cluster.isWorker){
			client.ready = false;
			client.team = 0;
			client.cameWhenGaming = false;
			client.useGC = false;
			client.form = "J";
			
			if(!my.practice) process.send({ type: "room-come", target: client.id, id: my.id });
			my.export(client.id);
		}
	};
	my.spectate = function(client, password, gc){
		if(!my.practice) client.place = my.id;
		if(!my.gaming) return;
		var len = my.players.push(client.id);
		if(!gc) gc = 2;
		var goDuring = len <= my.limit && my.opts.gameconn && gc == 1;

		if(Cluster.isWorker){
			client.send('roundReady', {
				round: my.game.round,
				char: my.game.char,
				subChar: my.game.subChar,
				mission: my.game.mission,
				during: true
			});
			client.send('turnStart', {
				turn: my.game.turn,
				char: my.game.char,
				subChar: my.game.subChar,
				speed: my.getTurnSpeed(my.game.roundTime),
				roundTime: my.game.roundTime,
				turnTime: my.game.turnTime,
				mission: my.game.mission,
				wordLength: my.game.wordLength,
				seq: undefined
			});
			client.ready = false;
			client.team = 0;
			client.cameWhenGaming = true;
			client.game.score = 0;
			client.form = (len > my.limit) ? "O" : (goDuring ? "J" : "S");
			client.useGC = goDuring;
			process.send({ type: goDuring ? "room-come" : "room-spectate", target: client.id, id: my.id, pw: password });
			if(goDuring){
				my.game.seq.push(client.id);
				my.export(client.id);
			}else my.export(client.id, false, true);
		}
	};
	my.go = function(client, kickVote, force, wait){
		var x = my.players.indexOf(client.id);
		var reconn = false;//my.opts.atreconn && !force;
		var force = true;
		var me;
		var temp, v, o, p = 0;
		if(x == -1){
			client.place = 0;
			/*if(my.players.length < 1) */
			if(my.players.length < 1) delete ROOM[my.id];
			//setTimeout(function(){if(my.players.length < 1) delete ROOM[my.id];}, force ? 0 : 5000);
			return;// client.sendError(409);
		}
		my.players.splice(x, 1);
		client.game = {};
		if(client.id == my.master){
			while(my.removeAI(false, true));
			my.master = my.players[0];
		}
		if(DIC[my.master]){
			DIC[my.master].ready = false;
			if(my.gaming){
				x = my.game.seq.indexOf(client.id);
				if(x != -1){
					for(v in my.game.seq){
						o = DIC[my.game.seq[v]] || my.game.seq[v];
						if(!o) continue;
						if(o.robot) continue;
						p++;
					}
					if(my.opts.exitblock && p >= 1){
						temp = Penalty[client.id];
						Penalty[client.id] = { count: temp ? temp.count + 1 : 1, last: (new Date()).getTime() };
					}
					if(my.game.seq.length <= 2){
						my.game.seq.splice(x, 1);
						my.roundEnd();
					}else{
						me = my.game.turn == x;
						if(me && my.rule.ewq){
							clearTimeout(my.game._rrt);
							my.game.loading = false;
							if(Cluster.isWorker) my.turnEnd();
						}
						my.game.seq.splice(x, 1);
						if(my.game.turn > x){
							my.game.turn--;
							if(my.game.turn < 0) my.game.turn = my.game.seq.length - 1;
						}
						if(my.game.turn >= my.game.seq.length) my.game.turn = 0;
					}
				}
			}
		}else{
			if(my.gaming){
				my.interrupt();
				my.game.late = true;
				my.gaming = false;
				my.game = {};
			}
			delete ROOM[my.id];
		}
		if(my.practice){
			clearTimeout(my.game.turnTimer);
			client.subPlace = 0;
		}else client.place = 0;
		
		if(Cluster.isWorker){
			if(!my.practice){
				client.socket.close();
				process.send({ type: "room-go", target: client.id, id: my.id, removed: !ROOM.hasOwnProperty(my.id) });
			}
			my.export(client.id, kickVote);
		}
	};
	my.set = function(room){
		var i, k, ijc, ij;
		
		my.title = room.title;
		my.password = room.password;
		my.limit = Math.max(Math.min(8, my.players.length), Math.round(room.limit));
		my.mode = room.mode;
		my.rule = Const.getRule(room.mode);
		my.round = Math.round(room.round);
		my.gameSpeed = (DIC[my.master] && DIC[my.master].admin) ? room.gameSpeed : Math.round(room.gameSpeed*10)/10;
		my.time = room.time * my.rule.time;
		if(room.opts && my.opts){
			for(i in Const.OPTIONS){
				k = Const.OPTIONS[i].name.toLowerCase();
				my.opts[k] = room.opts[k] && (my.rule.opts.includes(i) || (DIC[my.master] && DIC[my.master].admin));
			}
			if(my.opts.nostack && (!my.opts.manner || my.opts.return)) my.opts.nostack = false;
			//if(my.opts.faster && my.opts.faster2 && !(DIC[my.master] && GLOBAL.ADMIN.includes(my.master))) my.opts.faster2 = false;
			if(ijc = my.rule.opts.includes("ijp")){
				ij = Const[`${my.rule.lang.toUpperCase()}_IJP`];
				my.opts.injpick = (room.opts.injpick || []).filter(function(item){ return ij.includes(item); });
			}else my.opts.injpick = [];
		}
		if(!my.rule.ai){
			while(my.removeAI(false, true));
		}
		for(i in my.players){
			if(DIC[my.players[i]]){
				if(DIC[my.players[i]].bot && Const.GAME_TYPE[room.mode] != "TAK"){
					DIC[my.players[i]].send('palert', { value: '게임 모드가 대화 이외의 모드로 변경되어<br>방에서 퇴장되었습니다.' });
					DIC[my.players[i]].leave();
				}else DIC[my.players[i]].ready = false;
			}
		}
	};
	my.preReady = function(teams){
		var i, j, t = 0, l = 0;
		var avTeam = [];
		
		// 팀 검사
		if(teams){
			if(teams[0].length){
				if(teams[1].length > 1 || teams[2].length > 1 || teams[3].length > 1 || teams[4].length > 1) return 418;
			}else{
				if(my.opts.gameconn) return 418;
				for(i=1; i<5; i++){
					if(j = teams[i].length){
						if(t){
							if(t != j) return 418;
						}else t = j;
						l++;
						avTeam.push(i);
					}
				}
				if(l < 2) return 418;
				my._avTeam = shuffle(avTeam);
			}
		}
		// 인정픽 검사
		if(!my.rule) return 400;
		var gameType = Const.GAME_TYPE[my.mode || 0] || '???';
		if(my.rule.opts.includes("ijp")){
			if(!my.opts.injpick) return 400;
			if((gameType == 'ESD' || gameType == 'KSD') && (!my.opts.injpick.length || my.opts.injpick.length < 2)) return 439;
			if(!my.opts.injpick.length) return 413;
			if(!my.opts.injpick.every(function(item){
				return !Const.IJP_EXCEPT.includes(item);
			})) return 414;
		}
		return false;
	};
	my.drawingCanvas = function(msg) {
		my.byMaster('drawCanvas', { data: msg.data }, true);
	};
	my.ready = function(){
		if(_roomblocked){
			if(DIC[my.master]) DIC[my.master].send('palert', { value: '운영자에 의해 게임 시작이 제한되었습니다.' });
			return;
		}
		var i, all = true;
		var len = 0;
		var teams = [ [], [], [], [], [] ];
		var bot = 0, p = 0;
		var mod = Const.RULE[Const.GAME_TYPE[my.mode]];
		for(i in my.players){
			if(my.players[i].robot){
				if(!my.players[i].game.ready){
					len++;
					all = false;
					break;
				}
				if(my.players[i].game.form != "S") len++;
				teams[my.players[i].game.team].push(my.players[i]);
				bot++;
				continue;
			}
			if(!DIC[my.players[i]]) continue;
			if(DIC[my.players[i]].form == "S") continue;
			if(DIC[my.players[i]].noChat && mod && (mod.rule == "All" || mod.rule == "Jycls")){
				if(DIC[my.master]) return DIC[my.master].send('palert', { value: '방에 채팅 금지된 회원이 있습니다.<br>채팅 금지된 회원은 이 모드를 이용할 수 없습니다.' });
			}
			len++;
			p++;
			teams[DIC[my.players[i]].team].push(my.players[i]);
			
			if(my.players[i] == my.master) continue;
			if(!DIC[my.players[i]].ready){
				all = false;
				break;
			}
		}
		if(!DIC[my.master]) return;
		if(len < 1) return DIC[my.master].send('palert', { value: '최소한 한 명이 준비 상태여야 합니다.' });
		if(bot >= 1 && p < 1 && !DIC[my.master].admin){
			if(my.opts.rightgo) return DIC[my.master].send('palert', { value: '바로 넘기기 모드가 있어 끄투 봇만을 이용하여 게임하실 수 없습니다.' });
			if(my.gameSpeed > 1) return DIC[my.master].send('palert', { value: '설정된 속도가 정상 속도보다 빨라 끄투 봇만을 이용하여 게임하실 수 없습니다.' });
		}
		if(my.opts.hack && !DIC[my.master].admin){
			if(my.opts.rightgo) return DIC[my.master].send('palert', { value: '핵 모드와 바로 넘기기 모드를 같이 사용하실 수 없습니다.' });
			if(my.gameSpeed > 1) return DIC[my.master].send('palert', { value: '핵 모드가 있어 속도를 정상 속도보다 빠르게 설정하실 수 없습니다.' });
			if(my.opts.inftime) return DIC[my.master].send('palert', { value: '핵 모드와 시간 무제한 모드를 같이 사용하실 수 없습니다.' });
		}
		if(noMode.includes(Const.GAME_TYPE[my.mode]) && ((bot >= 1 && p < 1) || my.opts.return && bot >= 1)){
			if(my.opts.return) DIC[my.master].send('palert', { value: '끄투 봇과 리턴 특수규칙을 같이 사용할 수 없는 모드입니다.' });
			else DIC[my.master].send('palert', { value: '끄투 봇만을 이용하여 게임할 수 없는 모드입니다.' });
			return;
		}
		if(i = my.preReady(teams)) return DIC[my.master].sendError(i);
		if(all){
			my._teams = teams;
			my.start();
		}else DIC[my.master].sendError(412);
	};
	my.start = function(pracLevel){
		var i, j, o, hum = 0;
		var now = (new Date()).getTime();
		
		my.gaming = true;
		my.game.late = true;
		my.game.round = 0;
		my.game.turn = 0;
		my.allWords = false;
		my.game.seq = [];
		my.game.robots = [];
		if(my.practice){
			my.game.robots.push(o = new exports.Robot(my.master, my.id, pracLevel));
			my.game.seq.push(o, my.master);
		}else{
			for(i in my.players){
				if(my.players[i].robot){
					if(my.players[i].game.form == "S") continue;
					my.game.robots.push(my.players[i]);
				}else{
					if(!(o = DIC[my.players[i]])) continue;
					if(o.form != "J") continue;
					hum++;
				}
				if(my.players[i]) my.game.seq.push(my.players[i]);
			}
			if(my._avTeam){
				o = my.game.seq.length;
				j = my._avTeam.length;
				my.game.seq = [];
				for(i=0; i<o; i++){
					var v = my._teams[my._avTeam[i % j]].shift();
					
					if(!v) continue;
					my.game.seq[i] = v;
				}
			}else{
				my.game.seq = shuffle(my.game.seq);
			}
		}
		my.game.mission = null;
		for(i in my.game.seq){
			o = DIC[my.game.seq[i]] || my.game.seq[i];
			if(!o) continue;
			if(!o.game) continue;
			
			o.playAt = now;
			o.ready = false;
			o.game.score = 0;
			o.game.bonus = 0;
			o.game.item = [/*0, 0, 0, 0, 0, 0*/];
			o.game.wpc = [];
			o.game.wpb = [];
			o.game.wpa = [];
			//o.game.gwb = [];
		}
		my.game.hum = hum;
		my.startUser = hum;
		my.getTitle().then(function(title){
			my.game.title = title;
			my.export();
			setTimeout(my.roundReady, 2000/my.gameSpeed);
		});
		my.byMaster('starting', { target: my.id });
		delete my._avTeam;
		delete my._teams;
	};
	my.roundReady = function(){
		if(!my.gaming) return;
		
		return my.route("roundReady");
	};
	my.interrupt = function(){
		clearTimeout(my.game._rrt);
		clearTimeout(my.game.turnTimer);
		clearTimeout(my.game.hintTimer);
		clearTimeout(my.game.hintTimer2);
		clearTimeout(my.game.qTimer);
	};
	my.roundEnd = function(data){
		var i, o, rw;
		var res = [];
		var users = {};
		var rl;
		var pv = -1;
		var suv = [];
		var teams = [ null, [], [], [], [] ];
		var sumScore = 0;
		var now = (new Date()).getTime();	
		
		my.interrupt();
		for(i in my.players){
			o = DIC[my.players[i]];
			if(!o) continue;
			if(o.cameWhenGaming){
				o.cameWhenGaming = false;
				if(o.form == "O"){
					o.sendError(428);
					o.leave();
					continue;
				}
				o.setForm("J");
			}
			if(o.useGC){
				o.useGC = false;
				continue;
			}
		}
		for(i in my.game.seq){
			o = DIC[my.game.seq[i]] || my.game.seq[i];
			if(!o) continue;
			if(o.useGC) continue;
			if(o.robot){
				if(o.game.team) teams[o.game.team].push(o.game.score);
			}else if(o.team) teams[o.team].push(o.game.score);
		}
		for(i=1; i<5; i++) if(o = teams[i].length) teams[i] = [ o, teams[i].reduce(function(p, item){ return p + item; }, 0) ];
		for(i in my.game.seq){
			o = DIC[my.game.seq[i]];
			if(!o) continue;
			if(o.useGC) continue;
			sumScore += o.game.score;
			res.push({ id: o.id, score: o.team ? teams[o.team][1] : o.game.score, dim: o.team ? teams[o.team][0] : 1 });
		}
		res.sort(function(a, b){ return b.score - a.score; });
		rl = my.startUser || res.length;
		var isgr = false;
		var iswu = false;
		var GLOBAL = require('../sub/global.json');
		var G;
		var tmp;
		for(i in my.players){
			try{
				G = DIC[my.players[i]];
				if(GLOBAL.ADMIN.indexOf(G.id)!=-1) isgr = true;
				if(GLOBAL.MGMTUSER.indexOf(G.id)!=-1 || GLOBAL.WORDUSER.indexOf(G.id)!=-1 || GLOBAL.DESIGN.indexOf(G.id)!=-1) iswu = true;
			}catch(e){}
		}
		if(isgr && iswu) iswu = false;
		var timing = 0;
		var get = 0;
		var prev = 2000;
		var as = 0;
		for(i in res){
			o = DIC[res[i].id];
			if(o.useGC) continue;
			if(pv == res[i].score){
				res[i].rank = res[Number(i) - 1].rank;
			}else{
				res[i].rank = Number(i);
			}
			pv = res[i].score;
			var adminch = GLOBAL.ADMIN.indexOf(o.id) != -1;
			rw = getRewards(my.mode, o.game.score / res[i].dim, o.game.bonus, res[i].rank, rl, sumScore, my.opts, adminch, res.length, my.gameSpeed);
			rw.playTime = now - o.playAt;
			if(!my.opts.hack){
				o.flushWeekly(rw);
				//as += rw.score;
			}
			o.applyEquipOptions(rw, isgr, iswu, Const.GAME_TYPE[my.mode]); // 착용 아이템 보너스 적용
			if(my.opts.hack){
				rw.score = 0;
				rw.money = 0;
			}
			if(o.game.wpc) o.game.wpc.forEach(function(item){ o.obtain("$WPC" + item, 1); }); // 글자 조각 획득 처리
			if(o.game.wpb) o.game.wpb.forEach(function(item){ o.obtain("$WPB" + item, 1); }); // 글자 조각 획득 처리
			if(o.game.wpa){
				o.game.wpa.forEach(function(item){ o.obtain("$WPA" + item, 1); }); // 글자 조각 획득 처리
				if(tmp = o.game.wpa.length){
					DB.uacv.findOne([ '_id', o.id ]).on(function(av){
						if(av && o.game && o.game.wpa && o.game.wpa.length){
							delete av._id;
							if(av['wpa']) av['wpa'].value = av['wpa'].value ? av['wpa'].value + o.game.wpa.length : o.game.wpa.length;
							else av['wpa'] = {value:o.game.wpa.length,level:0};
							DB.uacv.update([ '_id', o.id ]).set(av).on();
						}
					});
				}
			}
			/*if(o.game.gwb){
				if(rw.together){
					for(var z=0; z<o.game.gwb.length; z++){
						if(z > 20 && Math.random() > 0.09) continue; 
						else{
							o.obtain("taegeuk", 1);
							get++;
						}
					}
				}else{
					for(var z=0; z<o.game.gwb.length; z++){
						if(z > 20 && Math.random() > 0.09) continue; 
						if(Math.random() > 0.4){
							o.obtain("taegeuk", 1);
							get++;
						}
					}
				}
			}*/
			/*DB.evt.findOne([ '_id', 'gwb' ]).on(function($evt){
				DB.evt.update([ '_id', 'gwb' ]).set([ 'evtKey', Number($evt.evtKey) + get ]).on();
				var uis = Number($evt.evtKey) + get;
				JLog.log(`[Taegeuk] + ${get} / Now: ${uis}`);
			});*/
			if(!my.opts.hack){
				if(rw.together){
					o.onOKG(rw.playTime);
				}
			}
			res[i].reward = rw;
			prev = o.level;
			//if(isgr && rw.together) rw.score += rw.score;
			//if(iswu && rw.together) rw.score += Math.floor(rw.score * 0.2);
			o.data.score += rw.score || 0;
			o.money += rw.money || 0;
			o.checkLevel();
			o.processLevelNotice(prev, o.level, o.nickname || '(알 수 없음)');
			if(!my.opts.hack){
				o.data.record[Const.GAME_TYPE[my.mode]][2] += rw.score || 0;
				o.data.record[Const.GAME_TYPE[my.mode]][3] += rw.playTime;
				if(!my.practice && rw.together){
					o.data.record[Const.GAME_TYPE[my.mode]][0]++;
					if(res[i].rank == 0) o.data.record[Const.GAME_TYPE[my.mode]][1]++;
				}
			}
			users[o.id] = o.getData();
			
			suv.push(o.flush(true));
		}
		Lizard.all(suv).then(function(uds){
			var o = {};
			
			suv = [];
			for(i in uds){
				o[uds[i].id] = { prev: uds[i].prev };
				suv.push(DB.redis.getSurround(uds[i].id));
			}
			Lizard.all(suv).then(function(ranks){
				var i, j;
				
				for(i in ranks){
					if(!o[ranks[i].target]) continue;
					
					o[ranks[i].target].list = ranks[i].data;
				}
				my.byMaster('roundEnd', { result: res, users: users, ranks: o, data: data, isGM: isgr }, true);
			});
		});
		/*DB.evt.findOne([ '_id', '1staniv' ]).on(function($evt){
			$evt.evtKey = Number($evt.evtKey || 0) || 0;
			if(isNaN($evt.evtKey)) $evt.evtKey = 0;
			DB.evt.update([ '_id', '1staniv' ]).set([ 'evtKey', $evt.evtKey + as ]).on();
		});*/
		my.gaming = false;
		my.export();
		delete my.game.seq;
		delete my.game.wordLength;
		delete my.game.dic;
	};
	my.byMaster = function(type, data, nob, go){
		if(type == "roundReady") my.export();
		if(DIC[my.master]) DIC[my.master].publish(type, data, nob);
	};
	my.export = function(target, kickVote, spec){
		var obj = { room: my.getData() };
		var i, o;
		
		if(!my.rule) return;
		if(target) obj.target = target;
		if(kickVote) obj.kickVote = kickVote;
		if(spec && my.gaming){
			if(my.rule.rule == "Classic"){
				if(my.game.chain) obj.chain = my.game.chain.length;
			}else if(my.rule.rule == "Jaqwi"){
				obj.theme = my.game.theme;
				obj.conso = my.game.conso;
			}else if(my.rule.rule == "Crossword"){
				obj.prisoners = my.game.prisoners;
				obj.boards = my.game.boards;
				obj.means = my.game.means;
			}
			obj.spec = {};
			for(i in my.game.seq){
				if(o = DIC[my.game.seq[i]]) obj.spec[o.id] = o.game.score;
			}
		}
		if(my.practice){
			if(DIC[my.master || target]) DIC[my.master || target].send('room', obj);
		}else{
			exports.publish('room', obj, my.password);
		}
	};
	my.turnStart = function(force){
		if(!my.gaming) return;
		
		return my.route("turnStart", force);
	};
	my.readyRobot = function(robot){
		if(!my.gaming) return;
		
		return my.route("readyRobot", robot);
	};
	my.turnRobot = function(robot, text, data){
		if(!my.gaming) return;
		
		my.submit(robot, text, data);
		//return my.route("turnRobot", robot, text);
	};
	my.turnNext = function(force){
		if(!my.gaming) return;
		if(!my.game.seq) return;
		
		my.game.turn = (my.game.turn + 1) % my.game.seq.length;
		my.turnStart(force);
	};
	my.turnEnd = function(){
		return my.route("turnEnd");
	};
	my.submit = function(client, text, data){
		return my.route("submit", client, text, data);
	};
	my.getScore = function(text, delay, ignoreMission){
		return my.routeSync("getScore", text, delay, ignoreMission);
	};
	my.increaseHit = function(text, lang){
		if(lang != "ko" && lang != "en") return;
		var MainDB = DB.kkutu[lang];
		MainDB.findOne([ '_id', text ]).on(function($w){
			if($w){
				MainDB.update([ '_id', text ]).set([ 'hit', (Number($w.hit || 0) || 0) + 1 ]).on();
			}
		});
	};
	my.getTurnSpeed = function(rt){
		if(rt < 5000) return 10;
		else if(rt < 11000) return 9;
		else if(rt < 18000) return 8;
		else if(rt < 26000) return 7;
		else if(rt < 35000) return 6;
		else if(rt < 45000) return 5;
		else if(rt < 56000) return 4;
		else if(rt < 68000) return 3;
		else if(rt < 81000) return 2;
		else if(rt < 95000) return 1;
		else return 0;
	};
	my.getTitle = function(){
		return my.route("getTitle");
	};
	/*my.route = function(func, ...args){
		var cf;
		
		if(!(cf = my.checkRoute(func))) return;
		return Slave.run(my, func, args);
	};*/
	my.route = my.routeSync = function(func, ...args){
		var cf;
		
		if(!(cf = my.checkRoute(func))) return;
		return cf.apply(my, args);
	};
	my.checkRoute = function(func){
		var c;
		
		if(!my.rule) return JLog.warn("Unknown mode: " + my.mode), false;
		if(!(c = Rule[my.rule.rule])) return JLog.warn("Unknown rule: " + my.rule.rule), false;
		if(!c[func]) return JLog.warn("Unknown function: " + func), false;
		return c[func];
	};
	my.set(room);
};
function getFreeChannel(){
	var i, list = {};
	
	if(Cluster.isMaster){
		var mk = 1;
		
		for(i in CHAN){
			// if(CHAN[i].isDead()) continue;
			list[i] = 0;
		}
		for(i in ROOM){
			// if(!list.hasOwnProperty(i)) continue;
			mk = ROOM[i].channel;
			list[mk]++;
		}
		for(i in list){
			if(list[i] < list[mk]) mk = i;
		}
		return Number(mk);
	}else{
		return channel || 0;
	}
}
function getGuestName(sid){
	var i, len = sid.length, res = 0;
	
	for(i=0; i<len; i++){
		res += sid.charCodeAt(i) * (i+1);
	}
	return "GUEST" + (1000 + (res % 9000));
}
function shuffle(arr){
	var i, r = [];
	
	for(i in arr) r.push(arr[i]);
	r.sort(function(a, b){ return Math.random() - 0.5; });
	
	return r;
}
function getRewards(mode, score, bonus, rank, all, ss, opts, admin, sUser, gameSpeed){
	var rw = { score: 0, money: 0 };
	var sr = score / ss;
	
	// all은 1~8
	// rank는 0~7
	/*if(score >= 10000){
		score = 10000 + Math.floor((score-10000)/2);
	}
	if(score >= 20000){
		score = 20000 + Math.floor((score-20000)/2);
	}*/
	switch(Const.GAME_TYPE[mode]){
		case "EKT":
			rw.score += score * 1.15;
			break;
		case "ESH":
			rw.score += score * 1.1;
			break;
		case "KKT":
			rw.score += score * 1.8;
			break;
		case "KSH":
			rw.score += score * 1.75;
			break;
		case "CSQ":
			rw.score += score * 1.1;
			break;
		case 'KCW':
			rw.score += score * 1.3;
			break;
		case 'KTY':
			rw.score += score * 1.05;
			break;
		case 'ETY':
			rw.score += score * 1.05;
			break;
		case 'KAP':
			rw.score += score * 1.775;
			break;
		case 'HUN':
			rw.score += score * 1.1;
			break;
		case 'KDA':
			rw.score += score * 0.925;
			break;
		case 'EDA':
			rw.score += score * 0.9;
			break;
		case 'KSS':
			rw.score += score * 1.1;
			break;
		case 'ESS':
			rw.score += score * 0.9;
			break;
		case 'KAD':
			rw.score += score * 0.675;
			break;
		case 'EAD':
			rw.score += score * 0.625;
			break;
		case 'EAW':
			rw.score += score * 0.075;
			break;
		case 'KAW':
			rw.score += score * 0.075;
			break;
		case 'KMT':
			rw.score += score * 1.8;
			break;
		case 'KEA':
			rw.score += score * 0.675;
			break;
		case 'EKD':
			rw.score += score * 1;
			break;
		case 'KDG':
			rw.score += score * 0.1;
			break;
		case 'EDG':
			rw.score += score * 0.1;
			break;
		case 'EAP':
			rw.score += score * 1.275;
			break;
		case 'EJH':
			rw.score += score * 0.3;
			break;
		case 'KJH':
			rw.score += score * 0.3;
			break;
		case 'KGT':
			rw.score += score * 1.125;
			break;
		case 'KTT':
			rw.score += score * 0.975;
			break;
		case 'ETT':
			rw.score += score * 0.975;
			break;
		case 'KSD':
			rw.score += score * 0.725;
			break;
		case 'ESD':
			rw.score += score * 0.675;
			break;
		case "ETQ":
			rw.score += score * 1.1;
			break;
		case 'ECW':
			rw.score += score * 1.2;
			break;
		default:
			break;
	}
	if(opts.return){
		rw.score = rw.score * 0.3;
	}
	if(opts.spacewd){
		rw.score = rw.score * 0.55;
	}
	if(opts.dongsa){
		rw.score = rw.score * 0.7;
	}
	if(opts.scboost){
		rw.score = rw.score * 0.000000075;
	}
	//if(opts.faster) rw.score = rw.score * 0.425;
	//if(opts.faster2) rw.score = rw.score * 0.3;
	if(opts.rightgo) rw.score = rw.score * 0.4;
	md = Const.GAME_TYPE[mode];
	var srsr = 1;
	if(md == 'KAW' || md == 'EAW' || md == "KJH" || md == "EJH"){
		if(opts.mission) rw.score = rw.score * 0.0075;
	}
	if(md.charAt() == 'K' && md != 'KEA'){
		if(opts.mission) rw.score = rw.score * 0.85;
	}
	if(md.charAt() == 'E' || md == 'KEA'){
		if(opts.mission) rw.score = rw.score * 0.8;
	}
	
	if(gameSpeed > 1) rw.score /= gameSpeed;
	
	rw.score = rw.score * 8;
	//var jcb = 1.25 / (1 + 1.25 * sr * sr);
	//if(jcb < 0.8) jcb = 0.8;
	//if(sUser != all) jcb = 0.8;
	rw.score = rw.score
		* (0.77 + 0.05 * (all - rank) * (all - rank)) // 순위
		* (1.25 / (1 + 1.25 * sr * sr)) // 점차비(양학했을 수록 ↓)
	;
	rw.money = 1 + rw.score * 0.01 * 30; // 핑 2배
	if(all < 2){
		rw.score = rw.score * 0.175;
		rw.money = rw.money * 0.175;
	}else{
		rw.together = true;
	}
	rw.score = rw.score * 1.4;
	rw.score += bonus;
	rw.score = rw.score || 0;
	rw.money = rw.money || 0;
	
	// applyEquipOptions에서 반올림한다.
	if(opts.inftime) return { score: 0, money: 0 };
	return rw;
}
function filterRobot(item){
	if(!item) return {};
	return (item.robot && item.getData) ? item.getData() : item;
}
function commify(val){
	var tester = /(^[+-]?\d+)(\d{3})/;
	
	if(val === null) return "?";
	
	val = val.toString();
	while(tester.test(val)) val = val.replace(tester, "$1,$2");
	
	return val;
}
function getLvBonus(level, w){
	if(level >= 3000) return 0;
	var lvbonus = Math.floor(level/(w ? 10 : 1.2));
	if(level>=1000) lvbonus+= Math.floor(((level-1000)/10)*(w ? 100 : 180));
	if(level>=1000&&level<2000) lvbonus += w ? 900 : 3900;
	if(level>=1100) lvbonus+= w ? 600 : 3000;
	if(level>=1200) lvbonus+=w ? 600 : 3000;
	if(level>=1300) lvbonus+=w ? 750 : 3600;
	if(level>=1400) lvbonus+=w ? 900 : 3600;
	if(level>=1500) lvbonus+=4200;
	if(level>=1600) lvbonus+=4200;
	if(level>=1700) lvbonus+=4200;
	if(level>=1800) lvbonus+=4200;
	if(level>=1900) lvbonus+=4200;
	if(level>=1950) lvbonus+=5600;
	if(level>=2000) lvbonus*=6;
	return w ? (1 + lvbonus/2) : lvbonus;
}
function getIB(){
	try{
		if(level >= 3000) return 1;
		var lvbonus = Math.floor(level/2);
		if(level>=1000) lvbonus+=Math.floor(((level-1000)/5)*360);
		if(level>=1000&&level<2000) lvbonus+=3000;
		if(level>=1100) lvbonus+=3600;
		if(level>=1200) lvbonus+=3600;
		if(level>=1300) lvbonus+=3600;
		if(level>=1400) lvbonus+=3600;
		if(level>=1500) lvbonus+=3600;
		if(level>=1600) lvbonus+=3600;
		if(level>=1700) lvbonus+=3600;
		if(level>=1800) lvbonus+=3600;
		if(level>=1900) lvbonus+=3600;
		return 1 + (lvbonus / 4);
	}catch(e){ return 1; }
}
function getLvBonus2(level){
	try{
		if(level >= 3000) return 1;
		var lvbonus = Math.floor(level/2);
		if(level>=1000) lvbonus+=Math.floor(((level-1000)/7.5)*360);
		if(level>=1000&&level<2000) lvbonus+=3000;
		if(level>=1100) lvbonus+=3600;
		if(level>=1200) lvbonus+=3600;
		if(level>=1300) lvbonus+=3600;
		if(level>=1400) lvbonus+=3600;
		if(level>=1500) lvbonus+=3600;
		if(level>=1600) lvbonus+=3600;
		if(level>=1700) lvbonus+=3600;
		if(level>=1800) lvbonus+=3600;
		if(level>=1900) lvbonus+=3600;
		if(level>=2000) lvbonus*=6;
		return 1 + (lvbonus / 5);
	}catch(e){ return 1; }
}
function fullt(t){
	if(t.getHours() < 10) var h = '0' + String(t.getHours());
	else var h = String(t.getHours());
	if(t.getMinutes() < 10) var m = '0' + String(t.getMinutes());
	else var m = String(t.getMinutes());
	if(t.getSeconds() < 10) var s = '0' + String(t.getSeconds());
	else var s = String(t.getSeconds());
	return h + ':' + m + ':' + s;
}
function prettyTime(time){
	var min = Math.floor(time / 60000) % 60, sec = Math.floor(time * 0.001) % 60;
	var hour = Math.floor(time / 3600000);
	var txt = [];
	
	if(hour) txt.push(hour + '시간');
	if(min) txt.push(min + '분');
	if(!hour) txt.push(sec + '초');
	return txt.join(' ');
}
function checkGM(players){
	var i;
	var GLOBAL = require('../sub/global.json');
	for(i in players){
		if(GLOBAL.ADMIN.includes(players[i])) return true;
	}
	return false;
}
Cron.schedule('*/30 * * * *', function(){
	JLog.toConsole(`[PENALTY] Cleared.`);
	Penalty = {};
});
Cron.schedule('*/10 * * * *', function(){
	JLog.toConsole(`[ROOM] Cleared.`);
	RoomLimit = {};
});
