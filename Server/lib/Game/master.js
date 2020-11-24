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
const ClientVersion = '3.0.100';
var Cluster = require("cluster");
var File = require('fs');
var WebSocket = require('ws');
var https = require('https');
var HTTPS_Server;
var GeoIP = require('geoip-country');
// var Heapdump = require("heapdump");
var KKuTu = require('./kkutu');
var GLOBAL = require("../sub/global.json");
var Const = require("../const");
var JLog = require('../sub/jjlog');
var Secure = require('../sub/secure');
var Recaptcha = require('../sub/recaptcha');
var CAPTCHA = { GUEST: GLOBAL.GOOGLE_RECAPTCHA_TO_GUEST, USER: GLOBAL.GOOGLE_RECAPTCHA_TO_USER };
var MainDB;
var DoS = {};
var Server;
var DIC = {};
var DNAME = {};
var ROOM = {};

var T_ROOM = {};
var T_USER = {};

var SID;
var WDIC = {};
var MAX_USERS = Const.KKUTU_MAX_SERVER;

const DEVELOP = exports.DEVELOP = false;
const GUEST_PERMISSION = exports.GUEST_PERMISSION = {
	'create': true,
	'enter': true,
	'talk': true,
	'practice': true,
	'ready': true,
	'start': true,
	'invite': true,
	'inviteRes': true,
	'kick': true,
	'kickVote': true,
	'wp': true
};
const ENABLE_ROUND_TIME = exports.ENABLE_ROUND_TIME = [ 3, 5, 10, 30, 60, 90, 120, 150 ];
const ENABLE_FORM = exports.ENABLE_FORM = [ "S", "J" ];
const MODE_LENGTH = exports.MODE_LENGTH = Const.GAME_TYPE.length;
const PORT = process.env['KKUTU_PORT'];

