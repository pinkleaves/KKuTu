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

/**
 * 볕뉘 수정사항:
 * Login 을 Passport 로 수행하기 위한 수정
 */

var WS		 = require("ws");
var Express	 = require("express");
// 해티 수정
var vHost = require('vhost');
// 해티 수정 끝
var Exession = require("express-session");
var Redission= require("connect-redis")(Exession);
var Redis	 = require("redis");
var Parser	 = require("body-parser");
var CookieParser = require("cookie-parser");
var DDDoS	 = require("dddos");
var Server	 = Express();

var no_restart = [false, false, true];
var DB		 = require("./db");
//볕뉘 수정 구문삭제 (28)
var JLog	 = require("../sub/jjlog");
var WebInit	 = require("../sub/webinit");
var GLOBAL	 = require("../sub/global.json");
var Secure = require('../sub/secure');
//볕뉘 수정
var passport = require('passport');
//볕뉘 수정 끝
var Const	 = require("../const");
var https	 = require('https');
var fs		 = require('fs');
var BLOCKED = require('./ip_block.json');
var Language = {
	'ko_KR': require("./lang/ko_KR.json"),
	'en_US': require("./lang/en_US.json")
};
//볕뉘 수정
var ROUTES = [
	"major", "consume", "admin", "login"
];
//볕뉘 수정 끝
var page = WebInit.page;
var gameServers = [];
var iplist = {};
var portal_last = 0;
WebInit.MOBILE_AVAILABLE = [
	"portal", "main", "kkutu", "login"
];

require("../sub/checkpub");

JLog.info("<< KKuTu Web >>");
//require('events').EventEmitter.defaultMaxListeners = 11;
Server.set('views', __dirname + "/views");
Server.set('view engine', "pug");
Server.use(Express.static(__dirname + "/public"));
Server.use(Parser.urlencoded({ extended: true }));
Server.use(CookieParser());
Server.use(Exession({
	//use only for redis-installed

	store: new Redission({
		client: Redis.createClient(),
		ttl: 3600 * 12
	}),
	secret: 'kkutu',
	resave: false,
	saveUninitialized: true
}));
//볕뉘 수정
Server.use(passport.initialize());
Server.use(passport.session());

Server.use((req, res, next) => {
	if(req.session.passport) {
		delete req.session.passport;
	}
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress || req.ip || "::ffff:";
	if(BLOCKED.LIST.indexOf(ip)!=-1) return res.send('운영정책 위반으로 인해 차단된 IP입니다.');
	next();
});
Server.use((req, res, next) => {
	if(Const.IS_SECURED) {
		if(req.protocol == 'http') {
			let url = 'https://'+req.get('host')+req.path;
			res.status(302).redirect(url);
		} else {
			next();
		}
	} else {
		next();
	}
});
//볕뉘 수정 끝
/* use this if you want */

// 해티 수정
/*DDDoS = new DDDoS({
	maxWeight: 30,
	checkInterval: 10000,
	rules: [{
		regexp: "^/(cf|dict|gwalli|ranking|ranknik|mygnick|kkutu)",
		maxWeight: 40,
		errorData: "429 Too Many Requests"
	}, {
		regexp: "^/(help)",
		maxWeight: 80,
		errorData: "429 Too Many Requests"
	}, {
		regexp: ".*",
		errorData: "429 Too Many Requests"
	}]
});
DDDoS.rules[0].logFunction = DDDoS.rules[1].logFunction = function(ip, path){
	JLog.warn(`[DoS] DoS from IP ${ip} on ${path}`);
};
webServer.use(DDDoS.express());*/

// 해티 수정 끝

