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

var Web		 = require("request");
var MainDB	 = require("../db");
var JLog	 = require("../../sub/jjlog");
var Const	 = require("../../const");
var File = require('fs');
var path = require('path');
var Lizard	 = require("../../sub/lizard.js");
var ko_KR = require("../lang/ko_KR.json");
const per = [100, 90, 70, 60, 45, 25, 10, 8.5, 7.5, 5, 0];
//const per = [100, 95, 80, 70, 50, 30, 15, 12.5, 10, 7.5, 0];

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
function consume($user, key, value, force){
	var bd = $user.box[key];
	
	if(bd.value){
		// 기한이 끝날 때까지 box 자체에서 사라지지는 않는다. 기한 만료 여부 확인 시점: 1. 로그인 2. box 조회 3. 게임 결과 반영 직전 4. 해당 항목 사용 직전
		if((bd.value -= value) <= 0){
			if(force || !bd.expire) delete $user.box[key];
		}
	}else{
		if(($user.box[key] -= value) <= 0) delete $user.box[key];
	}
}
function checkBought(id){
	MainDB.users.findOne([ '_id', id ]).on(function($bgh){
		if($bgh.hasOwnProperty('lvup')){
			if(String($bgh.lvup) == '8') return false;
			else return true;
		}else{
			return true;
		}
	});
}
function success(id, gid){
	MainDB.users.findOne([ '_id', id ]).on(function($en){
		if(!$en) return 400;
		if(!$en.enhance) $en.enhance = {};
		if(!$en.enhance[gid]) return true;
		else{
			var perc = $en.enhance[gid];
			var nw = per[perc];
			var el = Math.floor((Math.random() * 10000)) / 100;
			JLog.log(`${nw}, ${el}`);
			if(el <= nw){
				JLog.log('success');
				return 200;
			}else{
				JLog.log('fail');
				return 300;
			}
		}
	});
}
function getCost(level, sc){
	var sq;
	if(sc.hasOwnProperty('gEXP')) sq = sc["gEXP"];
	else if(sc.hasOwnProperty('gMNY')) sq = sc["gMNY"];
	
	var sa;
	sa = 0;
	sa += ((level + 1.21) * 4.3379) * (sq * 13281.6) * 0.9858;
	return Math.floor(sa / 2.2373);
}
exports.run = function(Server, page){
Server.get("/prlang", function(req, res){
	res.send({ data: ko_KR.kkutu });
});
Server.get("/getnickname/:id", function(req, res){
    var ID = req.params.id;
	try{
		MainDB.users.findOne([ '_id', ID ]).on(function($body){
			if($body.nickname == null || $body.nickname == undefined || $body.nickname == "") return res.send(null);
			else return res.send($body.nickname);
		});
	}catch(e){
		return res.send(null);
	}
});

Server.get("/box", function(req, res){
	if(req.session.profile){
		/*if(Const.ADMIN.indexOf(req.session.profile.id) == -1){
			return res.send({ error: 555 });
		}*/
	}else{
		return res.send({ error: 400 });
	}
	MainDB.users.findOne([ '_id', req.session.profile.id ]).limit([ 'box', true ]).on(function($body){
		if(!$body){
			res.send({ error: 400 });
		}else{
			res.send($body.box);
		}
	});
});
Server.get("/help", function(req, res){
	page(req, res, "help", {
		'KO_INJEONG': Const.KO_INJEONG
	});
});
Server.get("/ranking", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.redis.getSurround(id, 15).then(function($body){
			res.send($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.redis.getPage(pg, 15).then(function($body){
			res.send($body);
		});
	}
});
Server.get("/rankprev", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.redis.getSurround(id, 15).then(function($body){
			if($body) onRank($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.redis.getPage(pg, 15).then(function($body){
			if($body) onRank($body);
		});
	}
	function onRank(list){
		var gnk = {};
		
		Lizard.all(list.data.map(function(v){
			if(gnk[v.id]) return null;
			else{
				gnk[v.id] = true;
				return getProfile(v.id);
			}
		})).then(function(data){
			res.send({ list: data });
		});
	}
	function getProfile(id){
		var R = new Lizard.Tail();
		
		if(id) MainDB.users.findOne([ '_id', id ]).on(function($u){
			R.go($u.rank);
		}); else R.go(null);
		return R;
	}
});
Server.get("/ranknik", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.redis.getSurround(id, 15).then(function($body){
			if($body) onRank($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.redis.getPage(pg, 15).then(function($body){
			if($body) onRank($body);
		});
	}
	function onRank(list){
		var gnk = {};
		
		Lizard.all(list.data.map(function(v){
			if(gnk[v.id]) return null;
			else{
				gnk[v.id] = true;
				return getProfile(v.id);
			}
		})).then(function(data){
			res.send({ list: data });
		});
	}
	function getProfile(id){
		var R = new Lizard.Tail();
		
		if(id) MainDB.users.findOne([ '_id', id ]).on(function($u){
			try{
				R.go({ nick: $u.nickname, prev: $u.rank });
			}catch(e){
				R.go({ nick: null, prev: null });
			}
		}); else R.go({ nick: null, prev: null });
		return R;
	}
});
Server.get("/pgnik", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.ping.getSurround(id, 15).then(function($body){
			onRank($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.ping.getPage(pg, 15).then(function($body){
			onRank($body);
		});
	}
	function onRank(list){
		var gnk = {};
		
		Lizard.all(list.data.map(function(v){
			if(gnk[v.id]) return null;
			else{
				gnk[v.id] = true;
				return getProfile(v.id);
			}
		})).then(function(data){
			res.send({ list: data });
		});
	}
	function getProfile(id){
		var R = new Lizard.Tail();
		
		if(id) MainDB.users.findOne([ '_id', id ]).on(function($u){
			R.go($u.nickname);
		}); else R.go(null);
		return R;
	}
});
Server.get("/mygnick", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.myeong.getSurround(id, 15).then(function($body){
			onRank($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.myeong.getPage(pg, 15).then(function($body){
			onRank($body);
		});
	}
	function onRank(list){
		var gnk = {};
		
		Lizard.all(list.data.map(function(v){
			if(gnk[v.id]) return null;
			else{
				gnk[v.id] = true;
				return getProfile(v.id);
			}
		})).then(function(data){
			JLog.log(JSON.stringify(data))
			res.send({ list: data });
		});
	}
	function getProfile(id){
		var R = new Lizard.Tail();
		
		if(id) MainDB.users.findOne([ '_id', id ]).on(function($u){
			R.go($u.nickname);
		}); else R.go(null);
		return R;
	}
});
Server.get("/myeong", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;
	
	if(id){
		MainDB.myeong.getSurround(id, 15).then(function($body){
			res.send($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.myeong.getPage(pg, 15).then(function($body){
			res.send($body);
		});
	}
});
Server.get("/ping", function(req, res){
	var pg = Number(req.query.p);
	var id = req.query.id;

	if(id){
		MainDB.ping.getSurround(id, 15).then(function($body){
			res.send($body);
		});
	}else{
		if(isNaN(pg)) pg = 0;
		MainDB.ping.getPage(pg, 15).then(function($body){
			res.send($body);
		});
	}
});
Server.get("/evtstat", function(req, res){
	MainDB.evt.findOne([ '_id', 'cday' ]).on(function($evt){
		if(!$evt) res.send({ evtKey: 0 });
		else res.send($evt);
	});
});
Server.get("/injeong/:word", function(req, res){
	if(!req.session.profile) return res.send({ error: 402 });
	var word = req.params.word;
	var theme = req.query.theme;
	var now = Date.now();
	
	if(now - req.session.injBefore < 2000) return res.send({ error: 429 });
	req.session.injBefore = now;
	
	MainDB.kkutu['ko'].findOne([ '_id', word.replace(/[^가-힣0-9]/g, "") ]).on(function($word){
		if($word) return res.send({ error: 409 });
		MainDB.kkutu_injeong.findOne([ '_id', word ]).on(function($ij){
			if($ij){
				if($ij.theme == '~') return res.send({ error: 406 });
				else return res.send({ error: 403 });
			}
			Web.get("https://namu.moe/w/" + encodeURI(word), function(err, _res){
				if(err) return res.send({ error: 400 });
				else if(_res.statusCode != 200) return res.send({ error: 405 });
				MainDB.kkutu_injeong.insert([ '_id', word ], [ 'theme', theme ], [ 'createdAt', now ], [ 'writer', req.session.profile.id ]).on(function($res){
					res.send({ message: "OK" });
				});
			});
		});
	});
});
Server.get("/cf/:word", function(req, res){
	res.send(getCFRewards(req.params.word, Number(req.query.l || 0), req.query.b == "1"));
});
Server.get("/shop", function(req, res){
	MainDB.kkutu_shop.find().limit([ 'cost', true ], [ 'reqlvl' , true], [ 'term', true ], [ 'group', true ], [ 'options', true ], [ 'updatedAt', true ], [ 'isEvent', true ], [ 'evtCost', true ]).on(function($goods){
		res.json({ goods: $goods });
	});
	// res.json({ error: 555 });
});
Server.get("/cookie", function(req, res){
	/*var normalopt = {
		mb: false,
		me: false,
		di: false,
		dw: false,
		df: false,
		ar: false,
		su: false,
		ow: false,
		ou: false,
		ml: false,
		rq: false,
		ms: false,
		bw: true,
		mc: false,
		bg: false
	}*/
	if(req.session.profile){
		MainDB.users.findOne([ '_id', req.session.profile.id ]).on(function($res){
			if($res.hasOwnProperty('settingopt') && $res.settingopt != null) res.send({ list: $res.settingopt });
			else res.send({ error: 400 });
		});
	}else res.send({ error: 400 });
});
Server.post("/chkn", function(req, res){
	var text = req.body.data || "";
	var s = req.session.profile;
	text = text.trim();
	if(req.session.profile){
		text = text.slice(0, 100);
		MainDB.users.findOne([ 'nickname', text ]).on(function($body){
			try{
				if($body._id) res.send({ error: 627 });
			}catch(e){
				res.send({ text: text });
			}
		});
	}else res.send({ error: 400 });
});
// POST
Server.post("/enhance/:item", function(req, res){
	var gid = req.params.item;
	if(req.session.profile){
		MainDB.users.findOne([ '_id', req.session.profile.id ]).on(function($ping){
			MainDB.kkutu_shop.findOne([ '_id', gid ]).on(function($item){
				if(!$item) return;
				else if(!$item.options.hasOwnProperty('gEXP') && !$item.options.hasOwnProperty('gMNY')) return res.json({ error: 400 });
				else{
					if(!$ping.enhance) $ping.enhance = {};
					var cost = getCost($ping.enhance[gid] || 0, $item.options);
					JLog.log(cost);
					if($ping.money < cost) return res.json({ error: 400 });
					else{
						var succ = false;
						if(!$ping.enhance.hasOwnProperty(gid)) succ = true;
						var perc = $ping.enhance[gid];
						var nw = per[perc];
						var el = Math.floor((Math.random() * 10000)) / 100;
						if(el <= nw){
							JLog.log(`ENHANCE [${req.session.profile.id}] ITEM: ${gid} LV: ${perc} PERCENT: ${nw} STAT: SUCCESS`);
							if(!succ) succ = 200;
						}else{
							JLog.log(`ENHANCE [${req.session.profile.id}] ITEM: ${gid} LV: ${perc} PERCENT: ${nw} STAT: FAILURE`);
							if(!succ) succ = 300;
						}
						if(succ == 400) return res.json({ error: 400 });
						else if(succ == 300){
							var eqla = Number($ping.money);
							MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'money', Number($ping.money) - cost ]).on();
							eqla -= cost;
							return res.json({ fail: 201, money: eqla });
						}else{
							MainDB.users.findOne([ '_id', req.session.profile.id ]).on(function($res){
								if(!$res) res.send({ error: 400 });
								else{
									if(!$res.enhance) $res.enhance = {};
									if($res.enhance.hasOwnProperty(gid)) $res.enhance[gid] += 1;
									else{
										$res.enhance[gid] = 1;
									}
									var eqla = Number($ping.money);
									eqla -= cost;
									MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'enhance', $res.enhance ], [ 'money', Number($res.money) - cost ]).on(function($two){
										res.send({ result: 200, money: eqla, data: $res.enhance });
									});
								}
							});
						}
					}
				}
			});
		});
	}else res.send({ error: 400 });
});
					
/*Server.post("/moveacc", function(req, res){
	var jid = req.query.id;
	
	if(req.session.profile){
		var id = { me: req.session.profile.id, target: jid }
		MainDB.users.findOne([ '_id', id.target ]).on(function($chk){
			if(!$chk) res.send({ error: 781 });
			else{
				JLog.log(`Account Switch: [${id.me}] > [${id.target}]`);
				MainDB.users.findOne([ '_id', id.me ]).on(function($chg){
					MainDB.users.update([ '_id', id.target ]).set(
						[ 'money', $chg.money ],
						[ 'kkutu', $chg.kkutu ],
						[ 'box', $chg.box ],
						[ 'equip', $chg.equip ],
						[ 'exordial', $chg.exordial ],
						[ 'black', $chg.black ],
						[ 'nickname', $chg.nickname ],
						[ 'lastaccess', $chg.lastaccess ]
					).on(function($las){
						
					});
				});
			}
		});
	}
});*/

Server.post("/reset", function(req, res){
	if(req.session.profile){
		var kj = {};
		var defa = {"score":0,"playTime":0,"connectDate":0,"record":{"EKT":[0,0,0,0],"ESH":[0,0,0,0],"KKT":[0,0,0,0],"KSH":[0,0,0,0],"CSQ":[0,0,0,0],"KCW":[0,0,0,0],"KTY":[0,0,0,0],"ETY":[0,0,0,0],"KAP":[0,0,0,0],"HUN":[0,0,0,0],"KDA":[0,0,0,0],"EDA":[0,0,0,0],"KSS":[0,0,0,0],"ESS":[0,0,0,0],"KAD":[0,0,0,0],"EAD":[0,0,0,0],"KAW":[0,0,0,0],"EAW":[0,0,0,0],"KMT":[0,0,0,0],"KEA":[0,0,0,0],"EKD":[0,0,0,0],"KDG":[0,0,0,0],"EDG":[0,0,0,0],"EAP":[0,0,0,0],"KJH":[0,0,0,0],"EJH":[0,0,0,0],"KGT":[0,0,0,0],"KTT":[0,0,0,0],"ETT":[0,0,0,0]}};
		//var defa = {};
		//var defa = {"score":0,"playTime":0,"connectDate":0,"record":{"EKT":[0,0,0,0],"ESH":[0,0,0,0],"KKT":[0,0,0,0],"KSH":[0,0,0,0],"CSQ":[0,0,0,0],"KCW":[0,0,0,0],"KTY":[0,0,0,0],"ETY":[0,0,0,0],"KAP":[0,0,0,0],"HUN":[0,0,0,0],"KDA":[0,0,0,0],"EDA":[0,0,0,0],"KSS":[0,0,0,0],"ESS":[0,0,0,0],"KAD":[0,0,0,0],"EAD":[0,0,0,0],"KAW":[0,0,0,0],"EAW":[0,0,0,0],"KMT":[0,0,0,0],"KEA":[0,0,0,0],"EKD":[0,0,0,0],"KDG":[0,0,0,0],"EDG":[0,0,0,0],"EAP":[0,0,0,0],"KJH":[0,0,0,0],"EJH":[0,0,0,0]}}
		MainDB.users.update([ '_id', req.session.profile.id ]).set(
			[ 'money', 0 ],
			[ 'kkutu', defa ],
			[ 'box', kj ],
			[ 'equip', kj ],
			[ 'exordial', '' ],
			[ 'nickname', '' ],
			[ 'enhance', kj ]
		).on(function($res){
			MainDB.redis.putGlobal(req.session.profile.id, 0).then(function(res){
				JLog.log(`FLUSHED [${req.session.profile.id}] PTS=0 MNY=0 NICK=`);
			});
			res.send({ result: 200 });
		});
	}else res.send({ error: 400 });
});

Server.post("/cookie", function(req, res){
	var s = JSON.parse(req.body.data);
	if(req.session.profile){
		MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'settingopt', s ]).on(function($res){
			res.send({ result: 200 });
		});
	}else res.send({ result: 200 });
});
Server.post("/userinfo", function(req, res){
	if(req.session.profile){
		var l = req.session.profile;
		JLog.log(`User #${l.id}'s SID is "${req.session.id}"`);
	}
	res.send({ result: 200 });
});
Server.post("/flush", function(req, res){
	if(req.session.profile){
		try{
			MainDB.users.findOne([ '_id', req.session.profile.id ]).on(function($fls){
				if(!!$fls){
					if($fls.hasOwnProperty('money')) var jm = $fls.money;
					var uu;
					if(!$fls.kkutu.score) uu = 0;
					else uu = $fls.kkutu.score;
					if(uu >= 40110000){
						MainDB.redis.remove(req.session.profile.id).then(function(res){
							JLog.log(`FLUSHED [${req.session.profile.id}] DELETE / PTS=${uu} MNY=${jm} NICK=${$fls.nickname}`);
						});
						MainDB.myeong.putGlobal(req.session.profile.id, uu).then(function(res){
							JLog.log(`FLUSHED [${req.session.profile.id}] PING / PTS=${uu} MNY=${jm} NICK=${$fls.nickname}`);
						});
						MainDB.ping.putGlobal(req.session.profile.id, jm).then(function(res){
							JLog.log(`FLUSHED [${req.session.profile.id}] MYEONG / PTS=${uu} MNY=${jm} NICK=${$fls.nickname}`);
						});
					}else{
						MainDB.redis.putGlobal(req.session.profile.id, uu).then(function(res){
							JLog.log(`FLUSHED [${req.session.profile.id}] PTS=${uu} MNY=${jm} NICK=${$fls.nickname}`);
						});
						MainDB.ping.putGlobal(req.session.profile.id, jm).then(function(res){
							JLog.log(`FLUSHED [${req.session.profile.id}] PING / PTS=${uu} MNY=${jm} NICK=${$fls.nickname}`);
						});
					}
				}
			});
		}catch(e){
			var u = 1234;
		}
		try{
			MainDB.users.findOne([ '_id', req.session.profile.id ]).on(function($fls){
				MainDB.redis.getPage(0, 10000).then(function($body){
					var nowr = $body.data.length;
					if(!!$fls){
						if(!$fls.hasOwnProperty('rank') || $fls.rank == undefined || $fls.rank == null || !$fls.rank){
							MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'rank', nowr + 1 ]).on();
						}
					}
				});
			});
		}catch(e){
			MainDB.redis.getPage(0, 10000).then(function($body){
				var nowr = $body.data.length;
				MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'rank', nowr + 1 ]).on();
			});
		}
		res.send({ result: 200 });
	}else res.send({ result: 200 });
});
Server.post("/nickname", function(req, res){
	var text = req.body.data || "";

	var s = req.session.profile;
	s.title = text.trim();
	text = text.trim();
	var trxp = /[^a-zA-Z가-힣0-9\s\-\_]/g
	var excChar = /\　/g
	var spC = /(\s\s|\-\-|\-\_|\_\-|\_\_)/g
	var badn = trxp.test(text);
	var excC = excChar.test(text);
	var spCn = spC.test(text);
	var fl = text.charAt(0) + text.charAt(-1);
	fl = fl.indexOf('-')!=-1 || fl.indexOf('_')!=-1;
	if(badn || excC || spCn || fl) res.send({ error: 400 });
	else if(req.session.profile){
		text = text.slice(0, 16);
		MainDB.users.findOne([ 'nickname', text ]).on(function($gy){
			if(!!$gy) res.send({ error: 581 });
			else{
				MainDB.session.update([ '_id', req.session.id ]).set([ 'profile', s ]).on(function($res){
					JLog.log('Nickname Changed #' + req.session.profile.id + ' to ' + text);
				});
				MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'nikc', 1 ]).on();
				MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'nickname', text ]).on(function($res){
					res.send({ text: text });
				});
			}
		});
		/*MainDB.session.update([ '_id', req.session.id ]).set([ 'profile', s ]).on(function($res){
			JLog.log('Nickname Changed #' + req.session.profile.id + ' to ' + text);
		});*/
	}else res.send({ error: 400 });
});
Server.post("/exordial", function(req, res){
	var text = req.body.data || "";
	
	if(req.session.profile){
		text = text.slice(0, 100);
		MainDB.users.update([ '_id', req.session.profile.id ]).set([ 'exordial', text ]).on(function($res){
			res.send({ text: text });
		});
	}else res.send({ error: 400 });
});
Server.post("/buy/:id", function(req, res){
	if(req.session.profile){
		var uid = req.session.profile.id;
		var gid = req.params.id;
		
		MainDB.kkutu_shop.findOne([ '_id', gid ]).on(function($item){
			if(!$item) return res.json({ error: 400 });
			if($item.cost < 0 && !req.session.admin) return res.json({ error: 400 });
			/*MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){*/
			MainDB.users.findOne([ '_id', uid ]).on(function($user){
				if(!$user) return res.json({ error: 400 });
				if(!$user.box) $user.box = {};
				if(gid == 'exp_up' && !!$user.lvup) return res.json({ error: 878 });
				
				var postM = $user.money - $item.cost;
				
				if(postM < 0) return res.send({ result: 400 });
				
				obtain($user, gid, 1, $item.term);
				if(gid == 'exp_up') MainDB.users.update([ '_id', uid ]).set([ 'lvup', 1 ]).on();
				MainDB.users.update([ '_id', uid ]).set(
					[ 'money', postM ],
					[ 'box', $user.box ]
				).on(function($fin){
					res.send({ result: 200, money: postM, box: $user.box });
					JLog.log("[PURCHASED] " + gid + " by " + uid);
				});
				// HIT를 올리는 데에 동시성 문제가 발생한다. 조심하자.
				MainDB.kkutu_shop.update([ '_id', gid ]).set([ 'hit', $item.hit + 1 ]).on();
			});
		});
	}else res.json({ error: 423 });
});
Server.post("/evt/:id", function(req, res){
	if(req.session.profile){
		var uid = req.session.profile.id;
		var gid = req.params.id;
		
		MainDB.kkutu_shop.findOne([ '_id', gid ]).on(function($item){
			if(!$item) return res.json({ error: 400 });
			//if($item.cost < 0 && !req.session.admin) return res.json({ error: 400 });
			/*MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){*/
			MainDB.users.findOne([ '_id', uid ]).on(function($user){
				if(!$user) return res.json({ error: 400 });
				if(!$user.box) $user.box = {};
				if(gid == 'exp_up' && !!$user.lvup) return res.json({ error: 878 });
				var ping;
				try{
					if(!$user.box['CDCoin']) ping = 0;
					else ping = $user.box['CDCoin'];
				}catch(e){
					ping = 0;
				}
				if($item.isEvent == 0) return res.json({ error: 400 });
				var postM = ping - $item.evtCost;
				var ics = $item.evtCost;
				if(postM < 0) return res.send({ result: 400 });
				for(var g=0; g<ics; g++) consume($user, 'CDCoin', 1, true);
				obtain($user, gid, 1, $item.term);
				if(gid == 'exp_up') MainDB.users.update([ '_id', uid ]).set([ 'lvup', 1 ]).on();
				MainDB.users.update([ '_id', uid ]).set(
					[ 'box', $user.box ]
				).on(function($fin){
					res.send({ result: 200, money: $user.money, box: $user.box });
					JLog.log("[PURCHASED_EVENT] " + gid + " by " + uid);
				});
				// HIT를 올리는 데에 동시성 문제가 발생한다. 조심하자.
				MainDB.kkutu_shop.update([ '_id', gid ]).set([ 'hit', $item.hit + 1 ]).on();
			});
		});
	}else res.json({ error: 423 });
});
Server.post("/equip/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isLeft = req.body.isLeft == "true";
	var now = Date.now() * 0.001;
	
	MainDB.users.findOne([ '_id', uid ]).limit([ 'box', true ], [ 'equip', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		if(!$user.equip) $user.equip = {};
		var q = $user.box[gid], r;
		
		MainDB.kkutu_shop.findOne([ '_id', gid ]).limit([ 'group', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			if(!Const.AVAIL_EQUIP.includes($item.group)) return res.json({ error: 400 });
			
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
				if(!q) return res.json({ error: 430 });
				consume($user, gid, 1);
				$user.equip[part] = $item._id;
			}
			MainDB.users.update([ '_id', uid ]).set([ 'box', $user.box ], [ 'equip', $user.equip ]).on(function($res){
				res.send({ result: 200, box: $user.box, equip: $user.equip });
			});
		});
	});
});
Server.post("/equipall/:set", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var set = req.params.set;
	//var isLeft = req.body.isLeft == "true";
	var now = Date.now() * 0.001;
	MainDB.users.findOne([ '_id', uid ]).limit([ 'box', true ], [ 'equip', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		if(!$user.equip) $user.equip = {};
		var q = $user.box, r;
		for(a in set){
			MainDB.kkutu_shop.findOne([ '_id', set[a] ]).limit([ 'group', true ]).on(function($item){
				if(!$item) continue
				if(!Const.AVAIL_EQUIP.includes($item.group)) continue;
				
				//var part = $item.group;
				part = a;
				var qid = $user.equip[part];
				
				if(qid){
					r = $user.box[qid];
					if(r[a] && r[a].expire){
						obtain($user, qid, 1, r[a].expire, true);
					}else{
						obtain($user, qid, 1, now + $item.term, true);
					}
				}
				if(qid == $item._id){
					delete $user.equip[part];
				}else{
					if(!q[a]) continue;
					consume($user, set[a], 1);
					$user.equip[part] = $item._id;
				}
			});
		}
		MainDB.users.update([ '_id', uid ]).set([ 'box', $user.box ], [ 'equip', $user.equip ]).on(function($res){
			res.send({ result: 200, box: $user.box, equip: $user.equip });
		});
	});
});
Server.post("/payback/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isDyn = gid.charAt() == '$';
	
	MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		var q = $user.box[gid];
		JLog.log(`PAYBACK #${uid} [${gid}]`);
		if(!q) return res.json({ error: 430 });
		MainDB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			
			consume($user, gid, 1, true);
			if(isDyn){
				var q = gid.slice(0, 4);
				var k = 0;
				switch(q){
					case '$WPC':
						k = 5;
						break;
					case '$WPB':
						k = 30;
						break;
					case '$WPA':
						k = 50;
						break;
				}
				$user.money = Number($user.money) + k;
			}else{
				$user.money = Number($user.money) + Math.round(0.2 * Number($item.cost));
			}
			MainDB.users.update([ '_id', uid ]).set([ 'money', $user.money ], [ 'box', $user.box ]).on(function($res){
				res.send({ result: 200, box: $user.box, money: $user.money });
			});
		});
	});
});
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
Server.post("/report/:info/:reason/:sebu", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var rpt = req.session.profile.id;
	
	try{
		var jid = decodeURIComponent(req.params.info);
		var rsn = decodeURIComponent(req.params.reason);
		var uld = decodeURIComponent(req.params.sebu);
	}catch(e){
		return res.json({ error: 868 });
	}
	var date = new Date();
	var nowd = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
	var rps = '\r\n\r\n신고자 ID: ' + rpt;
	rsn = "신고 사유: " + rsn;
	tgt = "신고 대상 " + jid;
	lgt = "세부 사항: " + uld;
	/*if(!fs.existsSync('../' + nowd)){
		fs.mkdirSync('../' + nowd);
	}*/
	File.writeFile('../Report/' + nowd + '.txt', tgt + '\r\n' + rsn + '\r\n' + lgt + rps, function(err){
		if(err) JLog.log('Error Occurred During Reporting! ' + err.toString());
	});
	res.send({ result: 200 });
});
Server.post("/cf", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var tray = (req.body.tray || "").split('|');
	var i, o;
	
	if(tray.length < 1 || tray.length > 7) return res.json({ error: 400 });
	MainDB.users.findOne([ '_id', uid ]).limit([ 'money', true ], [ 'box', true ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) $user.box = {};
		var req = {}, word = "", level = 0;
		var cfr, gain = [];
		var blend;
		
		for(i in tray){
			word += tray[i].slice(4);
			level += 68 - tray[i].charCodeAt(3);
			req[tray[i]] = (req[tray[i]] || 0) + 1;
			if(($user.box[tray[i]] || 0) < req[tray[i]]) return res.json({ error: 434 });
		}
		MainDB.kkutu[parseLanguage(word)].findOne([ '_id', word ]).on(function($dic){
			if(!$dic){
				if(word.length == 3){
					blend = true;
				}else return res.json({ error: 404 });
			}
			cfr = getCFRewards(word, level, blend);
			if($user.money < cfr.cost) return res.json({ error: 407 });
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
			MainDB.users.update([ '_id', uid ]).set([ 'money', $user.money ], [ 'box', $user.box ]).on(function($res){
				res.send({ result: 200, box: $user.box, money: $user.money, gain: gain });
			});
		});
	});
	// res.send(getCFRewards(req.params.word, Number(req.query.l || 0)));
});
Server.get("/help", function(req, res){
	page(req, res, "help", {
		'KO_INJEONG': Const.KO_INJEONG
	});
});
Server.get("/enhance/:item", function(req, res){
	var item = req.params.item;
	JLog.log(`[ENHANCE] ITEM: ${item}, IP: ${getIP(req)}`);
	if(!req.session.profile){
		JLog.log(`[ENHANCE] Invalid Request: ${getIP(req)}`);
		return res.send({ error: 400 });
	}else if(!item){
		JLog.log(`[ENHANCE] Invalid Item: ${getIP(req)}`);
		return res.send({ error: 400 });
	}else{
		MainDB.users.findOne([ '_id', req.session.profile.id ]).on(function($enc){
			MainDB.kkutu_shop.findOne([ '_id', item ]).on(function($item){	
				if(!$enc || !$item){
					JLog.log(`[ENHANCE] Invalid user or item: ${getIP(req)}`);
					return res.send({ error: 400 });
				}else if(!$enc.enhance) return res.send({ lv: 0, cost: getCost(0, $item.options) });
				else if(!$enc.enhance[item]) return res.send({ lv: 0, cost: getCost(0, $item.options) });
				else return res.send({ lv: $enc.enhance[item], cost: getCost($enc.enhance[item], $item.options) });
			});
		});
	}
});
Server.get("/dict/:word", function(req, res){
    var word = req.params.word;
    var lang = req.query.lang;
    var DB = MainDB.kkutu[lang];
    
    if(!DB) return res.send({ error: 400 });
    if(!DB.findOne) return res.send({ error: 400 });
	JLog.log(word);
    DB.findOne([ '_id', word ]).on(function($word){
        if(!$word) return res.send({ error: 404 });
        res.send({
            word: $word._id,
            mean: $word.mean,
            theme: $word.theme,
            type: $word.type
        });
    });
});
Server.get("/moremi", function(req, res){
	var account = req.session.profile;
	if(account){
		MainDB.users.findOne([ '_id', account.id ]).on(function($eq){
			try{
				if(!$eq) res.send({ equip: '{}'	});
				else if(!$eq.hasOwnProperty('equip')) res.send({ equip: '{}' });
				else res.send({ equip: JSON.stringify($eq.equip) });
			}catch(e){
				res.send({ equip: '{}' });
			}
		});
	}else res.send({ equip: '{}' });
});
};
function getIP(req){
	try{
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	}catch(e){
		var ip = null;
	}finally{
		return ip;
	}
}
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