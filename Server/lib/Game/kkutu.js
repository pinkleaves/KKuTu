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

var GUEST_PERMISSION;
var Cluster = require("cluster");
var Const = require('../const');
var Lizard = require('../sub/lizard');
var GLOBAL = require('../sub/global.json');
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
const NUM_SLAVES = 4;
const GUEST_IMAGE = "/img/kkutu/guest.png";
const MAX_OKG = 18;
const ALL_OKG = 288;
const PER_OKG = 300000;
const hyogwa = [120, 125, 150, 190, 220, 260, 300, 340, 400, 500, 500];

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
	my.game = {};
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
			ready: true
		};
	};
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
		try{ msg = JSON.parse(msg); }catch(e){ return; }
		
		switch(msg.type){
			case 'seek':
				my.send('seek', { value: Object.keys(DIC).length });
				break;
			case 'narrate-friend':
				exports.narrate(msg.list, 'friend', { id: msg.id, s: msg.s, stat: msg.stat });
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
			if(ROOM[my.place]) ROOM[my.place].go(my);
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
		my.publish = function(type, data, noBlock){
			var i;
			var now = new Date(), st = now - my._pub;
			if(type != 'kdn'){
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
							return my.send('blocked');
						}else my.blocked = false;
					}
				}
			}
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
					my.publish('chatclear', { error: false });
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
			my.publish('kdn', { id: my.id });
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
		my.refresh = function(){
			var R = new Lizard.Tail();
			var ip = my.socket.upgradeReq.headers['x-forwarded-for'];
			if(!ip) {
				my.sendError(998);
				my.socket.close();
				return;
			};
			DB.black_ip.findOne([ 'ip', ip ]).on(function($gy){
				if(!!$gy) {
					my.sendError(999);
					my.socket.close();
					return;
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
				if(!first && $user.kkutu.score != 0 && ss){
					var gwb = 0;
					var k;
					var q = 1;
					if(jss == "2020716"){
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
					if(pst >= 50) var ltat = { code: 673, exp: 1000 };
					else if(pst < 50 && pst > 10) var ltat = { code: 674, exp: 5000 };
					else if(pst <= 10 && pst > 1.75) var ltat = { code: 675, exp: 10000 };
					else if(pst <= 1.75 && pst > 0.4) var ltat = { code: 676, exp: 50000 };
					else if(pst <= 0.4 && pst > 0.03) var ltat = { code: 677, exp: 100000 };
					else if(pst <= 0.03) var ltat = { code: 678, exp: 300000 };
					else var ltat = { code: 673, exp: 1000 };
					
					//if(!black && ss) my.send('chat', { notice: true, code: weekend ? ltat.code + 12 : ltat.code + 6 });
					
					pst = Math.round(Math.random() * 10000) / 100;
					if(pst >= 50) var stat = { code: 667, ping: 500 };
					else if(pst < 50 && pst > 10) var stat = { code: 668, ping: 2000 };
					else if(pst <= 10 && pst > 1.75) var stat = { code: 669, ping: 10000 };
					else if(pst <= 1.75 && pst > 0.3) var stat = { code: 670, ping: 25000 };
					else if(pst <= 0.3 && pst > 0.03) var stat = { code: 671, ping: 50000 };
					else if(pst <= 0.03) var stat = { code: 672, ping: 100000 };
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
				my.exordial = $user.exordial || "";
				my.nickname = $user.nickname || "";
				my.enhance = $user.enhance || {};
				my.equip = $user.equip || {};
				my.box = $user.box || {};
				my.data = new exports.Data($user.kkutu);
				my.money = Number($user.money);
				my.friends = $user.friends || {};
				if(first) my.flush();
				else{
					my.checkExpire();
					my.okgCount = Math.floor((my.data.playTime || 0) / PER_OKG);
				}
				if(black) R.go({ result: 444, black: black });
				else if(Cluster.isMaster && $user.server) R.go({ result: 409, black: $user.server });
				else if(exports.NIGHT && my.isAjae === false) R.go({ result: 440 });
				else R.go({ result: 200 });
			});
			return R;
		};
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
					if(my.data.score >= 40110000){
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
				if(spec) $room.spectate(my, room.password);
				else $room.come(my, room.password, pass);
			}
		};
		my.leave = function(kickVote){
			var $room = ROOM[my.place];
			
			if(my.subPlace){
				my.pracRoom.go(my);
				if($room) my.send('room', { target: my.id, room: $room.getData() });
				my.publish('user', my.getData());
				if(!kickVote) return;
			}
			if($room) $room.go(my, kickVote);
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
		my.dict = function(word, lang){
			var MainDB = DB.kkutu[lang];
			
			if(!MainDB) return my.send('dict', { error: 400 });
			if(!MainDB.findOne) return my.send('dict', { error: 400 });
			MainDB.findOne([ '_id', word ]).on(function($word){
				if(!$word) return my.send('dict', { error: 404 });
				my.send('dict', {
					word: $word._id,
					mean: $word.mean,
					theme: $word.theme,
					type: $word.type
				});
			});
		}
		my.practice = function(level){
			var $room = ROOM[my.place];
			var ud;
			var pr;
			
			if(!$room) return;
			if(my.subPlace) return;
			if(my.form != "J") return;
			
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
			var i;
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
				if(j == "gEXP") rw.score += rw._score * enhance[j];
				else if(j == "gMNY") rw.money += rw._money * enhance[j];
				rw._blog.push("l" + j + enhance[j]);
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
				if(j == "gEXP") rw.score += rw._score * equipbonus[j];
				else if(j == "hEXP") rw.score += equipbonus[j];
				else if(j == "gMNY") rw.money += rw._money * equipbonus[j];
				else if(j == "hMNY") rw.money += equipbonus[j];
				else continue;
				rw._blog.push("q" + j + equipbonus[j]);
			}
			
			var wfd = aw ? 4 : 8;
			rw.score += rw._score * wfd;
			rw.money += rw._money * wfd;
			rw._blog.push("egEXP" + wfd);
			rw._blog.push("egMNY" + wfd);
			var nss = new Date();
			var hotime = nss.getHours() == 12 || nss.getHours() == 22;
			/*var ksm = hotime ? 5.5 : 2.55;
			rw.score += rw._score * ksm;
			rw.money += rw._money * ksm;
			rw._blog.push("zgEXP" + ksm);
			rw._blog.push("zgMNY" + ksm);*/
			if(nss.getDay() == 6 || nss.getDay() == 0){
				var jdd = 0.5;
				rw.score += rw._score * jdd;
				rw.money += rw._money * jdd;
				rw._blog.push("jgEXP" + jdd);
				rw._blog.push("jgMNY" + jdd);
			}
			if(hotime){
				var uld = 1;
				var qld = 1.2;
				rw.score += rw._score * qld;
				rw.money += rw._money * uld;
				rw._blog.push("tgEXP" + qld);
				rw._blog.push("tgMNY" + uld);
			}
			if(rw.together){
				var well = true;
				var rdn = Math.floor(Math.random() * 80) + 1;	// 1~70사이의 난수 생성
				rdn = rdn * 0.01;
				var pex = rw._score;
				if(pex < 1) well = false; // 경험치 / 91.5가 1보다 작으면 진행하지 않기.
				if(well){
					pex = Math.floor(rdn * pex);
				}
				rw.score += pex;
				rw._blog.push("rgEXP" + rdn);
			}
			if(rw.together && wa){
				wb = 1;
				
				rw.score += rw._score * wb;
				rw.money += rw._money * wb;
				rw._blog.push("wgEXP" + wb);
				rw._blog.push("wgMNY" + wb);
			}
			if(rw.together && wu){
				wb = 0.2;
				
				rw.score += rw._score * wb;
				rw.money += rw._money * wb;
				rw._blog.push("ugEXP" + wb);
				rw._blog.push("ugMNY" + wb);
			}
			if(rw.together && my.okgCount > 0 && !aw){
				my.okgCount = my.okgCount > ALL_OKG ? ALL_OKG : my.okgCount;
				if(my.okgCount > MAX_OKG){
					i = 0.12 * (MAX_OKG + ((my.okgCount - MAX_OKG)/21));
					j = 0.12 * (MAX_OKG + ((my.okgCount - MAX_OKG)/21));
				}else{
					i = 0.12 * my.okgCount;
					j = 0.12 * my.okgCount;
				}
				
				rw.score += rw._score * i;
				rw.money += rw._money * j;
				rw._blog.push("kgEXP" + i);
				rw._blog.push("kgMNY" + j);
			} else if(!rw.together && my.okgCount > 0 && !aw){
				my.okgCount = my.okgCount > ALL_OKG ? ALL_OKG : my.okgCount;
				if(my.okgCount > MAX_OKG){
					i = 0.018 * (MAX_OKG + ((my.okgCount - MAX_OKG)/22));
					j = 0.018 * (MAX_OKG + ((my.okgCount - MAX_OKG)/22));
				}else{
					i = 0.018 * my.okgCount;
					j = 0.018 * my.okgCount;
				}
				
				rw.score += rw._score * i;
				rw.money += rw._money * j;
				rw._blog.push("kgEXP" + i);
				rw._blog.push("kgMNY" + j);
			}
			rw.score = Math.round(rw.score);
			rw.money = Math.round(rw.money);
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
	my.setAI = function(target, level, team){
		var i;
		
		for(i in my.players){
			if(!my.players[i]) continue;
			if(!my.players[i].robot) continue;
			if(my.players[i].id == target){
				my.players[i].setLevel(level);
				my.players[i].setTeam(team);
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
			client.form = "J";
			
			if(!my.practice) process.send({ type: "room-come", target: client.id, id: my.id });
			my.export(client.id);
		}
	};
	my.spectate = function(client, password){
		if(!my.practice) client.place = my.id;
		var len = my.players.push(client.id);
		
		if(Cluster.isWorker){
			client.ready = false;
			client.team = 0;
			client.cameWhenGaming = true;
			client.form = (len > my.limit) ? "O" : "S";
			
			process.send({ type: "room-spectate", target: client.id, id: my.id, pw: password });
			my.export(client.id, false, true);
		}
	};
	my.go = function(client, kickVote){
		var x = my.players.indexOf(client.id);
		var me;
		
		if(x == -1){
			client.place = 0;
			if(my.players.length < 1) delete ROOM[my.id];
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
				len++;
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
		my.game.seq = [];
		my.game.robots = [];
		if(my.practice){
			my.game.robots.push(o = new exports.Robot(my.master, my.id, pracLevel));
			my.game.seq.push(o, my.master);
		}else{
			for(i in my.players){
				if(my.players[i].robot){
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
		}
		for(i in my.game.seq){
			o = DIC[my.game.seq[i]] || my.game.seq[i];
			if(!o) continue;
			if(o.robot){
				if(o.game.team) teams[o.game.team].push(o.game.score);
			}else if(o.team) teams[o.team].push(o.game.score);
		}
		for(i=1; i<5; i++) if(o = teams[i].length) teams[i] = [ o, teams[i].reduce(function(p, item){ return p + item; }, 0) ];
		for(i in my.game.seq){
			o = DIC[my.game.seq[i]];
			if(!o) continue;
			sumScore += o.game.score;
			res.push({ id: o.id, score: o.team ? teams[o.team][1] : o.game.score, dim: o.team ? teams[o.team][0] : 1 });
		}
		res.sort(function(a, b){ return b.score - a.score; });
		rl = my.startUser || res.length;
		var isgr = false;
		var iswu = false;
		var GLOBAL = require('../sub/global.json');
		for(i in res){
			if(GLOBAL.ADMIN.indexOf(res[i].id)!=-1) isgr = true;
			if(GLOBAL.WORDUSER.indexOf(res[i].id)!=-1 || GLOBAL.DESIGN.indexOf(res[i].id)!=-1) iswu = true;
		}
		if(isgr && iswu) iswu = false;
		var timing = 0;
		var get = 0;
		for(i in res){
			o = DIC[res[i].id];
			if(pv == res[i].score){
				res[i].rank = res[Number(i) - 1].rank;
			}else{
				res[i].rank = Number(i);
			}
			pv = res[i].score;
			var adminch = GLOBAL.ADMIN.indexOf(o.id) != -1;
			rw = getRewards(my.mode, o.game.score / res[i].dim, o.game.bonus, res[i].rank, rl, sumScore, my.opts, adminch);
			rw.playTime = now - o.playAt;
			o.applyEquipOptions(rw, isgr, iswu, Const.GAME_TYPE[my.mode]); // 착용 아이템 보너스 적용
			if(my.opts.hack){
				rw.score = 0;
				rw.money = 0;
			}
			if(o.data.score >= 50000000) rw.score = Math.round(rw.score * (2 / 3));
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
				}else{
					if(o.game.score < 7 && Const.GAME_TYPE[my.mode].substr(1, 2) == 'TY'){
						o.send('notice', { value: '어뷰징 행위가 의심되어 오끄감 버프가 지급되지 않았습니다.' });
					}else o.onOKG(rw.playTime);
				}
			}
			res[i].reward = rw;
			o.data.score += rw.score || 0;
			o.money += rw.money || 0;
			if(!my.opts.hack){
				o.data.record[Const.GAME_TYPE[my.mode]][2] += rw.score || 0;
				o.data.record[Const.GAME_TYPE[my.mode]][3] += rw.playTime;
			}
			if(!my.practice && rw.together){
				o.data.record[Const.GAME_TYPE[my.mode]][0]++;
				if(res[i].rank == 0) o.data.record[Const.GAME_TYPE[my.mode]][1]++;
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
				my.byMaster('roundEnd', { result: res, users: users, ranks: o, data: data }, true);
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
function getRewards(mode, score, bonus, rank, all, ss, opts, admin){
	var rw = { score: 0, money: 0 };
	var sr = score / ss;
	
	// all은 1~8
	// rank는 0~7
	switch(Const.GAME_TYPE[mode]){
		case "EKT":
			rw.score += score * 0.9;
			break;
		case "ESH":
			rw.score += score * 0.8;
			break;
		case "KKT":
			rw.score += score * 1.1;
			break;
		case "KSH":
			rw.score += score * 0.77;
			break;
		case "CSQ":
			rw.score += score * 0.4 * 2.7;
			break;
		case 'KCW':
			rw.score += score * 1.0;
			break;
		case 'KTY':
			rw.score += score * 0.3;
			break;
		case 'ETY':
			rw.score += score * 0.37;
			break;
		case 'KAP':
			rw.score += score * 0.8;
			break;
		case 'HUN':
			rw.score += score * 0.5;
			break;
		case 'KDA':
			rw.score += score * 0.67 * 1.2;
			break;
		case 'EDA':
			rw.score += score * 0.65 * 1.2;
			break;
		case 'KSS':
			rw.score += score * 2;
			break;
		case 'ESS':
			rw.score += score * 1.5;
			break;
		case 'KAD':
			rw.score += score * 0.33;
			break;
		case 'EAD':
			rw.score += score * 0.32;
			break;
		case 'EAW':
			rw.score += score * 0.2;
			break;
		case 'KAW':
			rw.score += score * 0.2;
			break;
		case 'KMT':
			rw.score += score * 0.9;
			break;
		case 'KEA':
			rw.score += score * 0.32;
			break;
		case 'EKD':
			rw.score += score * 1.4;
			break;
		case 'KDG':
			rw.score += score * 0.35;
			break;
		case 'EDG':
			rw.score += score * 0.35;
			break;
		case 'EAP':
			rw.score += score * 0.78;
			break;
		case 'EJH':
			rw.score += score * 0.34;
			break;
		case 'KJH':
			rw.score += score * 0.33;
			break;
		case 'KGT':
			rw.score += score * 1.4;
			break;
		case 'KTT':
			rw.score += score * 0.74;
			break;
		case 'ETT':
			rw.score += score * 0.65;
			break;
		default:
			break;
	}
	if(opts.return){
		rw.score = rw.score * 0.33;
	}
	if(opts.spacewd){
		rw.score = rw.score * 0.9;
	}
	if(opts.dongsa){
		rw.score = rw.score * 0.8;
	}
	if(opts.scboost){
		rw.score = rw.score * 0.000000009;
	}
	if(opts.faster) rw.score = rw.score * 0.2;
	if(opts.rightgo) rw.score = rw.score * 0.0075;
	md = Const.GAME_TYPE[mode];
	var srsr = 1;
	if(md == 'KAW' || md == 'EAW' || md == "KJH" || md == "EJH"){
		if(opts.mission) rw.score = rw.score * 0.043;
	}
	rw.score = rw.score * 1.525;
	var jcb = 1.25 / (1 + 1.25 * sr * sr);
	if(jcb < 0.94) jcb = 0.94;
	rw.score = rw.score
		* (0.77 + 0.05 * (all - rank) * (all - rank)) // 순위
		* jcb // 점차비(양학했을 수록 ↓)
	;
	rw.money = 1 + rw.score * 0.01 * 6; // 핑 2배
	if(all < 2){
		rw.score = rw.score * 0.2;
		rw.money = rw.money * 0.2;
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