WebInit.init(Server, true);
DB.ready = function(){
	setInterval(function(){
		var q = [ 'createdAt', { $lte: Date.now() - 3600000 * 12 } ];

		DB.session.remove(q).on();
	}, 600000);
	setInterval(function(){
		gameServers.forEach(function(v){
			if(v.socket) v.socket.send(`{"type":"seek"}`);
			else v.seek = undefined;
		});
	}, 4000);
	JLog.success("DB is ready.");

	DB.kkutu_shop_desc.find().on(function($docs){
		var i, j;

		for(i in Language) flush(i);
		function flush(lang){
			var db;

			Language[lang].SHOP = db = {};
			for(j in $docs){
				db[$docs[j]._id] = [ $docs[j][`name_${lang}`], $docs[j][`desc_${lang}`] ];
			}
		}
	});
	Server.listen(3000);
};
Const.MAIN_PORTS.forEach(function(v, i){
	var KEY = process.env['WS_KEY'];
	var protocol;
	/*if(Const.IS_SECURED) {
		protocol = 'wss';
	} else {
		protocol = 'ws';
	}*/
	protocol = 'ws';
	gameServers[i] = new GameClient(KEY, `${protocol}://127.0.0.2:${v}/${KEY}`, i + 1);
});
function GameClient(id, url, i){
	var my = this;
	var trc = 0;
	my.id = id;
	my.tryConnet = 0;
	my.connected = false;
	my.socket = new WS(url, {
		perMessageDeflate: false,
		rejectUnauthorized: false
	});
	
	my.send = function(type, data){
		if(!data) data = {};
		data.type = type;

		try{
			my.socket.send(JSON.stringify(data));
		}catch(e){
		}
	};
	function onGameOpen () {
		JLog.info(`Game server #${i} connected`);
		my.connected = true;
	}
	function onGameError (err) {
		my.connected = true;
		if (trc > 0) { 
			my.tryConnet++
		}

		JLog.warn(`Game server #${i} has an error: ${err.toString()}`);
	}
	function onGameClose (code) {
		my.connected = false;

		JLog.error(`Game server #${i} closed: ${code}`);
		my.socket.removeAllListeners();
		delete my.socket;
		
		if (my.tryConnet <= trc && !no_restart[i - 1]) {
			JLog.info(`Retry connect to 5 seconds` + (trc > 0 ? `, try: ${my.tryConnet}` : ''));
			setTimeout(() => {
				my.socket = new WS(url, {
					perMessageDeflate: false,
					rejectUnauthorized: false,
					handshakeTimeout: 2000
				});
				my.socket.on('open', onGameOpen);
				my.socket.on('error', onGameError);
				my.socket.on('close', onGameClose);
				my.socket.on('message', onGameMessage);
			}, 5000);
		} else {
			JLog.info('Connection Failed.');
		}
	}
	function onGameMessage (data) {
		var _data = data;
		var i;

		data = JSON.parse(data);

		switch(data.type){
			case "seek":
				my.seek = data.value;
				break;
			case "narrate-friend":
				for(i in data.list){
					gameServers[i].send('narrate-friend', { id: data.id, s: data.s, stat: data.stat, list: data.list[i] });
				}
				break;
			default:
		}
	}
	my.socket.on('open', onGameOpen);
	my.socket.on('error', onGameError);
	my.socket.on('close', onGameClose);
	my.socket.on('message', onGameMessage);
}