process.on('uncaughtException', function(err){
	var text = `:${PORT} [${new Date().toLocaleString()}] ERROR: ${err.toString()}\n${err.stack}\n`;
	
	File.appendFile("../KKUTU_ERROR.log", text, function(res){
		JLog.error(`ERROR OCCURRED ON THE MASTER!`);
		console.log(text);
	});
});
function checkDoS(ses){
	var K = false;
	var now = new Date();
	try{
		if(DoS[ses]){
			if(now.getTime() - DoS[ses] <= 300){
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
function processAdmin(id, value, isManager){
	var cmd, temp, i, j;
	
	value = value.replace(/^(#\w+\s+)?(.+)/, function(v, p1, p2){
		if(p1) cmd = p1.slice(1).trim();
		return p2;
	});
	switch(cmd){
		case "anotice":
			if(isManager){
				DIC[id].send('notice',{value:'이 명령어를 사용할 수 있는 권한이 없습니다.'});
				return null;
			}
			for(i in WDIC){
				WDIC[i].send('anotice', { value: value });
				break;
			}
			return null;
		case "wnotice":
			for(i in WDIC){
				WDIC[i].send('anotice', { value: value, noXSS: true });
				break;
			}
			return null;
		case "enotice":
			KKuTu.publish('notice', { value: value, noXSS: true });
			return null;
		case "pin":
			KKuTu.publish('pin', { value: value });
			return null;
		case "ban":
            var target = value.split(",")[0];
            var date = Date.now() + parseInt(value.split(",")[1]) * 24 * 60 * 60 * 1000;
            var reason = value.split(",")[2];
            
            if(!target) return null;
            else if(!reason) return null;
            else if(!date) return null;
			var kdkd = value.split(",")[1];
            MainDB.users.update([ '_id', target ]).set([ 'black', reason ]).on();
            MainDB.users.update([ '_id', target ]).set([ 'blackt', date ]).on();
            JLog.info(`BAN [${target}] temp banned (Time: ${kdkd} days)`);
            if(temp = DIC[target]){
                temp.socket.send('{"type":"error","code":987}');
                temp.socket.close();
            }
			return null;
		case "ip":
			try{
				DIC[id].send('notice', { value: `${value}: ${DIC[value].socket.upgradeReq.headers['x-forwarded-for'].replace(':ffff','').replace('::ffff','')}` });
			}catch(e){
				DIC[id].send('notice', { value: `${value}님의 정보를 찾을 수 없습니다.` });
			}
			return null;
		case "ipban":
			try{
				var target = value.split(",")[0];
				if(Number(value.split(',')[1])<0) var date = -1;
				else var date = Date.now() + parseInt(value.split(",")[1]) * 24 * 60 * 60 * 1000;
				var reason = value.split(",")[2];
				
				if(!target) return null;
				else if(!reason) return null;
				else if(!date) return null;
				var kdkd = value.split(",")[1];
				MainDB.black_ip.insert([ 'ip', target ], [ 'black', reason ], [ 'blackt', date ]).on();
				JLog.info(`BAN [${target}] temp banned (Time: ${kdkd} days)`);
			}catch(e){

			}
			return null;
		case "captcha":
			if(isManager){
				DIC[id].send('notice',{value:'이 명령어를 사용할 수 있는 권한이 없습니다.'});
				return null;
			}
			var ss = CAPTCHA.GUEST;
			CAPTCHA.GUEST = ss ? false : true;
			var sta = ss ? '껐' : '켰';
			DIC[id].send('notice', { value: `캡챠 기능을 ${sta}습니다.` });
			return null;
		case "max":
			if(isManager){
				DIC[id].send('notice',{value:'이 명령어를 사용할 수 있는 권한이 없습니다.'});
				return null;
			}
			try{
				var tq = value.split(",");
				var mx = Number(tq[1]);
				var chanID = Number(tq[0]);
				MAX_USERS[chanID] = mx;
				JLog.log(`MAX USERS SID: ${chanID} USERS: ${mx}`);
			}catch(e){
				JLog.error(e.toString());
			}
			return null;
		case "notice":
			if(isManager){
				DIC[id].send('notice',{value:'이 명령어를 사용할 수 있는 권한이 없습니다.'});
				return null;
			}
			KKuTu.publish('notice', { value: value });
			return null;
		case "delroom":
		case "deleteroom":
		case "exitroom":
			if(ROOM[value]){
				for(var i in ROOM[value].players){
					var $q = DIC[ROOM[value].players[i]];
					if($q){
						$q.send('killroom');
					}
				}
				setTimeout(()=>{
					delete ROOM[value];
					//worker.send({ type: "room-invalid", room: value });
				}, 10000);
			}
			return null;
		case "yell":
			if(isManager){
				DIC[id].send('notice',{value:'이 명령어를 사용할 수 있는 권한이 없습니다.'});
				return null;
			}
			KKuTu.publish('yell', { value: value });
			return null;
		case "palert":
			if(isManager){
				DIC[id].send('notice',{value:'이 명령어를 사용할 수 있는 권한이 없습니다.'});
				return null;
			}
			KKuTu.publish('palert', { value: value });
			return null;
		case "kill":
			if(temp = DIC[value]){
				temp.socket.send('{"type":"error","code":410}');
				temp.socket.close();
			}
			return null;
		case "tailroom":
			if(temp = ROOM[value]){
				if(T_ROOM[value] == id){
					i = true;
					delete T_ROOM[value];
				}else T_ROOM[value] = id;
				if(DIC[id]) DIC[id].send('tail', { a: i ? "trX" : "tr", rid: temp.id, id: id, msg: { pw: temp.password, players: temp.players } });
			}
			return null;
		case "tailuser":
			if(temp = DIC[value]){
				if(T_USER[value] == id){
					i = true;
					delete T_USER[value];
				}else T_USER[value] = id;
				temp.send('test');
				if(DIC[id]) DIC[id].send('tail', { a: i ? "tuX" : "tu", rid: temp.id, id: id, msg: temp.getData() });
			}
			return null;
		case "dump":
			if(isManager){
				DIC[id].send('notice',{value:'이 명령어를 사용할 수 있는 권한이 없습니다.'});
				return null;
			}
			if(DIC[id]) DIC[id].send('yell', { value: "This feature is not supported..." });
			/*Heapdump.writeSnapshot("/home/kkutu_memdump_" + Date.now() + ".heapsnapshot", function(err){
				if(err){
					JLog.error("Error when dumping!");
					return JLog.error(err.toString());
				}
				if(DIC[id]) DIC[id].send('yell', { value: "DUMP OK" });
				JLog.success("Dumping success.");
			});*/
			return null;
	}
	return value;
}
function checkTailUser(id, place, msg){
	var temp;
	
	if(temp = T_USER[id]){
		if(!DIC[temp]){
			delete T_USER[id];
			return;
		}
		DIC[temp].send('tail', { a: "user", rid: place, id: id, msg: msg });
	}
}
function narrateFriends(id, friends, stat){
	if(!friends) return;
	var fl = Object.keys(friends);
	
	if(!fl.length) return;
	
	MainDB.users.find([ '_id', { $in: fl } ], [ 'server', /^\w+$/ ]).limit([ 'server', true ]).on(function($fon){
		var i, sf = {}, s;
		
		for(i in $fon){
			if(!sf[s = $fon[i].server]) sf[s] = [];
			sf[s].push($fon[i]._id);
		}
		if(DIC[id]) DIC[id].send('friends', { list: sf });
		
		if(sf[SID]){
			KKuTu.narrate(sf[SID], 'friend', { id: id, s: SID, stat: stat });
			delete sf[SID];
		}
		for(i in WDIC){
			WDIC[i].send('narrate-friend', { id: id, s: SID, stat: stat, list: sf });
			break;
		}
	});
}
Cluster.on('message', function(worker, msg){
	var temp;
	
	switch(msg.type){
		case "admin":
			if(DIC[msg.id] && DIC[msg.id].admin) processAdmin(msg.id, msg.value);
			else if(DIC[msg.id] && GLOBAL.MGMTUSER.indexOf(msg.id)!=-1) processAdmin(msg.id, msg.value, true);
			break;
		case "tail-report":
			if(temp = T_ROOM[msg.place]){
				if(!DIC[temp]) delete T_ROOM[msg.place];
				DIC[temp].send('tail', { a: "room", rid: msg.place, id: msg.id, msg: msg.msg });
			}
			checkTailUser(msg.id, msg.place, msg.msg);
			break;
		case "okg":
			if(DIC[msg.id]) DIC[msg.id].onOKG(msg.time);
			break;
		case "kick":
			if(DIC[msg.target]) DIC[msg.target].socket.close();
			break;
		case "invite":
			if(!DIC[msg.target]){
				worker.send({ type: "invite-error", target: msg.id, code: 417 });
				break;
			}
			if(DIC[msg.target].place != 0){
				worker.send({ type: "invite-error", target: msg.id, code: 417 });
				break;
			}
			if(!GUEST_PERMISSION.invite) if(DIC[msg.target].guest){
				worker.send({ type: "invite-error", target: msg.id, code: 422 });
				break;
			}
			if(DIC[msg.target]._invited){
				worker.send({ type: "invite-error", target: msg.id, code: 419 });
				break;
			}
			DIC[msg.target]._invited = msg.place;
			DIC[msg.target].send('invited', { from: msg.place, by: msg.id });
			break;
		case "room-new":
			if(ROOM[msg.room.id] || !DIC[msg.target]){ // 이미 그런 ID의 방이 있다... 그 방은 없던 걸로 해라.
				worker.send({ type: "room-invalid", room: msg.room });
			}else{
				ROOM[msg.room.id] = new KKuTu.Room(msg.room, msg.room.channel);
			}
			break;
		case "room-come":
			if(ROOM[msg.id] && DIC[msg.target]){
				ROOM[msg.id].come(DIC[msg.target]);
			}else{
				JLog.warn(`Wrong room-come id=${msg.id}&target=${msg.target}`);
			}
			break;
		case "room-spectate":
			if(ROOM[msg.id] && DIC[msg.target]){
				ROOM[msg.id].spectate(DIC[msg.target], msg.pw);
			}else{
				JLog.warn(`Wrong room-spectate id=${msg.id}&target=${msg.target}`);
			}
			break;
		case "room-go":
			if(ROOM[msg.id] && DIC[msg.target]){
				ROOM[msg.id].go(DIC[msg.target]);
			}else{
				// 나가기 말고 연결 자체가 끊겼을 때 생기는 듯 하다.
				JLog.warn(`Wrong room-go id=${msg.id}&target=${msg.target}`);
				if(ROOM[msg.id] && ROOM[msg.id].players){
					// 이 때 수동으로 지워준다.
					var x = ROOM[msg.id].players.indexOf(msg.target);
					
					if(x != -1){
						ROOM[msg.id].players.splice(x, 1);
						JLog.warn(`^ OK`);
					}
				}
				if(msg.removed) delete ROOM[msg.id];
			}
			break;
		case "user-publish":
			if(temp = DIC[msg.data.id]){
				for(var i in msg.data){
					temp[i] = msg.data[i];
				}
			}
			break;
		case "room-publish":
			if(temp = ROOM[msg.data.room.id]){
				for(var i in msg.data.room){
					temp[i] = msg.data.room[i];
				}
				temp.password = msg.password;
			}
			KKuTu.publish('room', msg.data);
			break;
		case "room-expired":
			if(msg.create && ROOM[msg.id]){
				for(var i in ROOM[msg.id].players){
					var $c = DIC[ROOM[msg.id].players[i]];
					
					if($c) $c.send('roomStuck');
				}
				delete ROOM[msg.id];
			}
			break;
		case "room-invalid":
			delete ROOM[msg.room.id];
			break;
		case "nickchange":
			var MDB = require('../Web/db');
			MDB.users.findOne([ '_id', msg.id ]).on(function($nir){
				if(!$nir) return;
				if(!$nir.nikc) return;
				if($nir.nikc == 0) return;
				MDB.users.update([ '_id', msg.id ]).set([ 'nikc', 0 ]).on();
				DNAME[($nir.nickname).replace(/\s/g, "")] = msg.id;
				var $c = DIC[DNAME[$nir.nickname]];
				if($c){
					$c.nickname = $nir.nickname;
					$c.nickchange($nir.nickname);
				}
				KKuTu.publish('nikc', { value: $nir.nickname, usr: $c.id });
			});
			break;
		case "lvnotice":
			KKuTu.publish('notice', { value: msg.value });
			break;
		default:
			JLog.warn(`Unhandled IPC message type: ${msg.type}`);
	}
});
exports.init = function(_SID, CHAN){
	SID = _SID;
	MainDB = require('../Web/db');
	MainDB.ready = function(){
		JLog.success("Master DB is ready.");
		
		MainDB.users.update([ 'server', SID ]).set([ 'server', "" ]).on();
		if(Const.IS_SECURED) {
			const options = Secure();
			HTTPS_Server = https.createServer(options)
				.listen(global.test ? (Const.TEST_PORT + 416) : process.env['KKUTU_PORT']);
			Server = new WebSocket.Server({server: HTTPS_Server});
		} else {
			Server = new WebSocket.Server({
				port: global.test ? (Const.TEST_PORT + 416) : process.env['KKUTU_PORT'],
				perMessageDeflate: false
			});
		}
		Server.on('connection', function(socket){
			var key = socket.upgradeReq.url.slice(1);
			var $c;
			if(checkDoS(key)) return socket.close();
			socket.on('error', function(err){
				JLog.warn("Error on #" + key + " on ws: " + err.toString());
			});
			var accessIP = socket.upgradeReq.headers['x-hw-forwarded-for'] || undefined;
			// 웹 서버
			if(socket.upgradeReq.headers.host.match(/^127\.0\.0\.2:/)){
				if(WDIC[key]) WDIC[key].socket.close();
				WDIC[key] = new KKuTu.WebServer(socket);
				JLog.info(`New web server #${key}`);
				WDIC[key].socket.on('close', function(){
					JLog.alert(`Exit web server #${key}`);
					WDIC[key].socket.removeAllListeners();
					delete WDIC[key];
				});
				return;
			}
			if(Object.keys(DIC).length >= MAX_USERS[SID]){
				socket.send(`{ "type": "error", "code": "full" }`);
				return;
			}
			MainDB.session.findOne([ '_id', key ]).limit([ 'profile', true ]).on(function($body){
				$c = new KKuTu.Client(socket, $body ? $body.profile : null, key);
				$c.admin = GLOBAL.ADMIN.indexOf($c.id) != -1;
				if(DIC[$c.id]){
					DIC[$c.id].sendError(408);
					DIC[$c.id].socket.close();
				}
				if(DEVELOP && !Const.TESTER.includes($c.id)){
					$c.socket.send(JSON.stringify({type:'alert',code:500}));
					$c.socket.close();
					return;
				}
				if($c.guest){
					if(SID > "1" || accessIP == undefined || (!GeoIP.lookup(accessIP) || GeoIP.lookup(accessIP).country != 'KR')){
						//$c.sendError(402);
						$c.socket.send(JSON.stringify({ type: 'alert', code: 402 }))
						$c.socket.close();
						return;
					}
					if(KKuTu.NIGHT){
						$c.sendError(440);
						$c.socket.close();
						return;
					}
				}
				if($c.isAjae === null){
					$c.sendError(441);
					$c.socket.close();
					return;
				}
				$c.refresh().then(function(ref){
					if(ref.result == 200){
						DIC[$c.id] = $c;
						DNAME[($c.nickname).replace(/\s/g, "")] = $c.id;
						MainDB.users.update([ '_id', $c.id ]).set([ 'server', SID ]).on();
						
						if (($c.guest && CAPTCHA.GUEST) || CAPTCHA.USER) {
							$c.socket.send(JSON.stringify({
								type: 'recaptcha',
								siteKey: GLOBAL.GOOGLE_RECAPTCHA_SITE_KEY
							}));
						} else {
							$c.passRecaptcha = true;
							//joinNewUser($c, false, false);
							$c.socket.send(JSON.stringify({
								type: 'pf'
							}));
						}
					} else {
						if(ref.result == 444){
							DIC[$c.id] = $c;
							DNAME[($c.nickname).replace(/\s/g, "")] = $c.id;
							MainDB.users.update([ '_id', $c.id ]).set([ 'server', SID ]).on();

							if (($c.guest && CAPTCHA.GUEST) || CAPTCHA.USER) {
								$c.socket.send(JSON.stringify({
									type: 'recaptcha',
									siteKey: GLOBAL.GOOGLE_RECAPTCHA_SITE_KEY
								}));
							} else {
								MainDB.users.findOne([ '_id', $c.id ]).on(function($blk){
									try{
										if($blk.hasOwnProperty('blackt') && $blk.blackt != undefined && $blk.blackt != null){
											if($blk.blackt < 0) var ksks = 'F';
											else var ksks = $blk.blackt;
										}
										$c.passRecaptcha = true;
										joinNewUser($c, ref.black, ksks);
									}catch(e){
										var ksks = 'F';
										$c.passRecaptcha = true;
										joinNewUser($c, ref.black, ksks);
									}
								});
							}
						}else{
							$c.send('error', {
								code: ref.result, message: ref.black
							});
							$c._error = ref.result;
							$c.socket.close();
						}
						// JLog.info("Black user #" + $c.id);
					}
				});
			});
		});
		Server.on('error', function (err) {
			JLog.warn("Error on ws: " + err.toString());
		});
		KKuTu.init(MainDB, DIC, ROOM, GUEST_PERMISSION, CHAN);
	};
};

function joinNewUser($c, blacks, blk, dos){
	var bl = blacks || 0;
	if(bl != 0){
		$c.send('welcome', {
			id: $c.id,
			guest: $c.guest,
			box: $c.box,
			playTime: $c.data.playTime,
			okg: $c.okgCount,
			users: KKuTu.getUserList(),
			rooms: KKuTu.getRoomList(),
			friends: $c.friends,
			admin: $c.admin,
			test: global.test,
			caj: $c._checkAjae ? true : false
		});
		narrateFriends($c.id, $c.friends, "on");
		KKuTu.publish('conn', {user: $c.getData()});
		JLog.info("New user #" + $c.id);
		JLog.info("Black user #" + $c.id);
		$c.socket.send(JSON.stringify({ type: "blackalert", reason: blacks, when: blk }));
		$c.socket.close();
	}else{
		$c.send('welcome', {
			id: $c.id,
			guest: $c.guest,
			box: $c.box,
			playTime: $c.data.playTime,
			okg: $c.okgCount,
			users: KKuTu.getUserList(),
			rooms: KKuTu.getRoomList(),
			friends: $c.friends,
			admin: $c.admin,
			test: global.test,
			caj: $c._checkAjae ? true : false
		});
		narrateFriends($c.id, $c.friends, "on");
		KKuTu.publish('conn', {user: $c.getData()});

		JLog.info("New user #" + $c.id);
		$c.checkClientVersion();
	}
}

KKuTu.onClientMessage = function ($c, msg) {
	if (!msg) return;
	
	if ($c.passRecaptcha && $c.passFingerprint) {
		processClientRequest($c, msg);
	} else {
		if (msg.type === 'recaptcha') {
			Recaptcha.verifyRecaptcha(msg.token, $c.socket._socket.remoteAddress, function (success) {
				if (success) {
					$c.passRecaptcha = true;

					joinNewUser($c, false, false);

					processClientRequest($c, msg);
				} else {
					JLog.warn(`Recaptcha failed from IP ${$c.socket._socket.remoteAddress}`);

					$c.sendError(447);
					$c.socket.close();
				}
			});
		}
		if(msg.type == 'pfingerprint') {
			MainDB.users.update([ '_id', $c.id ]).set([ 'fingerprint', msg.data ]).on(function($done){
				$c.passFingerprint = true;
				joinNewUser($c, false, false);
				processClientRequest($c,msg);
			});
		}
	}
};

function processClientRequest($c, msg) {
	var stable = true;
	var temp;
	var now = (new Date()).getTime();
	var mgmt = GLOBAL.MGMTUSER.indexOf($c.id)!=-1;
	switch (msg.type) {
		case 'yell':
			if (!msg.value) return;
			if (!$c.admin) return;

			$c.publish('yell', {value: msg.value});
			break;
		case 'palert':
			if (!msg.value) return;
			if (!$c.admin && !mgmt) return;

			$c.publish('palert', {value: msg.value});
			break;
		case 'notice':
			if (!msg.value) return;
			if (!$c.admin && !mgmt) return;

			$c.publish('notice', {value: msg.value});
			break;
		case 'refresh':
			$c.refresh();
			break;
		case 'talk':
			if (!msg.value) return;
			if (!msg.value.substr) return;
			if (!GUEST_PERMISSION.talk) if ($c.guest) {
				$c.send('error', {code: 401});
				return;
			}
			msg.value = msg.value.substr(0, 400);
			if ($c.admin || mgmt) {
				if (!processAdmin($c.id, msg.value, mgmt)) break;
			}
			checkTailUser($c.id, $c.place, msg);
			if (msg.whisper) {
				msg.whisper.split(',').forEach(v => {
					if (temp = DIC[DNAME[v]]) {
						temp.send('chat', {
							from: $c.nickname,
							profile: $c.profile,
							value: msg.value
						});
					} else {
						$c.sendError(424, v);
					}
				});
			} else {
				$c.chat(msg.value);
			}
			break;
		/*case 'getping':
			if(temp = DIC[msg.target]){
				if (temp.guest) return $c.sendError(453);
				temp.send('getping', {from: $c.id});
			} else {
				$c.sendError(450);
			}
			break;*/
		case 'friendAdd':
			if (!msg.target) return;
			if ($c.guest) return;
			if ($c.id == msg.target) return;
			if (Object.keys($c.friends).length >= 100) return $c.sendError(452);
			if (temp = DIC[msg.target]) {
				if (temp.guest) return $c.sendError(453);
				if ($c._friend) return $c.sendError(454);
				$c._friend = temp.id;
				temp.send('friendAdd', {from: $c.id});
			} else {
				$c.sendError(450);
			}
			break;
		case 'friendAddRes':
			if (!(temp = DIC[msg.from])) return;
			if (temp._friend != $c.id) return;
			if (msg.res) {
				// $c와 temp가 친구가 되었다.
				$c.addFriend(temp.id);
				temp.addFriend($c.id);
			}
			temp.send('friendAddRes', {target: $c.id, res: msg.res});
			delete temp._friend;
			break;
		case 'friendEdit':
			if (!$c.friends) return;
			if (!$c.friends[msg.id]) return;
			$c.friends[msg.id] = (msg.memo || "").slice(0, 50);
			$c.flush(false, false, true);
			$c.send('friendEdit', {friends: $c.friends});
			break;
		case 'friendRemove':
			if (!$c.friends) return;
			if (!$c.friends[msg.id]) return;
			$c.removeFriend(msg.id);
			break;
		case 'enter':
		case 'setRoom':
			if (!msg.title) stable = false;
			if (!msg.limit) stable = false;
			if (!msg.round) stable = false;
			if (!msg.time) stable = false;
			if (!msg.opts) stable = false;

			msg.code = false;
			msg.limit = Number(msg.limit);
			msg.mode = Number(msg.mode);
			msg.round = Number(msg.round);
			msg.time = Number(msg.time);

			if (isNaN(msg.limit)) stable = false;
			if (isNaN(msg.mode)) stable = false;
			if (isNaN(msg.round)) stable = false;
			if (isNaN(msg.time)) stable = false;

			if (stable) {
				if (msg.title.length > 24) stable = false;
				if (msg.password.length > 24) stable = false;
				if (msg.limit < 1 || msg.limit > 8) {
					if(!$c.admin){
						msg.code = 432;
						stable = false;
					}
				}
				if (msg.mode < 0 || msg.mode >= MODE_LENGTH) stable = false;
				if (msg.round < 1 || msg.round > 10/*15*/) {
					if(!$c.admin){
						msg.code = 433;
						stable = false;
					}
				}
				if (ENABLE_ROUND_TIME.indexOf(msg.time) == -1 && $c.admin == false) stable = false;
			}
			if (msg.type == 'enter') {
				if (msg.id || stable) $c.enter(msg, msg.spectate);
				else $c.sendError(msg.code || 431);
			} else if (msg.type == 'setRoom') {
				if (stable) $c.setRoom(msg);
				else $c.sendError(msg.code || 431);
			}
			break;
		case 'inviteRes':
			if (!(temp = ROOM[msg.from])) return;
			if (!GUEST_PERMISSION.inviteRes) if ($c.guest) return;
			if ($c._invited != msg.from) return;
			if (msg.res) {
				$c.enter({id: $c._invited}, false, true);
			} else {
				if (DIC[temp.master]) DIC[temp.master].send('inviteNo', {target: $c.id});
			}
			delete $c._invited;
			break;
		/* 망할 셧다운제
		case 'caj':
			if(!$c._checkAjae) return;
			clearTimeout($c._checkAjae);
			if(msg.answer == "yes") $c.confirmAjae(msg.input);
			else if(KKuTu.NIGHT){
				$c.sendError(440);
				$c.socket.close();
			}
			break;
		*/
		case 'test':
			checkTailUser($c.id, $c.place, msg);
			break;
		case 'nickchange':
			var MDB = require('../Web/db');
			MDB.users.findOne([ '_id', $c.id ]).on(function($nir){
				if(!$nir) return;
				if(!$nir.nikc) return;
				if($nir.nikc == 0) return;
				MDB.users.update([ '_id', $c.id ]).set([ 'nikc', 0 ]).on();
				DNAME[($nir.nickname).replace(/\s/g, "")] = $c.id;
				$c.nickname = $nir.nickname;
				$c.nickchange($nir.nickname);
				KKuTu.publish('nikc', { value: $nir.nickname, usr: $c.id });
			});
			break;
		case 'exordialc':
			$c.exordialc();
			break;
		case 'rainbow':
			$c.chat(msg.value, false, 'r');
			break;
		case 'renew':
			$c.renew();
			break;
		case 'dict':
			$c.dict(msg.word, msg.lang, msg.mode);
			break;
		case 'kdn':
			$c.kdn();
			break;
		case 'rank':
			$c.rank(msg.id, msg.pg, msg.tp);
			break;
		case 'event':
			$c.evtStat();
			break;
		case 'ping':
			$c.ping();
			break;
		case 'equip':
			$c.reqEquip(msg.id, msg.isLeft);
			break;
		case 'box':
			$c.reqBox();
			break;
		case 'cfView':
			$c.cfView(msg.text, msg.level, msg.blend);
			break;
		case 'cfReward':
			$c.cfReward(msg.tray);
			break;
		case 'cns':
			$c.cnsItem(msg.id);
			break;
		case 'cnsall':
			$c.cnsAll(msg.id);
			break;
		case 'receiveItem':
			$c.receiveItem(msg.id);
			break;
		case 'getMission':
			$c.getMission();
			break;
		case 'changeExp':
			$c.changeExp(msg.value);
			break;
		case 'version':
			$c.checkCallback(msg.value);
			break;
		case 'viewstat':
			$c.viewstat();
			break;
		case 'applystat':
			$c.applystat(msg.target, msg.value);
			break;
		case 'statreset':
			$c.statreset();
			break;
		case 'hwak':
			$c.hwak(msg.value);
			break;
		default:
			break;
	}
}

KKuTu.onClientClosed = function($c, code){
	delete DIC[$c.id];
	if($c._error != 409) MainDB.users.update([ '_id', $c.id ]).set([ 'server', "" ]).on();
	if($c.profile) delete DNAME[$c.nickname];
	if($c.socket) $c.socket.removeAllListeners();
	if($c.friends) narrateFriends($c.id, $c.friends, "off");
	KKuTu.publish('disconn', { id: $c.id });
	/*var MDB = require('../Web/db');
	if(!$c.guest){
		MDB.users.findOne([ '_id', $c.id ]).on(function($rst){
			MDB.users.update([ '_id', $c.id ]).
		});
	}*/
	JLog.alert("Exit #" + $c.id);
};