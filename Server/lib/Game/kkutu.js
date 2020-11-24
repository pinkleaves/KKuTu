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

const ClientVersion = '3.1.2';
var GUEST_PERMISSION;
var Cluster = require("cluster");
var Const = require('../const');
var Lizard = require('../sub/lizard');
var GLOBAL = require('../sub/global.json');
var ReqExp = require('../sub/reqexp');
var JLog = require('../sub/jjlog');
// 망할 셧다운제 var Ajae = require("../sub/ajae");
var DB;
var SHOP;
var DIC;
var ROOM;
var _rid;
var chatblocked = false;
var Rule;
var guestProfiles = [];
var CHAN;
var channel = process.env['CHANNEL'] || 0;
var prid;
var ridch = false;
var SLOW = 0;
var DoS = {};
var Hwak = {};
const NUM_SLAVES = 4;
const GUEST_IMAGE = "/img/kkutu/guest.png";
const MAX_OKG = 18;
const ALL_OKG = 288;
const PER_OKG = 300000;
const MAX_MISSION = 3;
const hyogwa = [120, 125, 150, 190, 220, 260, 300, 340, 400, 500, 500];
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
		c: 보상 방식 0: EXP 1: MNY 2: ETC 3: EXP/MNY (Developing)
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
function levelBonus(level){
var lvbonus = level>=2000?0:Math.floor(level/1);
if(level>=1000) lvbonus+=level>=2000?0:Math.floor(((level-1000)*15));
if(level>=1000&&level<2000) lvbonus+=36000;
if(level>=1100&&level<2000) lvbonus+=36000;
if(level>=1200&&level<2000) lvbonus+=36000*1.5;
if(level>=1300&&level<2000) lvbonus+=36000;
if(level>=1400&&level<2000) lvbonus+=36000*1.5;
if(level>=1500&&level<2000) lvbonus+=36000*1.5;
if(level>=1750&&level<2000) lvbonus+=36000;
if(level>=1900&&level<2000) lvbonus+=72000;
return lvbonus;
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
	_rid = 1;
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
exports.Robot = function(target, place, level){
	var my = this;
	
	my.id = target + place + Math.floor(Math.random() * 1000000000);
	my.robot = true;
	my.game = { ready: true };
	my.Stats = true;
	my.data = {};
	my.place = place;
	my.target = target;
	my.equip = { robot: true };
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
		my.level = level;
		my.data.score = Math.pow(10, level + 2);
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
			default:
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
		}
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
			if(Cluster.isWorker) process.send({ type: "tail-report", id: my.id, chan: channel, place: my.place, msg: data.error ? msg : data });
			
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
		my.publish = function(type, data, noBlock, spamCheck){
			var i;
			var now = new Date(), st = now - my._pub;
			if(type != 'kdn'){
				if((type == 'chat' && spamCheck) || type != 'chat'){
					if(st <= Const.SPAM_ADD_DELAY) my.spam++;
					else if(st >= Const.SPAM_CLEAR_DELAY) my.spam = 0;
					if(my.spam >= Const.SPAM_LIMIT){
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
			if(my.publish('chat', { value: '', notice: false }, undefined, true) == true) return my.send('blocked');
			if(my.noChat) return my.send('chat', { notice: true, code: 443 });
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
					chatblocked = true;
					return;
				}
			}
			if(msg == '#CHATBLOCK OFF'){
				if(admincheck || mgmtcheck){
					chatblocked = false;
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
			if(mn - my.last < SLOW && !my.place){
				var slo = SLOW - (mn - my.last);
				slo = slo >= 1 ? Math.floor((SLOW - (mn - my.last))) : Math.floor((SLOW - (mn - my.last)) * 10) / 10;
				if(slo < 0.1) slo = '잠시 후';
				else slo = String(slo) + '초 후';
				return my.send('notice', { value: `슬로우 모드가 적용되었습니다. ${slo}에 채팅이 가능합니다.` });
			}
			try{
				if(my.place){
					let $room = ROOM[my.place];
					if(mn - my.roomlast < $room.slow){
						var slo = $room.slow - (mn - my.roomlast);
						slo = slo >= 1 ? Math.floor(($room.slow - (mn - my.roomlast))) : Math.floor(($room.slow - (mn - my.roomlast)) * 10) / 10;
						if(slo < 0.1) slo = '잠시 후';
						else slo = String(slo) + '초 후';
						return my.send('notice', { value: `슬로우 모드가 적용되었습니다. ${slo}에 채팅이 가능합니다.` });
					}
					my.roomlast = kk.getTime() / 1000;
				}
			}catch(e){
				
			}
			//var kk = new Date();
			my.last = kk.getTime() / 1000;
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
		my.hwak = function(msg){
			if(my.guest) return;
			if(!msg || msg.replace(/\s/g, '') == "") return;
			msg = msg.substr(0, 200);
			if(Cluster.isMaster){
				DB.users.findOne([ '_id', my.id ]).on(function($hwak){
					if(!$hwak) return;
					if(!$hwak.fingerprint || $hwak.fingerprint == null || $hwak.fingerprint == undefined) return;
					var fp = $hwak.fingerprint;
					var Time = new Date().getTime();
					var prev;
					if(prev = Hwak[fp]){
						if(Time - Number(prev) < 300000) return my.send('notice', { value: '확성기는 5분에 1회 사용 가능합니다.' });
						else{
							Hwak[fp] = Time;
							exports.publish('hwak', { value: msg, sender: my.id });
						}
					}else{
						Hwak[fp]=Time;
						exports.publish('hwak', { value: msg, sender: my.id });
					}
				});
			}
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
				if(my.hasOwnProperty('ClientVersion')){
					if(my.ClientVersion != ClientVersion) return my.send('notice', { value: '적용되지 않은 클라이언트 패치/업데이트가 있습니다. Shift+F5를 클릭하여 재접속을 하시면 적용됩니다.' });
				}else{
					return my.send('notice', { value: '클라이언트 버전 정보를 확인할 수 없습니다. 정상적인 서비스 이용을 위해 가급적 재접속을 진행하여 주시기 바랍니다.' });
				}
			}, 3000);
		};
		my.checkCallback = function(ver){
			my.ClientVersion = ver == 'SKKuTu' ? ClientVersion : ver;
		};
		my.refresh = function(){
			var R = new Lizard.Tail();
			var ip = my.socket.upgradeReq.headers['x-forwarded-for'];
			if(!ip) {
				my.sendError(998);
				my.socket.close();
				return;
			};
			DB.black_ip.findOne([ 'ip', ip ]).on(function($gy){
				if(!!$gy){
					if(($gy.blackt && Number($gy.blackt) > Date.now()) || !$gy.blackt || $gy.blackt < 0){
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
				try{
					if($user.hasOwnProperty('blackt') && $user.blackt != null && $user.blackt != undefined && $user.black){
						if($user.blackt < 0) var ble = false;
						else var ble = $user.blackt;
					}
				}catch(e){
					var ble = false;
				}
				var blackend = ble ? $user.blackt <= Date.now() : false;
				if(!first && blackend && ($user.black != "null" && $user.black != "")){
					DB.users.update([ '_id', my.id ]).set([ 'blackt', 0 ], [ 'black', 'null' ]).on();
					$user.black = "";
					JLog.log(`UNBAN [${my.id}]`);
				}
				var black = first ? "" : $user.black;
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
				if(black == "chat"){
					black = false;
					my.noChat = true;
				}
				if(!my.last) my.last = 1;
				if(!my.roomlast) my.roomlast = 1;
				var pst;
				var cdval = 30;
				if(!$user.accessTime) $user.accessTime = { date: jss, time: 0 };
				if($user.accessTime.date != jss){
					my.accessTime = 0;
					$user.accessTime = { date: jss, time: 0 };
				}
				/*if(!first && $user.kkutu.score != 0 && ss){
					var gwb = 0;
					var k;
					var q = 1;
					/*if(jss == "2020716"){
						gwb = 400000;
						k = "box_ping";
						if(!$user.box) $user.box = {};
						if($user.box[k]) $user.box[k] += q;
						else $user.box[k] = q;
						k = "boxB2";
						if($user.box[k]) $user.box[k] += q;
						else $user.box[k] = q;
						DB.users.update([ '_id', my.id ]).set([ 'box', $user.box ]).on();
						my.send('notice', { value: '광복절 이벤트 보상으로 40만 경험치, 희귀 휘장 상자 1개, 핑 상자 1개가 지급되었습니다.' });
					}
					pst = Math.round(Math.random() * 10000) / 100;
					if(pst >= 50) var ltat = { code: 673, exp: 2000 };
					else if(pst < 50 && pst > 15) var ltat = { code: 674, exp: 10000 };
					else if(pst <= 15 && pst > 2) var ltat = { code: 675, exp: 20000 };
					else if(pst <= 2 && pst > 0.6) var ltat = { code: 676, exp: 50000 };
					else if(pst <= 0.6 && pst > 0.1) var ltat = { code: 677, exp: 100000 };
					else if(pst <= 0.1) var ltat = { code: 678, exp: 300000 };
					else var ltat = { code: 673, exp: 1000 };
					
					//if(!black && ss) my.send('chat', { notice: true, code: weekend ? ltat.code + 12 : ltat.code + 6 });
					
					pst = Math.round(Math.random() * 10000) / 100;
					if(pst >= 50) var stat = { code: 667, ping: 1000 };
					else if(pst < 50 && pst > 10) var stat = { code: 668, ping: 5000 };
					else if(pst <= 15 && pst > 2) var stat = { code: 669, ping: 10000 };
					else if(pst <= 2 && pst > 0.6) var stat = { code: 670, ping: 25000 };
					else if(pst <= 0.6 && pst > 0.1) var stat = { code: 671, ping: 50000 };
					else if(pst <= 0.1) var stat = { code: 672, ping: 100000 };
					else var stat = { code: 667, ping: 1000 };
					//if(!black && ss) my.send('chat', { notice: true, code: weekend ? stat.code + 6 : stat.code });
					var wdu = false;
					var mgu = false;
					var GLOBAL = require('../sub/global.json');
					try{
						wdu = GLOBAL.WORDUSER.indexOf($user._id)!=-1;
						mgu = GLOBAL.DESIGN.indexOf($user._id)!=-1;
					}catch(e){
						JLog.log('AccessGift Error: ' + e.toString());
					}
					var kswk = '접속 보상으로 <del>' + String(ltat.exp) + '</del> → <b>' + String(ltat.exp * 4) + ' 경험치</b>가 지급되었습니다.';
					var pswk = '접속 보상으로 <del>' + String(stat.ping) + '</del> → <b>' + String(stat.ping * 4) + ' 핑</b>이 지급되었습니다.';
					my.send('notice', { value: weekend ? kswk : '접속 보상으로 <del>' + String(ltat.exp) + '</del> → <b>' + String(ltat.exp * 2) + '</b> 경험치가 지급되었습니다.' });
					my.send('notice', { value: weekend ? pswk : '접속 보상으로 <del>' + String(stat.ping) + '</del> → <b>' + String(stat.ping * 2) + '</b> 핑이 지급되었습니다.' });
					if(ss){
						try{
							if(weekend){
								cdval = cdval * 4;
								ltat.exp = ltat.exp * 4;
								stat.ping = stat.ping * 4;
								my.send('chat', { notice: true, code: 695 });
							}else{
								ltat.exp = ltat.exp * 2;
								stat.ping = stat.ping * 2;
								my.send('chat', { notice: true, code: 754 });
							}
							var puser = { money: $user.money, score: $user.kkutu.score };
							$user.kkutu.score += ltat.exp;
							$user.kkutu.score += gwb;
							DB.users.update([ '_id', my.id ]).set([ 'money', Number($user.money) + stat.ping + 10000 ]).on();
							my.send('notice', { value: '<b>강화 비용 지원 중!!</b> 10,000핑이 지급되었습니다.' });
							DB.users.update([ '_id', my.id ]).set([ 'kkutu', $user.kkutu ]).on();
							if($user.money == puser.money) $user.money = Number($user.money) + stat.ping + 10000;
							if($user.kkutu.score == puser.score) $user.kkutu.score = Number($user.kkutu.score) + ltat.exp + gwb;
							var jjjs = $user;
							JLog.log(`AccessGift: [${jjjs._id}] EXP+${ltat.exp}, PING+${stat.ping}`);
							
							if(wdu || mgu){
								var juser = { money: $user.money, score: $user.kkutu.score };
								var jlll = Math.floor(Math.random() * 2);
								var resll = '';
								if(jlll == 0){
									DB.users.update([ '_id', my.id ]).set([ 'money', Number($user.money) + 500 ]).on();
									if($user.money == juser.money) $user.money = Number($user.money) + 500;
									resll = 'PING+500';
									my.send('chat', { notice: true, code: 705 });
								}else{
									$user.kkutu.score += 1000;
									DB.users.update([ '_id', my.id ]).set([ 'kkutu', $user.kkutu ]).on();
									if($user.kkutu.score == juser.score) $user.kkutu.score = Number($user.kkutu.score) + 1000;
									resll = 'EXP+1000';
									my.send('chat', { notice: true, code: 706 });
								}
								JLog.log(`GwalliGift: [${jjjs._id}] ${resll}`);
							}
						}catch(e){
							JLog.log('AccessGift Error: ' + e.toString());
						}
					}
					
					var dnk = $user.nickname || '<b><font color="green">이름 없는 사용자</font></b>';
					knk = dnk + '님이 접속 보상으로 <font color="green">' + String(ltat.exp) + '경험치</font>를 획득하였습니다.';
					if(ltat.exp >= 100000 && !weekend) exports.publish('notice', { value: knk });
					if(ltat.exp >= 200000 && weekend) exports.publish('notice', { value: knk });
					knk = dnk + '님이 접속 보상으로 <font color="green">' + String(stat.ping) + '핑</font>을 획득하였습니다.';
					if(stat.ping >= 50000 && !weekend) exports.publish('notice', { value: knk });
					if(stat.ping >= 100000 && weekend) exports.publish('notice', { value: knk });
					
				}*/
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
				my.money = Number($user.money);
				my.friends = $user.friends || {};
				if(first) my.flush();
				else{
					my.checkExpire();
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
					var rewardArrived = '우편함에 보상 도착! 우측 상단의 <i class="fa fa-envelope"></i> 버튼을 클릭하여 보상을 확인해 보세요!';
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
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: {exp:{amount:Math.ceil((Math.random()+1)*55*(levelBonus(ReqExp.getLevel(my.data.score))/1.3125))},mny:{amount:Math.floor(Math.random()*25000)+1}}};
								}
								if(M.name == 'Access'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((1+(M.level/6))*(Math.random()+1)*30*(levelBonus(ReqExp.getLevel(my.data.score))/1.3125)) }}:{mny:{amount:Math.floor(Math.random()*5000*(1+(M.level/6)))+1 }}};
								}
								if(M.name == 'CharFactory'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((Math.random()+1)*10*(levelBonus(ReqExp.getLevel(my.data.score))/1.3125)) }}:{mny:{amount:Math.floor(Math.random()*3000*(1+(M.level/6)))+1 }}};
								}
								if(M.name == 'ChangeDress'){
									GOT = true;
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((Math.random()+1)*10*(levelBonus(ReqExp.getLevel(my.data.score))/1.3125)) }}:{mny:{amount:Math.floor(Math.random()*3000)+1 }}};
								}
								if(M.name == 'SearchDict'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((Math.random()+1)*5*(levelBonus(ReqExp.getLevel(my.data.score))/1.3125)) }}:{mny:{amount:Math.floor(Math.random()*2000*(1+(M.level/6)))+1 }}};
								}
								if(M.name == 'DictPage'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount:Math.ceil((Math.random()+1)*10*(levelBonus(ReqExp.getLevel(my.data.score))/1.3125)) }}:{mny:{amount:Math.floor(Math.random()*2000*(1+(M.level/6)))+1 }}};
								}
								if(M.name == 'PlayAllMode'){
									for(C in $user.mission.mission){
										if(C.name == 'ClearALL'){
											$user.mission.mission[C].now = Number(C.now)+1;
										}
									}
									GOT = true;
									$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = { name: '일일 미션 보상', item: M.reward == 0?{exp:{amount: Math.ceil((Math.random()+1+M.level)*10*(levelBonus(ReqExp.getLevel(my.data.score))/1.3125)) }}:{mny:{amount:Math.floor(Math.random()*2000*(1+(M.level/6)))+1 }}};
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
							item: {mny:{amount:5000+Math.floor(Math.random()*15001)}}
						};
						if(jss == '202099'){
							$user.post[new Date().getTime()+Math.floor(Math.random()*10000000000)] = {
								name: '한글날 기념 보상', 
								item: {mny:{amount:100900}}
							};
						}
						GOT = true;
						DB.users.update([ '_id', my.id ]).set([ 'post', $user.post ]).on();
					}
				}
				var nW = new Date();
				if(!my.guest){
					if($user && $user.box && $user.hasOwnProperty('lvup') && $user.lvup != 1 && nW.getTime() < 1605538799000){
						$user.box['box_lvSupport'] = {value:1,expire:1605538799};
						DB.users.update([ '_id', my.id ]).set(
							[ 'box', $user.box ],
							[ 'lvup', 1 ]
						).on();
						my.send('notice', { value: '레벨업 지원 상자가 지급되었습니다. 아이템 보관함에서 사용 가능합니다.' });
					}
				}
							
				if(GOT) my.send('notice', { value: rewardArrived });
				if(!my.guest) my.send('post', { data: $user.post, accessTime: $user.accessTime });
				
				if(black) R.go({ result: 444, black: black });
				//else if(Cluster.isMaster && $user.server) R.go({ result: 409, black: $user.server });
				else if(exports.NIGHT && my.isAjae === false) R.go({ result: 440 });
				else R.go({ result: 200 });
			});
			return R;
		};
		my.viewstat = function(){
			if(my.guest) return;
			DB.users.findOne([ '_id', my.id ]).on(function($stat){
				if(!$stat) return;
				var Remain = renderStatusPoint($stat.kkutu.score);
				var Current = 0;
				if($stat.stat){
					if($stat.stat.exp) Current += Number($stat.stat.exp);
					if($stat.stat.mny) Current += Number($stat.stat.mny);
					if(Current > Remain){
						DB.users.update(['_id',my.id]).set(['stat',{exp:0,mny:0}]).on();
						return my.send('notice', { value: '비 정상적인 시스템 이용이 감지되어 포인트가 초기화되었습니다.' });
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
				var Remain = renderStatusPoint($stat.kkutu.score);
				var Current = 0;
				if($stat.stat){
					if($stat.stat.exp) Current += Number($stat.stat.exp);
					if($stat.stat.mny) Current += Number($stat.stat.mny);
					if(Current > Remain){
						var def = {exp:0,mny:0};
						DB.users.update(['_id',my.id]).set([ 'stat', def ]).on();
						return my.send('notice', { value: '비 정상적인 시스템 이용이 감지되어 포인트가 초기화되었습니다.' });
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
		function renderStatusPoint(exp){
			var lv = ReqExp.getLevel(Number(exp));
			if(lv<=1000) return 4 * lv;
			else{
				return 4000 + (10 * (lv - 1000));
			}
		}
		my.getMission = function(){
			DB.users.findOne([ '_id', my.id ]).on(function($me){
				if($me) my.send('mission', { data: $me.mission || {} });
			});
		};
		my.receiveItem = function(id){
			DB.users.findOne([ '_id', my.id ]).on(function($post){
				if(!$post) return;
				if($post.post[id]){
					var target = $post.post[id].item;
					if(target.exp){
						$post.kkutu.score = Number($post.kkutu.score) + (target.exp.amount || 0);
						my.data.score = $post.kkutu.score;
						my.send('notice', { value: '경험치를 획득했습니다: ' + commify(target.exp.amount) });
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
				my.send('updateme', { kkutu: $post.kkutu, money: $post.money, post: $post.post });
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
				(my.data && !isNaN(my.data.score)) ? [ 'kkutu', my.data ] : undefined,
				box ? [ 'box', my.box ] : undefined,
				equip ? [ 'equip', my.equip ] : undefined,
				friends ? [ 'friends', my.friends ] : undefined
			).on(function(__res){
				DB.redis.getGlobal(my.id).then(function(_res){
					//분홍꽃 수정..
					if(ReqExp.getLevel(my.data.score) >= 2000){
						DB.redis.remove(my.id).then(function(res){
							JLog.log(`FLUSHED [${my.id}] DELETE / PTS=${my.data.score} MNY=${my.money} NICK=${my.nickname}`);
							//R.go({ id: my.id, prev: _res })
						});
						DB.myeong.putGlobal(my.id, my.data.score).then(function(res){
							JLog.log(`FLUSHED [${my.id}] MYEONG / PTS=${my.data.score} MNY=${my.money} NICK=${my.nickname}`);
							R.go({ id: my.id, prev: _res });
						});
					} else {
						DB.redis.putGlobal(my.id, my.data.score).then(function(res){
							JLog.log(`FLUSHED [${my.id}] PTS=${my.data.score} MNY=${my.money} NICK=${my.nickname}`);
							R.go({ id: my.id, prev: _res });
						});
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
			var $room, i;
			
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
				if(!spec){
					if($room.gaming){
						return my.send('error', { code: 416, target: $room.id });
					}else if(my.guest) if(!GUEST_PERMISSION.enter){
						return my.sendError(401);
					}
				}
				if($room.players.length >= $room.limit + (spec ? Const.MAX_OBSERVER : 0)){
					var GLOBAL = require('../sub/global.json');
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
				// 새 방 만들어 들어가기
				/*
					1. 마스터가 ID와 채널을 클라이언트로 보낸다.
					2. 클라이언트가 그 채널 일꾼으로 접속한다.
					3. 일꾼이 만든다.
					4. 일꾼이 만들었다고 마스터에게 알린다.
					5. 마스터가 방 정보를 반영한다.
				*/
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
			var $room = ROOM[my.place];
			
			if(!$room) return;
			
			my.form = mode;
			my.ready = false;
			my.publish('user', my.getData());
		};
		my.setTeam = function(team){
			my.team = team;
			my.publish('user', my.getData());
		};
		my.kick = function(target, kickVote){
			var $room = ROOM[my.place];
			var i, $c;
			var len = $room.players.length;
			
			if(target == null){ // 로봇 (이 경우 kickVote는 로봇의 식별자)
				$room.removeAI(kickVote);
				return;
			}
			for(i in $room.players){
				if($room.players[i].robot) len--;
			}
			kickVote = { target: target, Y: 1, N: 0 };
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
			var $room = ROOM[my.place];
			
			if(!$room) return;
			if($room.master != my.id) return;
			if($room.players.length < 1) return my.sendError(411);
			if(Const.GAME_TYPE[$room.mode] == 'TAK') return my.send('palert', { value: '대화방에서는 게임을 시작할 수 없습니다.' });
			
			$room.ready();
		};
		my.renew = function(){
			my.send('renew', { room: exports.getRoomList(), user: exports.getUserList() });
		};
		my.evtStat = function(){
			DB.evt.findOne([ '_id', 'gwb' ]).on(function($evt){
				try{
					my.send('evtStat', { evtKey: String($evt.evtKey) });
				}catch(e){
					my.send('evtStat', { evtKey: String(0) });
				}
			});
		}
		my.ping = function(){
			my.renew();
			my.send('ping', { a: '' });
			my.accessTime += new Date().getTime() - my.accessLast;
			my.accessLast = new Date().getTime();
		}
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
			var prev = ReqExp.getLevel(my.data.score);
			
			DB.users.findOne([ '_id', uid ]).on(function($user){
				if(!$user) return my.send('cns', { error: 400 });
				if(!$user.box) return my.send('cns', { error: 400 });
				if(!$user.lastLogin) $user.lastLogin = new Date().getTime();
				var q = $user.box[gid];
				var output;
				if(gid == 'dictPage'){
					var naw = new Date();
					var ndate = String(naw.getYear())+String(naw.getMonth())+String(naw.getDate());
					if(!$user.dict) $user.dict = {date:ndate, count:0};
					if($user.dict.date == ndate && $user.dict.count && $user.dict.count >= 1000) return my.send('palert', { value: '하루에 최대 1000개만 사용 가능합니다.' });
					if($user.dict.date != ndate) $user.dict = { date: ndate, count: 0 };
					$user.dict.count = Number($user.dict.count || 0) + 1;
					my.send('notice', { value: '오늘 사용한 백과사전 낱장 개수: ' + $user.dict.count + ' / 1000' });
				}
				
				if(!q) return my.send('cns', { error: 430 });
				
				DB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
					if(!$item) return my.send('cns', { error: 430 });
					consume($user, gid, 1);
					output = useItem($user, $item, gid);
					my.data.score = $user.kkutu.score;
					my.processLevelNotice(prev, ReqExp.getLevel($user.kkutu.score), my.nickname);
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
			if(prev <= 1099 && now >= 1100){
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
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="navy">1600레벨</font>을 달성했습니다!';
			}
			if(prev <= 1699 && now >= 1700){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="navy">1700레벨</font>을 달성했습니다!';
			}
			if(prev <= 1749 && now >= 1750){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="navy">1750레벨</font>을 달성했습니다!';
			}
			if(prev <= 1799 && now >= 1800){
				VAL = (nick || '(알 수 없음) ') + '님이 <font color="navy">1800레벨</font>을 달성했습니다!';
			}
			if(Cluster.isMaster){
				if(VAL) exports.send('notice', { value: VAL });
			}else if(Cluster.isWorker){
				if(VAL) process.send({ type: 'lvnotice', value: VAL });
			}
		}
		my.cnsAll = function(gid){
			if(my.guest) return;
			var uid = my.id;
			// 1200, 1500, 1750, 1800, 1850, 1900, 1950, 1990~2000
			var isDyn = gid.charAt() == '$';
			if(gid != 'dictPage') return my.send('cns', { error: 400 });
			if(my && my.data && my.data.score) var prev = ReqExp.getLevel(my.data.score);
			DB.users.findOne([ '_id', uid ]).on(function($user){
				if(!$user) return my.send('cns', { error: 400 });
				if(!$user.box) return my.send('cns', { error: 400 });
				if(!$user.lastLogin) $user.lastLogin = new Date().getTime();
				var q = $user.box[gid];
				var output;
				if(!q) return my.send('cns', { error: 430 });
				if(gid == 'dictPage'){
					var naw = new Date();
					var ndate = String(naw.getYear())+String(naw.getMonth())+String(naw.getDate());
					if(!$user.dict) $user.dict = {date:ndate, count:0};
					if($user.dict.date == ndate && $user.dict.count && $user.dict.count >= 1000) return my.send('palert', { value: '하루에 최대 1000개만 사용 가능합니다.' });
					if($user.dict.date != ndate) $user.dict = { date: ndate, count: 0 };
					q = (1000 - $user.dict.count)<q?1000-$user.dict.count:q;
					$user.dict.count = Number($user.dict.count || 0) + q;
					my.send('notice', { value: '오늘 사용한 백과사전 낱장 개수: ' + $user.dict.count + ' / 1000' });
				}
				DB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
					if(!$item) return my.send('cns', { error: 430 });
					
					for(var i=0; i<q; i++) consume($user, gid, 1);
					output = useExp($user, $item, gid, q);
					my.data.score = $user.kkutu.score;
					my.processLevelNotice(prev, ReqExp.getLevel($user.kkutu.score), my.nickname);
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
					R.exp = Math.round(Math.sqrt(1 + 2 * ($user.kkutu.score || 0))) * 2;
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
					R.money = Math.floor(Math.random() * 100000) + 100001;
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
			if(lv<1000) return {min:1000000,max:2500000};
			if(lv<1100) return {min:175000000,max:250000000};
			if(lv<1200) return {min:200000000,max:325000000};
			if(lv<1300) return {min:500000000,max:750000000};
			if(lv<1400) return {min:875000000,max:1250000000};
			if(lv<1500) return {min:1750000000,max:2250000000};
			if(lv<1600) return {min:4750000000,max:6000000000};
			if(lv<1700) return {min:7500000000,max:11000000000};
			if(lv<1800) return {min:17500000000,max:30000000000};
			if(lv<1900) return {min:30000000000,max:40000000000};
			if(lv<1950) return {min:75000000000,max:100000000000};
			if(lv<1990) return {min:100000000000,max:125000000000};
			if(lv<2000) return {min:125000000000,max:200000000000};
			return {min:0,max:0};
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
				if(!$room.gaming){
					if($room.master == my.id){
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
					$exp.kkutu.score = Number($exp.kkutu.score) + obtainExp;
					$exp.money = Number($exp.money) - amount;
					DB.users.update([ '_id', my.id ]).set([ 'kkutu', $exp.kkutu ], [ 'money', $exp.money ]).on(function($res){
						my.send('notice', { value: '경험치를 획득했습니다: ' + commify(obtainExp) });
						my.send('updateme', { kkutu: $exp.kkutu, money: $exp.money });
					});
				}catch(e){
					JLog.toConsole(e.toString());
					return my.send('notice', { value: '처리 중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.' });
				}
			});
		};	
		my.applyEquipOptions = function(rw, wa, wu, mode){
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
			/*for(i in my.equip){
				$obj = SHOP[my.equip[i]];
				if(!$obj) continue;
				if(!$obj.options) continue;
				for(j in $obj.options){
					if(j == "gEXP") rw.score += rw._score * $obj.options[j];
					else if(j == "hEXP") rw.score += $obj.options[j] * pm;
					else if(j == "gMNY") rw.money += rw._money * $obj.options[j];
					else if(j == "hMNY") rw.money += $obj.options[j] * pm;
					else continue;
					rw._blog.push("q" + j + $obj.options[j]);
				}
			}*/
			/*var ksm = hotime ? 5.5 : 2.55;
			rw.score += rw._score * ksm;
			rw.money += rw._money * ksm;
			rw._blog.push("zgEXP" + ksm);
			rw._blog.push("zgMNY" + ksm);*/
			var level = ReqExp.getLevel(my.data.score || 0);
			var lvbonus = level>=2000?0:Math.floor(level/5);
			var pingbonus = level>=1000?2:0;
			if(level>=1000) lvbonus+=level>=2000?0:Math.floor(((level-1000)/10)*125);
			if(level>=1000&&level<2000) lvbonus+=3000;
			if(aw) lvbonus /= 2;
			JLog.log(`LvBonus [${my.id}] ${lvbonus/3}`);
			var miBonus = (lvbonus/30) < 1 ? 1 : lvbonus/30;
			var wfd = aw ? 16 : 32;
			rw.score += rw._score * wfd;
			rw.money += rw._money * wfd;
			rw._blog.push("egEXP" + wfd);
			rw._blog.push("egMNY" + wfd);
			var nss = new Date();
			var hotime = nss.getHours() == 12 || nss.getHours() == 22;
			if(lvbonus>=2){
				rw.score += rw._score * (lvbonus/3);
				rw.money += rw._money * (pingbonus);
				rw._blog.push("fgEXP" + (lvbonus/3));
				rw._blog.push("fgMNY" + (pingbonus));
			}
			if(nss.getDay() == 6 || nss.getDay() == 0){
				var jdd = 0.5 * ((lvbonus/3)/10);
				rw.score += rw._score * jdd;
				rw.money += rw._money * jdd;
				rw._blog.push("jgEXP" + jdd);
				rw._blog.push("jgMNY" + jdd);
			}
			if(hotime){
				var uld = 1;
				var qld = 1.2 * miBonus;
				rw.score += rw._score * qld;
				rw.money += rw._money * uld;
				rw._blog.push("tgEXP" + qld);
				rw._blog.push("tgMNY" + uld);
			}
			var rwScore = rw.score;
			var rwMoney = rw.money;
			// 여기서 아이템 보너스를 계산한다.
			var current;
			var Crent = 0;
			if(my.stat){
				if(my.stat.exp) Crent += Number(my.stat.exp);
				if(my.stat.mny) Crent += Number(my.stat.mny);
				var Crnt = renderStatusPoint(my.score);
				if(Crent <= Crnt){
					rw.score += (current = rwScore * (my.stat.exp*0.0005));
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
				else if(j == "hEXP") rw.score += (current = equipbonus[j]);
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
					i = 0.12 * (MAX_OKG + ((my.okgCount - MAX_OKG)/21)) * ((lvbonus/3)/60);
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
				rw.money += (current=rw.money * wb);
				rw._blog.push("uhEXP" + current);
				rw._blog.push("uhMNY" + current);
			}
			if(new Date().getTime() <= 1606143599000){
				var wb = 0.5;
				
				rw.score += (current = rw.score * wb);
				rw.money += (current = rw.money * wb);
				rw._blog.push("whEXP" + current);
				rw._blog.push("whMNY" + current);
			}
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
		if(x == -1){
			client.place = 0;
			/*if(my.players.length < 1) */
			if(my.players.length < 1) delete ROOM[my.id];
			//setTimeout(function(){if(my.players.length < 1) delete ROOM[my.id];}, force ? 0 : 5000);
			return client.sendError(409);
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
		my.time = room.time * my.rule.time;
		if(room.opts && my.opts){
			for(i in Const.OPTIONS){
				k = Const.OPTIONS[i].name.toLowerCase();
				my.opts[k] = room.opts[k] && my.rule.opts.includes(i);
			}
			if(ijc = my.rule.opts.includes("ijp")){
				ij = Const[`${my.rule.lang.toUpperCase()}_IJP`];
				my.opts.injpick = (room.opts.injpick || []).filter(function(item){ return ij.includes(item); });
			}else my.opts.injpick = [];
		}
		if(!my.rule.ai){
			while(my.removeAI(false, true));
		}
		for(i in my.players){
			if(DIC[my.players[i]]) DIC[my.players[i]].ready = false;
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
		if(my.rule.opts.includes("ijp")){
			if(!my.opts.injpick) return 400;
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
		var i, all = true;
		var len = 0;
		var teams = [ [], [], [], [], [] ];
		
		for(i in my.players){
			if(my.players[i].robot){
				if(!my.players[i].game.ready){
					len++;
					all = false;
					break;
				}
				if(my.players[i].game.form != "S") len++;
				teams[my.players[i].game.team].push(my.players[i]);
				continue;
			}
			if(!DIC[my.players[i]]) continue;
			if(DIC[my.players[i]].form == "S") continue;
			
			len++;
			teams[DIC[my.players[i]].team].push(my.players[i]);
			
			if(my.players[i] == my.master) continue;
			if(!DIC[my.players[i]].ready){
				all = false;
				break;
			}
		}
		if(!DIC[my.master]) return;
		if(len < 1) return DIC[my.master].sendError(411);
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
			setTimeout(my.roundReady, my.opts.faster ? 1000 : 2000);
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
		for(i in my.players){
			try{
				G = DIC[my.players[i]];
				if(GLOBAL.ADMIN.indexOf(G.id)!=-1) isgr = true;
				if(GLOBAL.WORDUSER.indexOf(G.id)!=-1 || GLOBAL.DESIGN.indexOf(G.id)!=-1) iswu = true;
			}catch(e){}
		}
		if(isgr && iswu) iswu = false;
		var timing = 0;
		var get = 0;
		var prev = 2000;
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
			rw = getRewards(my.mode, o.game.score / res[i].dim, o.game.bonus, res[i].rank, rl, sumScore, my.opts, adminch, res.length);
			rw.playTime = now - o.playAt;
			o.applyEquipOptions(rw, isgr, iswu, Const.GAME_TYPE[my.mode]); // 착용 아이템 보너스 적용
			if(my.opts.hack){
				rw.score = 0;
				rw.money = 0;
			}
			if(ReqExp.getLevel(o.data.score) >= 2000) rw.score = 0; //임시 처리.
			if(o.game.wpc) o.game.wpc.forEach(function(item){ o.obtain("$WPC" + item, 1); }); // 글자 조각 획득 처리
			if(o.game.wpb) o.game.wpb.forEach(function(item){ o.obtain("$WPB" + item, 1); }); // 글자 조각 획득 처리
			if(o.game.wpa) o.game.wpa.forEach(function(item){ o.obtain("$WPA" + item, 1); }); // 글자 조각 획득 처리
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
			prev = ReqExp.getLevel(o.data.score);
			//if(isgr && rw.together) rw.score += rw.score;
			//if(iswu && rw.together) rw.score += Math.floor(rw.score * 0.2);
			o.data.score += rw.score || 0;
			o.money += rw.money || 0;
			o.processLevelNotice(prev, ReqExp.getLevel(o.data.score), o.nickname || '(알 수 없음)');
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
		my.gaming = false;
		my.export();
		delete my.game.seq;
		delete my.game.wordLength;
		delete my.game.dic;
	};
	my.byMaster = function(type, data, nob){
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
function getRewards(mode, score, bonus, rank, all, ss, opts, admin, sUser){
	var rw = { score: 0, money: 0 };
	var sr = score / ss;
	
	// all은 1~8
	// rank는 0~7
	if(score >= 10000){
		score = 10000 + Math.floor((score-10000)/2);
	}
	if(score >= 20000){
		score = 20000 + Math.floor((score-20000)/2);
	}
	switch(Const.GAME_TYPE[mode]){
		case "EKT":
			rw.score += score * 1.325;
			break;
		case "ESH":
			rw.score += score * 1.3;
			break;
		case "KKT":
			rw.score += score * 1.375;
			break;
		case "KSH":
			rw.score += score * 1.35;
			break;
		case "CSQ":
			rw.score += score * 1.2;
			break;
		case 'KCW':
			rw.score += score * 1.25;
			break;
		case 'KTY':
			rw.score += score * 0.5;
			break;
		case 'ETY':
			rw.score += score * 0.4;
			break;
		case 'KAP':
			rw.score += score * 1.3;
			break;
		case 'HUN':
			rw.score += score * 0.9;
			break;
		case 'KDA':
			rw.score += score * 0.95;
			break;
		case 'EDA':
			rw.score += score * 0.9;
			break;
		case 'KSS':
			rw.score += score * 1.225;
			break;
		case 'ESS':
			rw.score += score * 0.9;
			break;
		case 'KAD':
			rw.score += score * 0.9;
			break;
		case 'EAD':
			rw.score += score * 0.85;
			break;
		case 'EAW':
			rw.score += score * 0.3;
			break;
		case 'KAW':
			rw.score += score * 0.3;
			break;
		case 'KMT':
			rw.score += score * 1.35;
			break;
		case 'KEA':
			rw.score += score * 1;
			break;
		case 'EKD':
			rw.score += score * 1.35;
			break;
		case 'KDG':
			rw.score += score * 0.01;
			break;
		case 'EDG':
			rw.score += score * 0.01;
			break;
		case 'EAP':
			rw.score += score * 1.3;
			break;
		case 'EJH':
			rw.score += score * 0.4;
			break;
		case 'KJH':
			rw.score += score * 0.4;
			break;
		case 'KGT':
			rw.score += score * 1.4;
			break;
		case 'KTT':
			rw.score += score * 0.7;
			break;
		case 'ETT':
			rw.score += score * 0.5;
			break;
		default:
			break;
	}
	if(opts.return){
		rw.score = rw.score * 0.25;
	}
	if(opts.spacewd){
		rw.score = rw.score * 0.8;
	}
	if(opts.dongsa){
		rw.score = rw.score * 0.8;
	}
	if(opts.scboost){
		rw.score = rw.score * 0.000000009;
	}
	
	if(opts.faster) rw.score = rw.score * 0.4;
	if(opts.rightgo) rw.score = rw.score * 0.3;
	md = Const.GAME_TYPE[mode];
	var srsr = 1;
	if(md == 'KAW' || md == 'EAW' || md == "KJH" || md == "EJH"){
		if(opts.mission) rw.score = rw.score * 0.09;
	}
	if(md.charAt() == 'K' && md != 'KEA'){
		if(opts.mission) rw.score = rw.score * 0.85;
	}
	if(md.charAt() == 'E' || md == 'KEA'){
		if(opts.mission) rw.score = rw.score * 0.8;
	}
	rw.score = rw.score * 4;
	var jcb = 1.25 / (1 + 1.25 * sr * sr);
	if(jcb < 0.94) jcb = 0.94;
	if(sUser != all) jcb = 0.94;
	rw.score = rw.score
		* (0.77 + 0.05 * (all - rank) * (all - rank)) // 순위
		* jcb // 점차비(양학했을 수록 ↓)
	;
	rw.money = 1 + rw.score * 0.01 * 6; // 핑 2배
	if(all < 2){
		rw.score = rw.score * 0.175;
		rw.money = rw.money * 0.175;
	}else{
		rw.together = true;
	}
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