ROUTES.forEach(function(v){
	require(`./routes/${v}`).run(Server, WebInit.page);
});
Server.get("/recruit", function(req, res){
	res.send(`<META http-equiv="Refresh" content="1; URL=${GLOBAL.RECRUIT_URL}">`);
});
function getCookie(cName, cookie){
	//볕뉘 수정
	var cName = cName+"=";
	var allCookie = cookie.split(';');
	var cval = [];
	for(var i=0; i < allCookie.length; i++) {
		if (allCookie[i].trim().indexOf(cName) == 0) {
			cval = allCookie[i].trim().split("=");
		}
	}
	return unescape((cval.length > 0) ? cval[1] : "");
	//볕뉘 수정 끝
}
Server.get("/kkutu", function(req, res){
	var cookie = req.headers.cookie;
	try{
		var server = getCookie('server', cookie) || 0;
	}catch(e){
		var server = 0;
	}
	if(!Const.MAIN_PORTS[server]) server = 0;
	//볕뉘 수정 구문삭제(220~229, 240)
	var expDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 14);
	res.cookie('server', server, { expires: expDate });
	
	DB.session.findOne([ '_id', req.session.id ]).on(function($ses){
		// var sid = (($ses || {}).profile || {}).sid || "NULL";
		if(global.isPublic){
			onFinish($ses);
			// DB.jjo_session.findOne([ '_id', sid ]).limit([ 'profile', true ]).on(onFinish);
		}else{
			if($ses) $ses.profile.sid = $ses._id;
			onFinish($ses);
		}
	});
	function onFinish($doc){
		var id = req.session.id;

		if($doc){
			req.session.profile = $doc.profile;
			id = $doc.profile.sid;
		}else{
			delete req.session.profile;
		}
		page(req, res, "kkutu", {
			'_page': "kkutu",
			'_id': id,
			'PORT': Const.MAIN_PORTS[server],
			'HOST': req.hostname,
			'PROTOCOL': Const.IS_SECURED ? 'wss' : 'ws',
			'TEST': req.query.test,
			'MOREMI_PART': Const.MOREMI_PART,
			'AVAIL_EQUIP': Const.AVAIL_EQUIP,
			'CATEGORIES': Const.CATEGORIES,
			'GROUPS': Const.GROUPS,
			'MODE': Const.GAME_TYPE,
			'RULE': Const.RULE,
			'OPTIONS': Const.OPTIONS,
			'KO_INJEONG': Const.KO_INJEONG,
			'EN_INJEONG': Const.EN_INJEONG,
			'KO_THEME': Const.KO_THEME,
			'EN_THEME': Const.EN_THEME,
			'IJP_EXCEPT': Const.IJP_EXCEPT,
			'ogImage': "http://kkutu.kr/img/kkutu/logo.png",
			'ogURL': "http://kkutu.kr/",
			'ogTitle': "언제나 즐거운 분홍끄투!",
			'ogDescription': "끝말잇기가 이렇게 박진감 넘치는 게임이었다니!"
		});
	}
});
Server.get("/", function(req, res){
	var server = req.query.server || req.query.s;
	var cookie = req.headers.cookie;
	if(Const.MAIN_PORTS[server]){
		var expDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 14);
		res.cookie('server', server, { expires: expDate });
		res.redirect('/kkutu');
		return;
	}
	/*try{
		var server = getCookie('server', cookie) || req.query.s || req.query.server || 0;
	}catch(e){
		var server = 0;
	}*/
	//볕뉘 수정 구문삭제(220~229, 240)
	DB.session.findOne([ '_id', req.session.id ]).on(function($ses){
		// var sid = (($ses || {}).profile || {}).sid || "NULL";
		if(global.isPublic){
			onFinish($ses);
			// DB.jjo_session.findOne([ '_id', sid ]).limit([ 'profile', true ]).on(onFinish);
		}else{
			if($ses) $ses.profile.sid = $ses._id;
			onFinish($ses);
		}
	});
	function onFinish($doc){
		var id = req.session.id;

		if($doc){
			req.session.profile = $doc.profile;
			id = $doc.profile.sid;
		}else{
			delete req.session.profile;
		}
		page(req, res, Const.MAIN_PORTS[server] ? "kkutu" : "portal", {
			'_page': "kkutu",
			'_id': id,
			'PORT': Const.MAIN_PORTS[server],
			'HOST': req.hostname,
			'PROTOCOL': Const.IS_SECURED ? 'wss' : 'ws',
			'TEST': req.query.test,
			'MOREMI_PART': Const.MOREMI_PART,
			'AVAIL_EQUIP': Const.AVAIL_EQUIP,
			'CATEGORIES': Const.CATEGORIES,
			'GROUPS': Const.GROUPS,
			'MODE': Const.GAME_TYPE,
			'RULE': Const.RULE,
			'OPTIONS': Const.OPTIONS,
			'KO_INJEONG': Const.KO_INJEONG,
			'EN_INJEONG': Const.EN_INJEONG,
			'KO_THEME': Const.KO_THEME,
			'EN_THEME': Const.EN_THEME,
			'IJP_EXCEPT': Const.IJP_EXCEPT,
			'ogImage': "http://kkutu.kr/img/kkutu/logo.png",
			'ogURL': "http://kkutu.kr/",
			'ogTitle': "언제나 즐거운 분홍끄투!",
			'ogDescription': "끝말잇기가 이렇게 박진감 넘치는 게임이었다니!"
		});
	}
});
Server.get("/servers", function(req, res){
	var list = [];
	var no = [];
	gameServers.forEach(function(v, i){
		list[i] = v.seek;
		if(list[i] != null) no[i] = true;
		else no[i] = false;
	});
	var ls = 0;
	list.forEach(function(v, i){
		if(list[i] != null) ls += v;
	});
	var mx = 0;
	no.forEach(function(v, i){
		if(!no[i]) return;
		else mx += i == 0 ? 60 : 30;
	});
	res.send({ list: [ls], max: mx /*Const.KKUTU_MAX*/ });
});
Server.get("/real", function(q, s){
	var list = [];
	gameServers.forEach(function(v, i){
		list[i] = v.seek;
	});
	s.send({ list: list, max: Const.KKUTU_MAX_SERVER });
});

//볕뉘 수정 구문 삭제(274~353)

Server.get("/legal/:page", function(req, res){
	page(req, res, "legal/"+req.params.page);
});

/*Server.use(function(req, res, next){
	throw new Error('Not Found: ' + req.url);
});

Server.use(function(err, req, res, next){
	res.send('<h2>404 Not Found</h2><br><br>찾을 수 없는 페이지로 접속하셨습니다. 잠시 후 메인 페이지로 이동합니다.<script>setTimeout(function(){ window.location.href = "/" }, 3000);</script>');
});*/
