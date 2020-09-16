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
 * 로그인을 Passport 로 수행하기 위한 파일 생성
 * 쪼리핑님 요청에 따라 유동적으로 로그인 전략 생성
 */

 
const MainDB	 = require("../db");
const JLog	 = require("../../sub/jjlog");
// const Ajae	 = require("../../sub/ajaejs").checkAjae;
const passport = require('passport');
var GeoIP = require('geoip-country');
const glob = require('glob-promise');
const GLOBAL	 = require("../../sub/global.json");
const config = require('../../sub/auth.json');

function process(req, accessToken, MainDB, $p, done, q) {
    $p.token = accessToken;
    $p.sid = req.session.id;

    let now = Date.now();
    $p.sid = req.session.id;
    req.session.admin = GLOBAL.ADMIN.includes($p.id);
    req.session.authType = $p.authType;
	var newuser = false;
	MainDB.users.findOne(['_id', $p.id ]).on(function($body){
		try{
			if($body.nickname != null && $body.nickname != undefined &&  $body.nickname != ""){
				var wd = ["<", ">", "&", ";", "@", "#", "$", "%", "^", "&", "*", "(", ")", "{", "}", ":", "'", '"', "[", "]", "\\", "|", "/"];
				var lt = wd.length;
				var i;
				for(i=0; i < lt; i++){
					while($body.nickname.indexOf(wd[i])!=-1){
						$body.nickname = $body.nickname.replace(wd[i], "");
					}
				}
			}
			if($body.nickname != null && $body.nickname != undefined && $body.nickname != ""){
				$p.title = $body.nickname;
			}
			var wd = ["<", ">", "&", ";", "@", "#", "$", "%", "^", "&", "*", "(", ")", "{", "}", ":", "'", '"', "[", "]", "\\", "|", "/"];
			var lt = wd.length;
			var i;
			for(i=0; i < lt; i++){
				while($p.title.indexOf(wd[i])!=-1){
					$p.title = $p.title.replace(wd[i], "");
				}
			}
			JLog.log("Login #" + $p.id);
		}catch(e){
			newuser = true;
			JLog.log("New Login User #" + $p.id);
		}
		MainDB.session.upsert([ '_id', req.session.id ]).set({
			'profile': $p,
			'createdAt': now
		}).on();
		if(newuser){
			MainDB.users.update([ '_id', $p.id ]).set([ 'nickname', $p.title ]).on();
			JLog.log("DB added: #" + $p.id);
		}
        req.session.profile = $p;
        MainDB.users.update([ '_id', $p.id ]).set([ 'lastLogin', now ]).on();
		
		if($p.title == "" || $p.title == null || $p.title == undefined) $p.title = "사용자"
		
        done(null, $p, q);
    });
}
function goMain(a, b, c){
    //c.redirect('/');
}
function processIPAuth(req, res){
    var accessIP = req.headers['x-forwarded-for'];
    if(!accessIP) accessIP = '0.0.0.0, 0.0.0.0';
    var now = new Date();
    try{
        accessIP = accessIP.split(',')[0];
    }catch(e){
        accessIP = '0.0.0.0';
    }
    if(!GeoIP.lookup(accessIP) || GeoIP.lookup(accessIP).country != 'KR'){
        res.redirect('/loginfail');
    }else{
        MainDB.iauth.findOne([ '_ip', accessIP ]).on(function($auth){
            if(!!$auth){
                JLog.log('123');
                if(!$auth.title) $auth.title = "사용자";
                var prof = { id: 'pink-' + $auth._id, authType: 'pink', title: $auth.title, name: $auth.title, image: '' };
                process(req, now.getTime() + req.session.id, MainDB, prof, goMain, res);
                res.redirect('/');
            }else{
                var randID = String((Math.random() * 1000000000000000000) + now.getTime());
                MainDB.iauth.findOne([ '_id', randID ]).on(function($dp){
                    if($dp) res.redirect('/loginfail');
                    else{
                        JLog.log('456')
                        MainDB.iauth.insert([ '_ip', accessIP ], [ '_id', randID ], [ 'title',  'User_' + String(randID).substr(0, 6) ]).on(function($res){
                            var prof = { id: 'pink-' + randID, authType: 'pink', title: 'User_' + String(randID).substr(0, 6), name: 'User_' + String(randID).substr(0, 6), image: '' };
                            process(req, now.getTime() + req.session.id, MainDB, prof, goMain, res);
                            res.redirect('/');
                        });
                    }
                });
            }
        });
    }
}
exports.run = (Server, page) => {
    //passport configure
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    const strategyList = {};

    glob(__dirname + '/../auth/auth_*.js')
    .then((items) => {
        for (let i in items) {
            let auth = require(items[i])
            Server.get('/login/' + auth.config.vendor, passport.authenticate(auth.config.vendor))
            Server.get('/login/' + auth.config.vendor + '/callback', passport.authenticate(auth.config.vendor, {
                successRedirect: '/',
                failureRedirect: '/loginfail'
            }))
            passport.use(new auth.config.strategy(auth.strategyConfig, auth.strategy(process, MainDB /*, Ajae */)));
            strategyList[auth.config.vendor] = {
                vendor: auth.config.vendor,
                displayName: auth.config.displayName,
                color: auth.config.color,
                fontColor: auth.config.fontColor
            };
        }
        Server.get('/login/pink', function(req, res){
            processIPAuth(req, res);
        });
        strategyList['pink'] = {
            vendor: 'pink',
            displayName: 'ipauth',
            color: '#f9dbe5',
            fontColor: '#000000'
        };
    })
    .catch((e) => {
        console.error(e)
    })
    .then(() => {
        Server.get("/login", function(req, res){
            if(global.isPublic){
                page(req, res, "login", { '_id': req.session.id, 'text': req.query.desc, 'loginList': strategyList});
            }else{
                let now = Date.now();
                let id = req.query.id || "ADMIN";
                let lp = {
                    id: id,
                    title: "LOCAL #" + id,
                    birth: [ 4, 16, 0 ],
                    _age: { min: 20, max: undefined }
                };
                MainDB.session.upsert([ '_id', req.session.id ]).set([ 'profile', JSON.stringify(lp) ], [ 'createdAt', now ]).on(function($res){
                    MainDB.users.update([ '_id', id ]).set([ 'lastLogin', now ]).on();
                    req.session.admin = true;
                    req.session.profile = lp;
                    res.redirect("/");
                });
            }
        });

        Server.get("/logout", (req, res) => {
            if(!req.session.profile){
                return res.redirect("/");
            } else {
                req.session.destroy();
                res.redirect('/');
            }
        });

        Server.get("/loginfail", (req, res) => {
            page(req, res, "loginfail");
        });
    });  
}