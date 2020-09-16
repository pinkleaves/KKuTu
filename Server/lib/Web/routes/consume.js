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

var MainDB	 = require("../db");
var JLog	 = require("../../sub/jjlog");
var MAX_LEVEL = 1051;
var EXP = [];
function getRequiredScore(lv){
	if(lv <= 0) return 0;
	var asc = 0;
	if(lv > 400) asc += lv * 11;
	if(lv > 450) asc += lv * 13;
	if(lv > 500) asc += lv * 18;
	if(lv > 550) asc += lv * 13;
	if(lv > 600) asc += lv * 11;
	/*if(lv > 650) asc += lv * 20;
	if(lv >= 745) asc += lv * 10;*/
	if(lv == 99) return 435;
	if(lv <= 99) lv = Math.round(lv * 0.6);
	if(lv == 999) return 121377;
	if(lv > 999 && lv < 1010) return 110000;
	if(lv > 1009 && lv < 1020) return 120000;
	if(lv > 1019 && lv < 1030) return 130000;
	if(lv > 1029 && lv < 1040) return 140000;
	if(lv > 1039 && lv < 1049) return 150000;
	if(lv == 1049) return 650000;
	if(lv == 1050) return 3000000;
	var psc = Math.round(
		(!(lv%5)*0.3 + 1) * (!(lv%15)*0.4 + 1) * (!(lv%45)*0.5 + 1) * (
		10 + Math.floor(lv/5)*4 + Math.floor(lv*lv/225)*8 + Math.floor(lv*lv/2025)*9.8
		)
	);
	var finalscore = psc + asc;
	return finalscore;
}
EXP.push(getRequiredScore(1));
for(i=2; i<MAX_LEVEL; i++){
	EXP.push(EXP[i-2] + getRequiredScore(i));
}
EXP[MAX_LEVEL - 1] = Infinity;
EXP.push(Infinity);
exports.run = function(Server, page){

Server.post("/cnsall/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isDyn = gid.charAt() == '$';
	if(gid != 'dictPage') return res.json({ error: 400 });
	MainDB.users.findOne([ '_id', uid ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) return res.json({ error: 400 });
		if(!$user.lastLogin) $user.lastLogin = new Date().getTime();
		var q = $user.box[gid];
		var output;
		
		if(!q) return res.json({ error: 430 });
		
		MainDB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			
			for(var i=0; i<q; i++) consume($user, gid, 1);
			output = useExp($user, $item, gid, q);
			
			MainDB.users.update([ '_id', uid ]).set($user).on(function($res){
				output.result = 200;
				output.box = $user.box;
				output.data = $user.kkutu;
				res.send(output);
			});
		});
	});
});


Server.post("/consume/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isDyn = gid.charAt() == '$';
	
	MainDB.users.findOne([ '_id', uid ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) return res.json({ error: 400 });
		if(!$user.lastLogin) $user.lastLogin = new Date().getTime();
		var q = $user.box[gid];
		var output;
		
		if(!q) return res.json({ error: 430 });
		
		MainDB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			consume($user, gid, 1);
			output = useItem($user, $item, gid);
			MainDB.users.update([ '_id', uid ]).set($user).on(function($res){
				output.result = 200;
				output.box = $user.box;
				output.data = $user.kkutu;
				output.mny = $user.money;
				res.send(output);
			});
		});
	});
});

Server.post("/consumeall/:id", function(req, res){
	if(!req.session.profile) return res.json({ error: 400 });
	var uid = req.session.profile.id;
	var gid = req.params.id;
	var isDyn = gid.charAt() == '$';
	
	MainDB.users.findOne([ '_id', uid ]).on(function($user){
		if(!$user) return res.json({ error: 400 });
		if(!$user.box) return res.json({ error: 400 });
		if(!$user.lastLogin) $user.lastLogin = new Date().getTime();
		var q = $user.box[gid];
		var output;
		
		if(!q) return res.json({ error: 430 });
		
		MainDB.kkutu_shop.findOne([ '_id', isDyn ? gid.slice(0, 4) : gid ]).limit([ 'cost', true ]).on(function($item){
			if(!$item) return res.json({ error: 430 });
			consume($user, gid, 1);
			output = useItem($user, $item, gid);
			MainDB.users.update([ '_id', uid ]).set($user).on(function($res){
				output.result = 200;
				output.box = $user.box;
				output.data = $user.kkutu;
				res.send(output);
			});
		});
	});
});

};
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
				zzs = Math.round(Math.sqrt(1 + 2 * (epp || 0)));
				prexp = Math.round(zzs * 0.55);
				prexp += 10;
				epp += prexp;
				R.exp += prexp;
			}
			$user.kkutu.score += R.exp;
			break;
		/*case 'exp_n':
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
			if($user.kkutu.score < 61806){
				R.exp = 61806 - $user.kkutu.score;
				$user.kkutu.score += R.exp;
			}else{
				R.exp = 0;
				$user.kkutu.score += 0;
			}
			break;*/
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
	var i, l = EXP.length;
	
	for(i=0; i<l; i++) if(score < EXP[i]) break;
	return i+1;
}
function getLvup(exp){
	var lev = getLevel(exp);
	var defs = 500000;
	if(lev >= 1051) return defs;
	else{
		var prev = EXP[lev-2] || 0;
		var goal = EXP[lev-1];
		return Number((goal - prev) - (exp - prev));
	}
}
function useItem($user, $item, gid){
	var R = { gain: [] };
	
	switch($item._id){
		case 'exp_up':
			var sq = getLvup($user.kkutu.score);
			R.exp = sq;
			$user.kkutu.score += R.exp;
			break;
		case 'exp_down':
			var sq = getLevel($user.kkutu.score);
			var eq = Number(sq) - 1;
			if(eq <= 0) var sk = 0;
			else var sk = getRequiredScore(eq);
			var ula = getRequiredScore - Number($user.kkutu.score);
			R.exp = ula;
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
			R.exp = Math.round(Math.sqrt(1 + 2 * ($user.kkutu.score || 0)));
			prexp = R.exp * 0.55;
			prexp += 10;
			R.exp = Math.round(prexp);
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
			if($user.kkutu.score < 48907){
				R.exp = 48907 - $user.kkutu.score;
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
function consume($user, key, value){
    var bd = $user.box[key];
    
    if(bd.value){
        // 기한이 끝날 때까지 box 자체에서 사라지지는 않는다. 기한 만료 여부 확인 시점: 1. 로그인 2. box 조회 3. 게임 결과 반영 직전 4. 해당 항목 사용 직전
        if((bd.value -= value) <= 0 && !bd.expire) delete $user.box[key];
    }else{
        if(($user.box[key] -= value) <= 0) delete $user.box[key];
    }
}
function obtain($user, key, value, term, addValue){
    var now = Math.round(Date.now() * 0.001);
    
    if(term){
        if($user.box[key]){
            if(addValue) $user.box[key].value += value;
            else $user.box[key].expire += term;
        }else $user.box[key] = { value: value, expire: addValue ? term : (now + term) };
    }else{
        $user.box[key] = ($user.box[key] || 0) + value;
    }
}