/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License *as published by
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
var $stage;
var myst = true;
var audioList = {};
var spamWarning = 0;
var spamCount = 0;
var move = false;
var max_g = [ 815, 1630, 3260, 8150 ];
var now_l = 1;
var typing = {};
var slow = 0;
var rslow = { i: 0, t: 0 };
var noPF = false;
var noFunc = function(){};
var onnick = false;
var blockGauge = true;
var prev_level = false;
var didCaptcha = false;
var cdn = "https://cdn.jsdelivr.net/gh/pink-flower/pink-kkutu@latest";
var en_info = { item: '', ping: 0, per: 0 };
//const per = [100, 70, 60, 30, 20, 10, 10, 8.25, 7.75, 5, 0];
var per = [100, 90, 70, 60, 45, 25, 10, 8.5, 7.5, 5, 0];
const lis = [120, 125, 150, 190, 220, 260, 300, 340, 400, 500, 500];
const ex_pri = [2083, 2087, 2096, 8443];
/*setInterval(function(){
	try{
		send('live');
	}catch(e){
		noFunc();
	}
}, 2000);*/
function isSlow(){
	return slow;
}
function setStage(data){
	$stage = data;
}
function roomPadding(num, len){
	try{
		var s = num.toString();
		return "000000000000000".slice(0, Math.max(0, len - s.length)) + s;
	}catch(e){
		return num;
	}
}
function zeroPadding(num, len){
	try{
		var s = num.toString();
		return "000000000000000".slice(0, Math.max(0, len - s.length)) + s;
	}catch(e){
		return num;
	}
}
function send(type, data, toMaster){
	var i, r = { type: type };
	var subj = toMaster ? ws : (rws || ws);
	
	for(i in data) r[i] = data[i];
	
	/*if($data._talkValue == r.value && !$data.place){
		if(++$data._sameTalk >= 4 && spamCount++ > 1.3) return notice('같은 말을 빠르게 입력하는 것은 타 사용자에게 피해를 줄 수 있습니다.');
	}else $data._sameTalk = 0;
	$data._talkValue = r.value;*/
	if(type == "talk"){
		if($data.users[$data.id].nickname == "") return ws.close();
	}
	/*if(type == "talk") if(spamCount++ > 10){
		if(++spamWarning >= 3) return notice('채팅을 천천히 해 주세요.');
		else spamCount = 5;
	}*/
	subj.send(JSON.stringify(r));
}
function loading(text){
	if(text){
		if($("#Intro").is(':visible')){
			$stage.loading.hide();
			$("#intro-text").html(text);
		}else $stage.loading.show().html(text);
	}else $stage.loading.hide();
}
function showDialog($d, noToggle){
	var size = [ $(window).width(), $(window).height() ];
	
	if(!noToggle && $d.is(":visible")){
		$d.hide();
		return false;
	}else{
		$(".dialog-front").removeClass("dialog-front");
		$d.show().addClass("dialog-front").css({
			'left': (size[0] - $d.width()) * 0.5,
			'top': (size[1] - $d.height()) * 0.5
		});
		return true;
	}
}
function movingServer(){
	move = true;
}
function getBGMno(ot){
	var s;
	switch(ot){
		case 'og':
			s = 0;
			break;
		case '1st':
			s = 1;
			break;
		case '2nd':
			s = 2;
			break;
		default:
			s = 0;
			break;
	}
	return s;
}
function do_enhance(gid){
	$stage.dialog.enhance.hide();
	$.post('/enhance/' + gid, function(res){
		updateMe();
		if(res.error) return fail(res.error);
		if(res.fail){
			playSound('fail');
			$data.users[$data.id].money = res.money;
			updateMe();
			return pfAlert(L["enhance_" + res.fail]);
		}else{
			if(res.result && res.result == 200){
				$data.users[$data.id].money = res.money;
				playSound('success');
				$data.users[$data.id].enhance = res.data;
				drawMyDress();
				updateMe();
				return pfAlert('강화 성공!!');
			}
		}
	});
}
function applyOptions(opt, onlyOpt){
	var vol = $.cookie('vol');
	if(!vol) vol = { bgm: 100, eff: 100 };
	else vol = JSON.parse(vol);
	//console.log(opt);
	var pre = $data.muteBGM;
	var prf = $data.muteEff;
	//if(!opt.bg) opt.bg = 'og';
	var srt = { lv: $data.opts.su, tm: $data.opts.rv, bg: $data.opts.bg, mb: $data.opts.mb }
	$data.opts = !onlyOpt ? opt : $data.opts;
	$data.muteBGM = $data.opts.mb;
	$data.muteEff = $data.opts.me;
	for(i in onlyOpt){
		$data.opts[i] = onlyOpt[i];
	}
	
	$("#mute-bgm").attr('checked', $data.muteBGM);
	//$("#mute-bgm").val($data.muteBGM);
	$("#mute-effect").attr('checked', $data.muteEff);
	//$("#mute-effect").val($data.muteEff);
	$("#deny-invite").attr('checked', $data.opts.di);
	$("#deny-whisper").attr('checked', $data.opts.dw);
	$("#deny-friend").attr('checked', $data.opts.df);
	$("#auto-ready").attr('checked', $data.opts.ar);
	$("#sort-user").attr('checked', $data.opts.su);
	$("#only-waiting").attr('checked', $data.opts.ow);
	$("#only-unlock").attr('checked', $data.opts.ou);
	$("#manlep-exp").attr('checked', $data.opts.ml);
	$("#req-exp").attr('checked', $data.opts.rq);
	$("#jang-moon").attr('checked', $data.opts.jm);
	$("#mis-sion").attr('checked', $data.opts.ms);
	//$("#yok-seol").attr('checked', $data.opts.bw);
	$("#deny-mention").attr('checked', $data.opts.mc);
	$("#dizzy-off").attr('checked', $data.opts.dz);
	$("#pink-bgm").val($data.opts.bg).attr('selected', 'selected');
	$("#pink-theme").val($data.opts.th).attr('selected', 'selected');
	$("#sort-nick").attr('checked', $data.opts.nu);
	$("#deny-keyword").attr('checked', $data.opts.kw);
	$("#ka-word").attr('checked', $data.opts.wd);
	$("#ka-icld").attr('checked', !$data.opts.wd);
	$("#dt-gs").attr('checked', $data.opts.dt);
	$("#dt-wb").attr('checked', !$data.opts.dt);
	$("#pic-preload").attr('checked', $data.opts.pl);
	$("#pink-speed").val(Number($data.opts.bs));
	
	if($data.opts.th == 'dark'){
		$(".Product").css({ 'background-color': '#363636' });
		$(".Product").css({ 'color': '#F0F0F0' });
		$(".product-title").css({ 'background-color': '#303030' });
		$("#ct.product-title").css({ 'color': '#F0F0F0' });
		$("#ct.product-title").css({ 'background-color': '#303030' });
		$(".product-title").css({ 'color': '#F0F0F0' });
		$("#ct.product-title").css({ 'border-bottom-color': '#363636' });
		$(".product-title").css({ 'border-bottom-color': '#363636' });
		$(".room-user").css({ 'box-shadow': '0px 1px 1px #363636', 'background-color': '#303030' });
		$("#Talk").css({ 'border-color': '#303030', 'background-color': '#363636', 'color': '#F0F0F0' });
		$(".dialog").css({ 'background-color': '#363636', 'color': '#F0F0F0' });
		$(".dialog-head").css({ 'background-color': '#303030', 'color': '#F0F0F0', 'border-bottom-color': '#363636' });
	}else{
		$(".Product").css({ 'background-color': '#EEEEEE' });
		$(".Product").css({ 'color': '#111111' });
		$("#ct.product-title").css({ 'color': '#222222' });
		$(".product-title").css({ 'color': '#222222' });
		$("#ct.product-title").css({ 'background-color': '#DDDDDD' });
		$(".product-title").css({ 'background-color': '#DDDDDD' });
		$("#ct.product-title").css({ 'border-bottom-color': '#CCCCCC' });
		$(".product-title").css({ 'border-bottom-color': '#CCCCCC' });
		$(".room-user").css({ 'box-shadow': '0px 1px 1px #777777', 'background-color': '#E4E4E4' });
		$("#Talk").css({ 'border-color': '#AAA', 'background-color': '#FFFFFF', 'color': '#000000' });
		$(".dialog").css({ 'background-color': '#EEEEEE', 'color': '#111111', 'border-bottom-color': '#DDDDDD' });
		$(".dialog-head").css({ 'background-color': '#DDDDDD', 'color': '#111111', 'border-bottom-color': '#DDDDDD' });
	}
	$(".room-user").removeClass('light-hover');
	$(".room-user").removeClass('dark-hover');
	$(".room-user").addClass($data.opts.th + '-hover');
	var tesq = vol;
	$("#bgm-v").val(Number(tesq.bgm));
	$("#eff-v").val(Number(tesq.eff));
	if($data.bgm){
		if($data.muteBGM){
			try{$data.bgm.playbackRate.value = Number($data.opts.bs) || 1;}catch(e){};
			$data.bgm.stop();
		}else{
			if(srt.bg != $data.opts.bg || srt.mb != $data.opts.mb) $data.bgm = playBGM($data.opts.bg, true);
			try{$data.bgm.playbackRate.value = Number($data.opts.bs) || 1;}catch(e){};
		}
		//$data.bgm.gain.value = $data.BGMV ? $data.BGMV : 1;
	}
	if(srt.lv != $data.opts.su) updateUserList(true);
	//if(srt.tm != $data.opts.rv) updateRoomList(true);
	if($data.bgm) try{$data.bgm.playbackRate.value = Number($data.opts.bs) || 1;}catch(e){};
	updateRoomList(true);
	/*if(pre > 1 && $data.muteBGM <= 1) $data.bgm.stop();
	if(pre <= 1 && $data.muteBGM > 1){
		$data.bgm.volume = ($data.muteBGM / 100);
		$data.bgm = playBGM($data.bgm.key, true);
	}*/
	if(localStorage == undefined) sCK('kks', encodeURIComponent(JSON.stringify($data.opts)), 7);
	else localStorage.setItem('kks', JSON.stringify($data.opts));
	updateMe();
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
function pfJeje(rs, du){
	noPF = true;
	$("#Jejed").animate({ 'opacity': 0 }, 1);
	$("#Jejed").show();
	$("#Jejed").animate({ 'opacity': 1 }, 1000);
	if(du == 'F') var da = '무기한';
	else{
		du = new Date(Number(du));
		var mss = du.getMonth() + 1;
		var da = du.getFullYear() + '년 ' + mss + '월 ' + du.getDate() + '일 ';
		da += fullt(du) + ' 까지';
	}
	var dp = '<b>운영정책 위반으로 제재되었습니다.</b><br><br>제재 사유: ' + rs + '<br>제재 기간: ' + da;
	$("#pjeje-content").html(dp);
	showDialog($stage.dialog.pJeje, true);
	$stage.dialog.pAlertOK.trigger('click');
}
function pfAlert(ams){
	ams = ams.replace(/\n/g, '<br>');
	$("#palert-content").html(ams);
	showDialog($stage.dialog.pAlert, true);
	//if($('#pjeje-content').is(':visible')) $stage.dialog.pAlert.hide();
}
function peAlert(s){
	s = s.replace(/\n/g, '<br>');
	$("#pevent-content").html(s);
	showDialog($stage.dialog.pEvent, true);
}
var pfConfirm;
var preConfirm;
preConfirm = function(msg, ifConfirm){
	if(!ifConfirm) return;
	$("#pconfirm-content").html(msg);
	showDialog($stage.dialog.pConfirm);

	$stage.dialog.pYes.click(function(){
		$stage.dialog.pConfirm.hide();
		ifConfirm();
		pfConfirm = function(msg){};
	});
	$stage.dialog.pNo.click(function(){
		$stage.dialog.pConfirm.hide();
		pfConfirm = function(msg){};
	});
}
var fnc = function(){};
var jnc = function(){};
function pfConfirm(msg, ifConfirm, ifNot){
	if(!ifConfirm) return;
	$("#pconfirm-content").html(msg);
	if($stage.dialog.pConfirm.is(":visible")) $stage.dialog.pNo.trigger('click');
	showDialog($stage.dialog.pConfirm, true);
	fnc = ifConfirm;
	if(!ifNot) jnc = function(){};
	else jnc = ifNot;
}
var ync = function(){};
var nnc = function(){};
function sPI(nor, pas){
	if(nor) $('#pinput-in').show();
	if(!nor) $('#pinput-in').hide();
	if(pas) $('#pinput-pass').show();
	if(!pas) $('#pinput-pass').hide();
}
var lnc = function(){};
var rnc = function(){};
function pfHand(msg, left, right){
	$('#phand-content').html(msg);
	if($stage.dialog.pHand.is(":visible")){
		$stage.dialog.pHand.hide();
		phReset();
	}
	lnc = left;
	rnc = right;
	showDialog($stage.dialog.pHand, true);
}
function setDef(txt, pas){
	$('#pinput-in').val(txt);
}
function pfInput(msg, ifConfirm, ifNot, pass, deftext){
	/*if(!noCancel) $('#pinput-no').show();
	else $('#pinput-no').hide();*/
	if(!ifConfirm) return;
	$("#pinput-content").html(msg);
	if(!pass) sPI(true, false);
	else sPI(false, true);
	$("#pinput-in").val('');
	$("#pinput-pass").val('');
	if(!!deftext) $('#pinput-in').val(deftext);
	if($stage.dialog.pInput.is(":visible")) $stage.dialog.piNo.trigger('click');
	showDialog($stage.dialog.pInput, true);
	ync = ifConfirm;
	if(!ifNot) nnc = function(){};
	else nnc = ifNot;
}
var inc = function(){};
var knc = function(){};
function pnInput(msg, ifConfirm, ifNot){
	if(!ifConfirm) return;
	$("#ninput-content").html(msg);
	$("#ninput-in").val('');
	if($stage.dialog.nInput.is(":visible")) $stage.dialog.niNo.trigger('click');
	showDialog($stage.dialog.nInput, true);
	inc = ifConfirm;
	if(!ifNot) knc = function(){};
	else knc = ifNot;
}
function piReset(){
	ync = function(){};
	nnc = function(){};
}
function pcReset(){
	fnc = function(){};
	jnc = function(){};
}
function phReset(){
	rnc = function(){};
	lnc = function(){};	
}
function niReset(){
	inc = function(){};
	knc = function(){};
}
//pfConfirm('테스트', console.log('Success'));
function checkInput(){
	/*var v = $stage.talk.val();
	var len = v.length;
	
	if($data.room) if($data.room.gaming){
		if(len - $data._kd.length > 3) $stage.talk.val($data._kd);
		if($stage.talk.is(':focus')){
			$data._kd = v;
		}else{
			$stage.talk.val($data._kd);
		}
	}
	$data._kd = v;*/
}
function addInterval(cb, v, a1, a2, a3, a4, a5){
	var R = _setInterval(cb, v, a1, a2, a3, a4, a5);
	
	$data._timers.push(R);
	return R;
}
function addTimeout(cb, v, a1, a2, a3, a4, a5){
	var R = _setTimeout(cb, v, a1, a2, a3, a4, a5);
	
	$data._timers.push(R);
	return R;
}
function clearTrespasses(){ return; // 일단 비활성화
	var jt = [];
	var xStart = $data._xintv || 0;
	var xEnd = _setTimeout(checkInput, 1);
	var rem = 0;
	var i;
	
	for(i in $.timers){
		jt.push($.timers[i].id);
	}
	function censor(id){
		if(jt.indexOf(id) == -1 && $data._timers.indexOf(id) == -1){
			rem++;
			clearInterval(id);
		}
	}
	for(i=0; i<53; i++){
		censor(i);
	}
	for(i=xStart; i<xEnd; i++){
		censor(i);
	}
	$data._xintv = xEnd;
}
function route(func, a0, a1, a2, a3, a4){
	if(!$data.room) return;
	var r = RULE[MODE[$data.room.mode]];
	
	if(!r) return null;
	$lib[r.rule][func].call(this, a0, a1, a2, a3, a4);
}
function connectToRoom(chan, rid){
	var url = $data.URL.replace(/\/g([0-9]{4})\//, function(v, p1) {
		return "/g" + (Number(p1) + 416 + Number(chan) - 1) + "/";
	}) + "&" + chan + "&" + rid;
	/*var url = $data.URL.replace(/:(\d+)/, function(v, p1){
		return ":" + (ex_pri[chan - 1]);
	}) + "&" + chan + "&" + rid;*/
	
	if(rws) return;
	rws = new _WebSocket(url);
	
	loading(L['connectToRoom'] + "\n<center><button id='ctr-close'>" + L['ctrCancel'] + "</button></center>");
	$("#ctr-close").on('click', function(){
		loading();
		if(rws) rws.close();
	});
	rws.onopen = function(e){
		console.log("room-conn", chan, rid);
		setTimeout(eNotice, 200);
	};
	rws.onmessage = _onMessage;
	rws.onclose = function(e){
		console.log("room-disc", chan, rid);
		rws = undefined;
	};
	rws.onerror = function(e){
		console.warn(L['error'], e);
	};
}
var eNotice = function(){
	if(rws) notice($data.users[$data.id].nickname + L['hasJoined']);
}
function checkAge(){
	if(!confirm(L['checkAgeAsk'])) return send('caj', { answer: "no" }, true);
	
	while(true){
		var input = [], lv = 1;
		
		while(lv <= 3){
			var str = prompt(L['checkAgeInput' + lv]);
			
			if(!str || isNaN(str = Number(str))){
				if(--lv < 1) break; else continue;
			}
			if(lv == 1 && (str < 1000 || str > 2999)){
				alert(str + "\n" + L['checkAgeNo']);
				continue;
			}
			if(lv == 2 && (str < 1 || str > 12)){
				alert(str + "\n" + L['checkAgeNo']);
				continue;
			}
			if(lv == 3 && (str < 1 || str > 31)){
				alert(str + "\n" + L['checkAgeNo']);
				continue;
			}
			input[lv++ - 1] = str;
		}
		if(lv == 4){
			if(confirm(L['checkAgeSure'] + "\n"
			+ input[0] + L['YEAR'] + " "
			+ input[1] + L['MONTH'] + " "
			+ input[2] + L['DATE'])) return send('caj', { answer: "yes", input: [ input[1], input[2], input[0] ] }, true);
		}else{
			if(confirm(L['checkAgeCancel'])) return send('caj', { answer: "no" }, true);
		}
	}
}
function onMessage(data){
	var i;
	var $target;

    switch (data.type) {
        case 'recaptcha':
			didCaptcha = true;
			if(!$data.BGM) $data.BGM = playBGM($data.opts.bg, true);
			//var $introText = $("#intro-text");
			//if(!$introText.is(":visible")){
			welcome();
			updateUI(undefined, true);
			$("#Jejed").animate({ 'opacity': 0 }, 1);
			$("#Jejed").show();
			$("#Jejed").animate({ 'opacity': 1 }, 500);
			showDialog($("#pCaptchaDiag"));
			$("#captcha-box").html('게스트는 캡챠 인증이 필요합니다.' + '<br/>로그인을 하시면 캡챠 인증을 건너뛰실 수 있습니다.' + '<br/><br/>');
			$("#captcha-box").append($('<div class="g-recaptcha" id="recaptcha" style="display: table; margin: 0 auto;"></div>'));
			/*}else{
				$introText.empty();
				$introText.html('게스트는 캡챠 인증이 필요합니다.' +
					'<br/>로그인을 하시면 캡챠 인증을 건너뛰실 수 있습니다.' +
					'<br/><br/>');
				$introText.append($('<div class="g-recaptcha" id="recaptcha" style="display: table; margin: 0 auto;"></div>'));
			}*/

            grecaptcha.render('recaptcha', {
                'sitekey': data.siteKey,
                'callback': recaptchaCallback
            });
            break;
		case 'welcome':
			$data.id = data.id;
			$data.guest = data.guest;
			$data.admin = data.admin;
			$data.users = data.users;
			$data.robots = {};
			$data.rooms = data.rooms;
			$data.place = 0;
			$data.friends = data.friends;
			$data._friends = {};
			$data._playTime = data.playTime;
			$data._okg = data.okg;
			$data._gaming = false;
			$data.box = data.box;
			//var my = $data.users[$data.id];
			$("#pCaptchaDiag").hide();
			if(didCaptcha){
				$("#Jejed").animate({ 'opacity': 0 }, 500);
				_setTimeout(function(){ $("#Jejed").hide(); }, 500);
			}
			if(data.test) pfAlert(L['welcomeTestServer']);
			if(location.hash[1]) tryJoin(location.hash.slice(1));
			updateUI(undefined, true);
			var kaq = Math.floor(Math.random() * 4) + 1;
			if(svAvail) notice(L['tip_' + kaq], '[TIP]');
			welcome();
			if(data.caj) checkAge();
			updateCommunity();
			document.onkeydown = function(e) {
				if($stage.talk.val().substr(0, 1) != "/" && $stage.talk.val() != "" && $stage.talk.is(":focus")) send('kdn');
			};
			break;
		case 'conn':
			$data.setUser(data.user.id, data.user);
			updateUserList();
			break;
		case 'disconn':
			$data.setUser(data.id, null);
			updateUserList();
			break;
		case 'connRoom':
			if($data._preQuick){
				playSound('success');
				$stage.dialog.quick.hide();
				delete $data._preQuick;
			}
			$stage.dialog.quick.hide();
			$data.setUser(data.user.id, data.user);
			$target = $data.usersR[data.user.id] = data.user;
			
			if($target.id == $data.id){
				loading();
			} else {
				try{
					var nicknm = $data.users[$target.profile.id].nickname;
					notice(nicknm + L['hasJoined']);
				}catch(e){
					notice("#" + $target.profile.id + L['hasJoined']);
				}
			}
			updateUserList();
			break;
		case 'disconnRoom':
			$target = $data.usersR[data.id];
			
			if($target){
				delete $data.usersR[data.id];
				try{
					var nicknm = $data.users[$target.profile.id].nickname;
					notice(nicknm + L['hasLeft']);
				}catch(e){
					notice("#" + $target.profile.id + L['hasLeft']);
				}
				updateUserList();
			}
			break;
		case 'yell':
			yell(data.value);
			notice(data.value, L['yell']);
			break;
		case 'palert':
			pfAlert(data.value);
			break;
		case 'notice':
			notice(data.value);
			break;
		case 'dying':
			yell(L['dying']);
			notice(L['dying'], L['yell']);
			break;
		case 'tail':
			notice(data.a + "|" + data.rid + "@" + data.id + ": " + ((data.msg instanceof String) ? data.msg : JSON.stringify(data.msg)).replace(/</g, "&lt;").replace(/>/g, "&gt;"), "tail");
			break;
		case 'chat':
			if(data.notice){
				notice(L['error_' + data.code]);
			}else{
				chat(data.profile || { title: L['robot'] }, data.value, data.from, data.timestamp, data.rainbow);
			}
			break;
		case 'drawCanvas':
			if ($stage.game.canvas) {
				drawCanvas(data);
			}
			break;
		case 'roomStuck':
			rws.close();
			break;
		case 'preRoom':
			connectToRoom(data.channel, data.id);
			break;
		case 'room':
			processRoom(data);
			checkRoom(data.modify && data.myRoom);
			updateUI(data.myRoom);
			if(data.modify && $data.room && data.myRoom){
				if($data._rTitle != $data.room.title) animModified('.room-head-title');
				if($data._rMode != getOptions($data.room.mode, $data.room.opts, true)) animModified('.room-head-mode');
				if($data._rLimit != $data.room.limit) animModified('.room-head-limit');
				if($data._rRound != $data.room.round) animModified('.room-head-round');
				if($data._rTime != $data.room.time) animModified('.room-head-time');
			}
			break;
		case 'user':
			$data.setUser(data.id, data);
			if($data.room) updateUI($data.room.id == data.place);
			break;
		case 'friends':
			$data._friends = {};
			for(i in data.list){
				data.list[i].forEach(function(v){
					$data._friends[v] = { server: i };
				});
			}
			updateCommunity();
			break;
		case 'friend':
			$data._friends[data.id] = { server: (data.stat == "on") ? data.s : false };
			if($data._friends[data.id] && $data.friends[data.id])
				notice(((data.stat == "on") ? ("&lt;<b>" + L['server_' + $data._friends[data.id].server] + "</b>&gt; ") : "")
				+ L['friend'] + " " + $data.friends[data.id] + L['fstat_' + data.stat]);
			updateCommunity();
			break;
		case 'friendAdd':
			$target = $data.users[data.from].profile;
			i = ($target.title || $target.name) + "(#" + data.from.substr(0, 5) + ")";
			/*if(mobile){
				send('friendAddRes', {
					from: data.from,
					res: $data.opts.df ? false : confirm(i + L['attemptFriendAdd'])
				}, true);
				return;
			}*/
			if($data.opts.df) send('friendAddRes', { from: data.from, res: false }, true);
			else pfConfirm(i + L['attemptFriendAdd'], function(){ send('friendAddRes', { from: data.from, res: true }, true ); }, function(){ send('friendAddRes', { from: data.from, res: false }, true); });
			break;
		case 'getping':
			$target = $data.users[data.from].profile;
			i = ($target.title || $target.name) + "(#" + data.from.substr(0, 5) + ")";
			send('getpingRes', {
				from: data.from,
				res: true
			}, true);
			break;
		/*case 'getpingRes':
			$target = $data.users[data.target].profile;
			i = ($target.title || $target.name) + "(#" + data.target.substr(0, 5) + ")";
			notice(i + L['friendAddRes_' + (data.res ? 'ok' : 'no')]);
			$data.
			if(data.res){
				$data.friends[data.target] = $target.title || $target.name;
				$data._friends[data.target] = { server: $data.server };
				updateCommunity();
			}
			break;
			*/
		case 'friendAddRes':
			$target = $data.users[data.target].profile;
			i = ($target.title || $target.name) + "(#" + data.target.substr(0, 5) + ")";
			notice(i + L['friendAddRes_' + (data.res ? 'ok' : 'no')]);
			if(data.res){
				$data.friends[data.target] = $target.title || $target.name;
				$data._friends[data.target] = { server: $data.server };
				updateCommunity();
			}
			break;
		case 'friendEdit':
			$data.friends = data.friends;
			updateCommunity();
			break;
		case 'starting':
			prev_level = getLevel($data.users[$data.id].data.score);
			loading(L['gameLoading']);
			break;
		case 'roundReady':
			route("roundReady", data);
			break;
		case 'turnStart':
			route("turnStart", data);
			break;
		case 'turnError':
			turnError(data.code, data.value);
			break;
		case 'turnHint':
			route("turnHint", data);
			break;
		case 'turnEnd':
			data.score = Number(data.score);
			data.bonus = Number(data.bonus);
			if($data.room){
				$data._tid = data.target || $data.room.game.seq[$data.room.game.turn];
				if($data._tid){
					if($data._tid.robot) $data._tid = $data._tid.id;
					turnEnd($data._tid, data);
				}
				if(data.baby){
					playSound('success');
				}
			}
			break;
		case 'roundEnd':
			for(i in data.users){
				$data.setUser(i, data.users[i]);
			}
			/*if($data.guest){
				$stage.menu.exit.trigger('click');
				alert(L['guestExit']);
			}*/
			$data._resultRank = data.ranks;
			roundEnd(data.result, data.data);
			break;
		case 'kickVote':
			if($data.id != data.target && $data.id != $data.room.master){
				kickVoting(data.target);
			}
			//notice(($data._kickTarget.profile.title || $data._kickTarget.profile.name) + L['kickVoting']);
			break;
		case 'kickDeny':
			notice(getKickText($data._kickTarget.profile, data));
			break;
		case 'invited':
			/*if(mobile){
				send('inviteRes', {
					from: data.from,
					res: $data.opts.di ? false : confirm(data.from + L['invited'])
				});
				return;
			}*/
			if($data.opts.di) send('inviteRes', { from: data.from, res: false });
			else pfConfirm(getNick(data.by) + '님이 ' + data.from + L['invited'], function(){send('inviteRes', { from: data.from, res: true }); }, function(){send('inviteRes', { from: data.from, res: false }); });
			break;
		case 'inviteNo':
			$target = $data.users[data.target];
			var nicknm = $data.users[$target.profile.id].nickname;
			notice(nicknm + L['inviteDenied']);
			break;
		case 'okg':
			if($data._playTime > data.time){
				notice(L['okgExpired']);
			}else if($data._okg != data.count) notice(L['okgNotice'] + " (" + L['okgCurrent'] + data.count +")");
			$data._playTime = data.time;
			$data._okg = data.count;
			break;
		case 'obtain':
			queueObtain(data);
			// notice(L['obtained'] + ": " + iName(data.key) + " x" + data.q);
			break;
		case 'pretain':
			notice('접속 보상으로 ' + iName(data.key) + ' 아이템이 ' + data.q + '개 지급되었습니다');
			break;
		case 'expired':
			for(i in data.list){
				notice(iName(data.list[i]) + L['hasExpired']);
			}
			break;
		case 'blocked':
			notice(L['blocked']);
			break;
		case 'test':
			if($data._test = !$data._test){
				$data._testt = addInterval(function(){
					if($stage.talk.val() != $data._ttv){
						send('test', { ev: "c", v: $stage.talk.val() }, true);
						$data._ttv = $stage.talk.val();
					}
				}, 100);
				document.onkeydown = function(e){
					send('test', { ev: "d", c: e.keyCode }, true);
					if($stage.talk.val() != "" && $data._ttv != $stage.talk.val()) send('kdn');
				};
				document.onkeyup = function(e){
					send('test', { ev: "u", c: e.keyCode }, true);
				};
			}else{
				clearInterval($data._testt);
				document.onkeydown = undefined;
				document.onkeyup = undefined;
				document.onkeydown = function(e){
					if($stage.talk.val().substr(0, 2) != "/" && $stage.talk.val() != "" && $data._ttv != $stage.talk.val()) send('kdn');
				};
			}
			break;
		case 'error':
			i = data.message || "";
			if(data.code == 401){
				/* 로그인
				$.cookie('preprev', location.href);
				location.href = "/login?desc=login_kkutu"; */
			}else if(data.code == 403){
				loading();
			}else if(data.code == 406){
				if($stage.dialog.quick.is(':visible')){
					$data._preQuick = false;
					break;
				}
			}else if(data.code == 409){
				i = L['server_' + i];
			}else if(data.code == 416){
				// 게임 중
				/*if(mobile){
					if(confirm(L['error_'+data.code])){
						stopBGM();
						$data._spectate = true;
						$data._gaming = true;
						send('enter', { id: data.target, password: $data._pw, spectate: true }, true);
					}
					return;
				}*/
				var Ld = L['error_416'];
				Ld = Ld.replace(/\n/g, '<br>');
				pfConfirm(Ld, function(){ 
					stopBGM();
					$data._spectate = true;
					$data._gaming = true;
					send('enter', { id: data.target, password: $data._pw, spectate: true }, true);
				});
				return;
			}else if(data.code == 413){
				$stage.dialog.room.hide();
				$stage.menu.setRoom.trigger('click');
			}else if(data.code == 429){
				$data.bgm = playBGM($data.opts.bg);
			}else if(data.code == 430){
				$data.setRoom(data.message, null);
				if($stage.dialog.quick.is(':visible')){
					$data._preQuick = false;
					break;
				}
			}else if(data.code == 431 || data.code == 432 || data.code == 433){
				$stage.dialog.room.show();
			}else if(data.code == 444){
				i = data.message;
				if(i.indexOf("생년월일") != -1){
					alert("생년월일이 올바르게 입력되지 않아 게임 이용이 제한되었습니다. 잠시 후 다시 시도해 주세요.");
					break;
				}
			} else if (data.code === 447) {
				alert("자동화 봇 방지를 위한 캡챠 인증에 실패했습니다. 메인 화면에서 다시 시도해 주세요.");
				break;
			}
			var dita = L['error_'+data.code];
			dita = dita.replace(/\n/g, '<br>');
			//if(!mobile) 
			pfAlert("[#" + data.code + "] " + dita + i);
			//else alert("[#" + data.code + "] " + L['error_'+data.code] + i);
			break;
		case 'slow':
			slow = data.q;
			try{
				var dd = $data.users[$data.id].place;
			}catch(e){
				var dd = false;
			}
			$('#ct.product-title').html(data.q >= 0.01 && !dd ? '<i class="fa fa-comment"></i>채팅  |  <i class="fa fa-clock-o"></i>슬로우 모드 적용 중 / ' + String(data.q) + '초' : '<i class="fa fa-comment"></i>채팅');
			break;
		case 'roomslow':
			rslow = data;
			try{
				var dd = $data.users[$data.id].place;
			}catch(e){
				var dd = 0;
			}
			$('#ct.product-title').html(data.q >= 0.01 && dd == data.i ? '<i class="fa fa-comment"></i>채팅  |  <i class="fa fa-clock-o"></i>슬로우 모드 적용 중 / ' + String(data.q) + '초' : '<i class="fa fa-comment"></i>채팅');
			break;
		case 'blackalert':
			setTimeout(pfJeje(data.reason, data.when), 300);
			break;
		case 'nikc':
			$data.users[data.usr].nickname = data.value;
			updateUserList(true);
			updateCommunity(true);
			if($data.users[data.usr].place == $data.place){
				updateRoom(false, { id: data.user, nickname: data.value });
			}
			break;
		case 'exoc':
			$data.users[data.usr].exordial = data.value;
			break;
		case 'roomlist':
			$data.rooms = data.val;
			updateRoomList(true);
			break;
		case 'renew':
			$data.rooms = data.room;
			$data.users = data.user;
			updateUserList(true);
			updateRoomList(true);
			_setTimeout(function(){ $stage.loading.hide(); }, 200);
			break;
		case 'dict':
			renderDict(data);
			break;
		case 'kdn':
			startTyping(data.id);
			break;
		case 'rank':
			Ranking(data.data, data);
			break;
		case 'killroom':
			try{
				send('leave');
				rws.close();
				notice('관리자에 의해 방이 삭제되었습니다.');
			}catch(e){
			}
			break;
		case 'chatclear':
			clearAllChat();
			break;
		case 'alert':
			if(data.code) alert(L['error_' + data.code]);
			break;
		case 'evtStat':
			data.evtKey = Number(data.evtKey) || 0;
			var looping = 0;
			while(max_g[looping] < data.evtKey && looping < 3){
				looping++;
			}
			var gss = !!data.evtKey ? data.evtKey / max_g[looping] * 100 : 0;
			if(gss > 100) gss = 100;
			gss = gss.toFixed(2);
			if(!data.evtKey && data.evtKey < 0){
				var su = max_g[looping];
			}else if(data.evtKey >= max_g[looping]){
				rst = '<br><font color="blue">완료!</font>';
				var su = data.evtKey;
			}else{
				rst = '';
				var su = data.evtKey;
			}
			peAlert('<b>광복절 태극기 모으기</b>\n\n<b>' + (looping+1) + '단계\n</b>' + commify(su) + ' / ' + max_g[looping] + ' [' + gss + '%]' + rst);
		default:
			break;
	}
	if($data._record) recordEvent(data);

    function recaptchaCallback(response) {
        ws.send(JSON.stringify({type: 'recaptcha', token: response}));
    }
}
function getevtKey(){
	send('event');
}
function clearAllChat(){
	$("#chat-log-board").empty();
	$("#Chat").empty();
}
function startTyping(id){
	var now = new Date();
	typing[id] = now.getTime();
}
_setInterval(function(){
	if(isWelcome){
		if($data.room){
			_setTimeout(function(){ send('refresh', undefined, true); }, 1500);
		}
		send('refresh');
	}
}, 16000);
_setInterval(function(){
	if(isWelcome){
		if(!$data.room){
			send('renew');
		}
	}
}, 15000)
_setInterval(function(){
	applyTyping();
}, 222);
function applyTyping(){
	var tp = "";
	var now = new Date();
	for(i in typing){
		if(!$data.users) continue;
		if(!$data.users[i]) continue;
		else if(i == $data.id) continue;
		else if($data.users[i].place != $data.place) continue;
		else if(now.getTime() - typing[i] > 3000) continue;
		else{
			try{
				if(tp == "") tp = $data.users[i].nickname;
				else tp += ', ' + $data.users[i].nickname;
			}catch(e){
				continue;
			}
		}
	}
	if(tp != "") tp += ' 님이 입력 중입니다.';
	var prev = getSlowTi();
	if(tp != ""){
		if($("#ct.product-title").html() == prev + ' | ' + tp) return;
	}else{
		if($("#ct.product-title").html() == prev) return;
	}
	if(tp != "") $("#ct.product-title").html(prev + ' | ' + tp);
	else $("#ct.product-title").html(prev);
}
function getNick(id){
	try{
		return $data.users[id].nickname || $data.users[id].profile.title;
	}catch(e){
		return '(미공개)';
	}
}
function getSlowTi(){
	try{
		var rm = $data.users[$data.id].place;
	}catch(e){
		var rm = 0;
	}
	
	var ri = rm && rm == rslow.i && rslow.q >= 0.01;
	var ji = !rm && slow >= 0.01;
	var jt = ri ? rslow.q : slow;
	return (ri || ji) ? '<i class="fa fa-comment"></i>채팅  |  <i class="fa fa-clock-o"></i>슬로우 모드 적용 중 / ' + String(jt) + '초' : '<i class="fa fa-comment"></i>채팅';
}
var renderDict = function(res){
	addTimeout(function(){
		$("#dict-search").prop('disabled', false);
	}, 500);
	if(res.error) return $("#dict-output").html(res.error + ": " + L['wpFail_' + res.error]);
	
	$("#dict-output").html(processWord(res.word, res.mean, res.theme, res.type.split(',')));
}
var nickset = function(){
	var newnick = $('#pinput-in').val();
	var kas = L['nickSet'];
	if(newnick == null){
		pfAlert(L['nickWrong']);
		updateMe();
	}
	if(newnick.length > 12){
		pfAlert(L['nickWrong']);
		updateMe();
	}
	var pnew = newnick.replace(/\s/g, "");
	if(pnew == ""){
		pfAlert(L['nickWrong']);
		updateMe();
	}
	if(newnick == undefined || newnick == null || newnick == ""){
		pfAlert(L['nickWrong']);
		updateMe();
	}
	var trxp = /[^a-zA-Z가-힣0-9\s\-\_]/g
	var badn = trxp.test(newnick);
	if(badn){
		pfAlert(L['nickWrong']);
		updateMe();
	}
	if(newnick.substr(0, 1) == " "){
		pfAlert(L['nickWrong']);
		updateMe();
	}
}
function makenewnick(/*wsstate*/){
	myst = false;
	onnick = true;
	$("#Jejed").animate({ 'opacity': 0 }, 1);
	$("#Jejed").show();
	$("#Jejed").animate({ 'opacity': 1 }, 1000);
	$("#Jejed").css({ 'z-index': 2 });
	//var ls;
	//if(!!ws)
	//ws.close();
	//kas = L['nickSet'];
	//pfInput(kas.replace(/\n/g, '<br>'), nickset, function(){}, 0, true);
	var newnick;
	pfInput(L['nickSet'], function(){
		newnick = $("#pinput-in").val();
		if(newnick == null){
			return pfAlert(L['nickWrong']);
		}
		if(newnick.length > 16){
			return pfAlert(L['nickLong']);
		}
		var pnew = newnick.replace(/\s/g, "");
		if(pnew == ""){
			return pfAlert(L['nickWrong']);
		}
		if(newnick == undefined || newnick == null || newnick == ""){
			return pfAlert(L['nickWrong']);
		}
		var trxp = /[^a-zA-Z가-힣0-9\s\-\_]/g
		var badn = trxp.test(newnick);
		if(badn){
			return pfAlert(L['nickWrong']);
		}
		if(newnick.substr(0, 1) == " "){
			return pfAlert(L['nickWrong']);
		}
		$.post("/nickname", { data: newnick }, function(res){
			if(res.error){
				return pfAlert(L['error_' + res.error]);
			}else{
				newnick = newnick.trim();
				pfAlert('닉네임 설정이 완료되었습니다!');
				send('nickchange', { prev: '' });
				$("#account-info").html(newnick);
				$data.users[$data.id].nickname = newnick;
				updateMe();
				$("#room-title").attr('placeholder', newnick + '님의 방');
				updateUserList(true);
				$stage.dialog.pInput.hide();
				piReset();
				onnick = false;
				send('refresh');
				$("#Jejed").hide();
				return;
			}
		});
	}, noFunc);
}
function nickChange(jnick){
	$.post("/nickname", { data: jnick }, function(res){
		$stage.dialog.dressOK.attr('disabled', false);
		if(res.error) return pfAlert(L['error_' + res.error]);
		else{
			$("#account-info").html(jnick);
			send('nickchange', { prev: $data.users[$data.id].nickname });
			$data.users[$data.id].nickname = jnick;
			updateMe();
			pfAlert(L['profileChanged']);
			$("#room-title").attr('placeholder', jnick + '님의 방');
			updateUserList(true);
		}
		$stage.dialog.dress.hide();
	});
}
function welcome(){
	isWelcome = true;
	if(!svAvail){
		svAvail = true;
		notice('자동 재연결 되었습니다.');
		$stage.dialog.pAlert.hide();
	}
	if(!didCaptcha) $data.bgm = playBGM($data.opts.bg, true);
	$("#Intro").animate({ 'opacity': 1 }, 1000).animate({ 'opacity': 0 }, 1000);
	$("#intro-text").text(L['welcome']);
	$(".my-gauge .lvgraph-bar").width(0);
	addTimeout(function(){
		$("#Intro").hide();
		blockGauge = false;
		updateMe();
	}, 2000);
	/*var nick = $data.usersR[$data.id].nickname;
	if(nick == null || nick == undefined) makenewnick();*/
	if($data.admin) console.log("관리자 모드");
}
function getKickText(profile, vote){
	var vv = L['causeMaster'];
	if(vote.Y >= vote.N){
		var nicknm = $data.users[profile.id].nickname;
		vv += nicknm + L['kicked'];
	}else{
		vv += nicknm + L['kickDenied'];
	}
	return vv;
}
function runCommand(cmd){
	var i, c, CMD = {
		'/ㄱ': L['cmd_r'],
		'/나가기': L['cmd_exit'],
		'/관전': L['cmd_sp'],
		'/청소': L['cmd_cls'],
		'/비우기': L['cmd_rmv'],
		'/ㄹ': L['cmd_f'],
		'/ㄷ': L['cmd_e'],
		'/ㄷㄷ': L['cmd_ee'],
		'/무시': L['cmd_wb'],
		'/차단': L['cmd_shut'],
		'/id': L['cmd_id'],
		'/필터링': L['cmd_filtering']
	};
	
	switch(cmd[0].toLowerCase()){
		case "/ㄱ":
		case "/r":
			if($data.room){
				if($data.room.master == $data.id) $stage.menu.start.trigger('click');
				else $stage.menu.ready.trigger('click');
			}
			break;
		case "/관전":
		case "/sp":
		case "/spec":
			if($data.room && !$data.room.gaming){
				$stage.menu.spectate.trigger('click');
			}
			break;
		case "/나가기":
		case "/ex":
		case "/exit":
			if($data.room){
				$stage.menu.exit.trigger('click');
			}
			break;
		case "/청소":
		case "/cls":
			clearChat();
			break;
		case "/ㄹ":
		case "/f":
			showDialog($stage.dialog.chatLog);
			$stage.chatLog.scrollTop(999999999);
			break;
		case "/귓":
		case "/ㄷ":
		case "/e":
			sendWhisper(cmd[1], cmd.slice(2).join(' '));
			break;
		case "/답":
		case "/ㄷㄷ":
		case "/ee":
			if($data._recentFrom){
				var towho = $data._recentFrom.replace(/\s/g, "");
				sendWhisper(towho, cmd.slice(1).join(' '));
			}else{
				notice(L['error_425']);
			}
			break;
		case "/무시":
		case "/wb":
			toggleWhisperBlock(cmd[1]);
			break;
		case "/차단":
		case "/shut":
			toggleShutBlock(cmd.slice(1).join(' '));
			break;
		case "/id":
			if(cmd[1]){
				c = 0;
				cmd[1] = cmd.slice(1).join(' ');
				for(i in $data.users){
					if(($data.users[i].nickname) == cmd[1]){
						notice("[" + (++c) + "] " + i);
					}
				}
				if(!c) notice(L['error_405']);
			}else{
				notice(L['myId'] + $data.id);
			}
			break;
		case "/remove":
		case "/비우기":
			removeChat();
			break;
		case "/필터링":
		case "/filter":
			var spt = $data.opts;
			notice(spt.bw ? '욕설/비속어 필터링 기능을 껐습니다.' : '욕설/비속어 필터링 기능을 켰습니다.')
			spt.bw = spt.bw ? false : true;
			applyOptions(spt);
			break;
		default:
			for(i in CMD) notice(CMD[i], i);
			break;
	}
}
function sendWhisper(target, text){
	if(text.length){
		$data._whisper = target;
		send('talk', { whisper: target, value: text }, true);
		chat({ title: "→" + target, id: $data.id }, text, true);
	}
}
function toggleWhisperBlock(target){
	if($data._wblock.hasOwnProperty(target)){
		delete $data._wblock[target];
		notice(target + L['wnblocked']);
	}else{
		$data._wblock[target] = true;
		notice(target + L['wblocked']);
	}
}
function toggleShutBlock(target){
	if($data._shut.hasOwnProperty(target)){
		delete $data._shut[target];
		notice(target + L['userNShut']);
	}else{
		$data._shut[target] = true;
		notice(target + L['userShut']);
	}
}
function tryDict(text, callback, mode){
	var text = mode == 2 ? text.replace(/[^\sa-zA-Zㄱ-ㅎ0-9가-힣]/g, "") : text;
	var lang = text.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/) ? 'ko' : 'en';
	
	if(text.length < 1) return callback({ error: 404 });
	/*
	$data.opts.dt
	true: AUTO
	
	*/
	/*if($data.opts.dt && mode != 2){
		send('dict', { word: text, lang: lang });
	}else{
		$.get("/dict/" + text + "?lang=" + lang, callback);
	}*/
	if(mode == 2) $.get("/dict/" + text + "?lang=" + lang, callback);
	else send('dict', { word: text, lang: lang });
}
function processRoom(data){
	var i, j, key, o;
	
	data.myRoom = ($data.place == data.room.id) || (data.target == $data.id);
	if(data.myRoom){
		$target = $data.users[data.target];
		if(data.kickVote){
			notice(getKickText($target.profile, data.kickVote));
			if($target.id == data.id) alert(L['hasKicked']);
		}
		if(data.room.players.indexOf($data.id) == -1){
			if($data.room) if($data.room.gaming){
				stopAllSounds();
				$data.practicing = false;
				$data._gaming = false;
				$stage.box.room.height(360);
				$data.bgm = playBGM($data.opts.bg);
			}
			$data.users[$data.id].game.ready = false;
			$data.users[$data.id].game.team = 0;
			$data.users[$data.id].game.form = "J";
			$stage.menu.spectate.removeClass("toggled");
			$stage.menu.ready.removeClass("toggled");
			$data.room = null;
			$data.resulting = false;
			$data._players = null;
			$data._master = null;
			$data.place = 0;
			if(data.room.practice){
				delete $data.users[0];
				$data.room = $data._room;
				$data.place = $data._place;
				$data.master = $data.__master;
				$data._players = $data.__players;
				delete $data._room;
			}
		}else{
			if(data.room.practice && !$data.practicing){
				$data.practicing = true;
				$data._room = $data.room;
				$data._place = $data.place;
				$data.__master = $data.master;
				$data.__players = $data._players;
			}
			if($data.room){
				$data._players = $data.room.players.toString();
				$data._master = $data.room.master;
				$data._rTitle = $data.room.title;
				$data._rMode = getOptions($data.room.mode, $data.room.opts, true);
				$data._rLimit = $data.room.limit;
				$data._rRound = $data.room.round;
				$data._rTime = $data.room.time;
			}
			$data.room = data.room;
			$data.place = $data.room.id;
			$data.master = $data.room.master == $data.id;
			if(data.spec && data.target == $data.id){
				if(!$data._spectate){
					$data._spectate = true;
					clearBoard();
					drawRound();
				}
				if(data.boards){
					// 십자말풀이 처리
					$data.selectedRound = 1;
					for(i in data.prisoners){
						key = i.split(',');
						for(j in data.boards[key[0]]){
							o = data.boards[key[0]][j];
							if(o[0] == key[1] && o[1] == key[2] && o[2] == key[3]){
								o[4] = data.prisoners[i];
								break;
							}
						}
					}
					$lib.Crossword.roundReady(data, true);
					$lib.Crossword.turnStart(data, true);
				}
				for(i in data.spec){
					try{
						$data.users[i].game.score = data.spec[i];
					}catch(e){
						continue;
					}
				}
			}
		}
		if(!data.modify && data.target == $data.id) forkChat();
	}
	if(data.target){
		if($data.users[data.target]){
			if(data.room.players.indexOf(data.target) == -1){
				$data.users[data.target].place = 0;
			}else{
				$data.users[data.target].place = data.room.id;
			}
		}
	}
	if(!data.room.practice){
		if(data.room.players.length){
			$data.setRoom(data.room.id, data.room);
			for(i in data.room.readies){
				if(!$data.users[i]) continue;
				$data.users[i].game.ready = data.room.readies[i].r;
				$data.users[i].game.team = data.room.readies[i].t;
			}
		}else{
			$data.setRoom(data.room.id, null);
		}
	}
}
function getOnly(){
	return $data.place ? (($data.room.gaming || $data.resulting) ? "for-gaming" : ($data.master ? "for-master" : "for-normal")) : "for-lobby";
}
function updateUI(myRoom, refresh){
/*
	myRoom이 undefined인 경우: 상점/결과 확인
	myRoom이 true/false인 경우: 그 외
*/	try{
		var rm = $data.users[$data.id].place;
	}catch(e){
		var rm = false;
	}
	var ri = rm && rm == rslow.i && rslow.t >= 0.01;
	var ji = !rm && slow >= 0.01;
	var jt = ri ? rslow.t : slow;
	$('#ct.product-title').html(ri || ji ? '<i class="fa fa-comment"></i>채팅  |  <i class="fa fa-clock-o"></i>슬로우 모드 적용 중 / ' + String(jt) + '초' : '<i class="fa fa-comment"></i>채팅');
	var only = getOnly();
	var i;
	
	if($data._replay){
		if(myRoom === undefined || myRoom){
			replayStop();
		}else return;
	}
	if($data._replay) return;
	if(only == "for-gaming" && !myRoom) return;
	if($data.practicing) only = "for-gaming";
	
	$(".kkutu-menu button").hide();
	for(i in $stage.box) $stage.box[i].hide();
	$stage.box.me.show();
	$stage.box.chat.show().width(790).height(190);
	$stage.chat.height(120);
	
	if(only == "for-lobby"){
		$data._ar_first = true;
		$stage.box.userList.show();
		if($data._shop || $data._exchange){
			$stage.box.roomList.hide();
			$stage.box.shop.show();
		}else{
			$stage.box.roomList.show();
			$stage.box.shop.hide();
		}
		updateUserList(refresh || only != $data._only);
		updateRoomList(refresh || only != $data._only);
		updateMe();
		if($data._jamsu){
			clearTimeout($data._jamsu);
			delete $data._jamsu;
		}
	}else if(only == "for-master" || only == "for-normal"){
		$(".team-chosen").removeClass("team-chosen");
		if($data.users[$data.id].game.ready || $data.users[$data.id].game.form == "S"){
			$stage.menu.ready.addClass("toggled");
			$(".team-selector").addClass("team-unable");
		}else{
			$stage.menu.ready.removeClass("toggled");
			$(".team-selector").removeClass("team-unable");
			$("#team-" + $data.users[$data.id].game.team).addClass("team-chosen");
			if($data.opts.ar && $data._ar_first){
				$stage.menu.ready.addClass("toggled");
				$stage.menu.ready.trigger('click');
				$data._ar_first = false;
			}
		}
		$data._shop = false;
		$data._exchange = false;
		$stage.box.room.show().height(360);
		if(only == "for-master") if($stage.dialog.inviteList.is(':visible')) updateUserList();
		updateRoom(false);
		updateMe();
	}else if(only == "for-gaming"){
		if($data._gAnim){
			$stage.box.room.show();
			$data._gAnim = false;
		}
		$data._shop = false;
		$data._exchange = false;
		$data._ar_first = true;
		$stage.box.me.hide();
		$stage.box.game.show();
		$(".ChatBox").width(1000).height(140);
		$stage.chat.height(70);
		updateRoom(true);
	}
	$data._only = only;
	setLocation($data.place);
	$(".kkutu-menu ."+only).show();
}
function animModified(cls){
	$(cls).addClass("room-head-modified");
	addTimeout(function(){ $(cls).removeClass("room-head-modified"); }, 3000);
}
function checkRoom(modify){
	if(!$data._players) return;
	if(!$data.room) return;
	
	var OBJ = {} + '';
	var i, arr = $data._players.split(',');
	var lb = arr.length, la = $data.room.players.length;
	var u;
	
	for(i in arr){
		if(arr[i] == OBJ) lb--;
	}
	for(i in $data.room.players){
		if($data.room.players[i].robot) la--;
	}
	if(modify){
		for(i in arr){
			if(arr[i] != OBJ) $data.users[arr[i]].game.ready = false;
		}
		notice(L['hasModified']);
	}
	if($data._gaming != $data.room.gaming){
		if($data.room.gaming){
			gameReady();
			$data._replay = false;
			startRecord($data.room.game.title);
		}else{
			if($data._spectate){
				if($data.users[$data.id].equip["STY"] != "b1_gm") $stage.dialog.resultSave.hide();
				$data._spectate = false;
				if($data.users[$data.id].game.form == "O") send('leave');
				$data.bgm = playBGM($data.opts.bg);
			}else{
				$stage.dialog.resultSave.show();
				$data.resulting = true;
			}
			clearInterval($data._tTime);
		}
	}
	if($data._master != $data.room.master){
		u = $data.users[$data.room.master];
		notice(u.nickname + L['hasMaster']);
	}
	$data._players = $data.room.players.toString();
	$data._master = $data.room.master;
	$data._gaming = $data.room.gaming;
}
function updateMe(){
	try{
		var my = $data.users[$data.id];
		//var isAdmin = $data.admin;
		var i, gw = 0;
		var lv = getLevel(my.data.score);
		var prev = EXP[lv-2] || 0;
		var goal = EXP[lv-1];
		var gg = lv > 1000 || my.data.score < 0;
		
		for(i in my.data.record) gw += my.data.record[i][1];
		renderMoremi(".my-image", my.equip);
		renderAccountMoremi(my.equip);
		// $(".my-image").css('background-image', "url('"+my.profile.image+"')");
		$(".my-stat-level").replaceWith(getLevelImage(my.data.score, my.equip).addClass("my-stat-level"));
		if(my.nickname != undefined && my.nickname != null) var prenick = my.nickname.replace(/\s/g, "")
		else var prenick = my.nickname;
		if(prenick == undefined || prenick == null || prenick == ""){
			if(myst){
				myst = false;
				makenewnick();
			}
		}

		var j = 0;
		var jl = my.data.score < 0;
		j = $data.opts.ml ? my.data.score / 50000000 : (my.data.score-prev)/(goal-prev);
		$(".my-stat-name").html(my.nickname);
		$(".my-stat-record").html(L['globalWin'] + " " + gw + L['W']);
		$(".my-stat-ping").html(commify(my.money) + L['ping']);
		$(".my-okg .graph-bar").width(($data._playTime % 300000) / 3000 + "%");
		$(".my-okg-text").html(prettyTime($data._playTime));
		$(".my-level").html(gg ? getLevelName(lv) : L['LEVEL'] + " " + lv);
		//$(".my-gauge .lvgraph-bar").width(j * 190);
		if(!blockGauge){
			try{
				if(!$data.opts.ml){
					var aq = getLevel(my.data.score);
					if(prev_level) aq = aq - prev_level;
					if(prev_level){
						for(var i=0; i<aq; i++){
							//aq = 1, i=0 -> 400
							var goingspeed = 600/aq-i;
							$(".my-gauge .lvgraph-bar").animate({ width: 190 }, goingspeed < 15 ? 15 : goingspeed);
							if(aq > 3) $(".my-gauge .lvgraph-bar").animate({ width: 0 }, (10/aq-i) < 5 ? 5 : 10/aq-i);
							else $(".my-gauge .lvgraph-bar").animate({ width: 0 }, 400/aq-i);
						}
					}
				}
				prev_level = getLevel(my.data.score);
				$(".my-gauge .lvgraph-bar").animate({ width: j * 190}, 600);
			}catch(e){
				prev_level = getLevel(my.data.score);
				$(".my-gauge .lvgraph-bar").animate({ width: j * 190}, 600);
			}
		}
		
		var gls = (my.data.score-prev)/(goal-prev) * 100;
		gls = gls.toFixed(2);
		var gss = my.data.score / 50000000 * 100;
		gss = gss.toFixed(2);
		if(!$data.opts.rq) $(".my-gauge-text").html($data.opts.ml ? commify(my.data.score) + " / " + commify(50000000) : commify(my.data.score) + " / " + commify(goal));
		else $(".my-gauge-text").html(jl ? commify(my.data.score) + " / " + commify(goal) : commify(my.data.score-prev) + " / " + commify(goal-prev))
		$(".my-gauge-per").html($data.opts.ml ? gss + "%" : gls + "%");
		/*$exl = $(".my-gauge-text");
		$exl.append($("<div>").addClass("expl").html('TEST'));
		global.expl($exl);*/
	}catch(e){
		//console.log(e.toString());
	}
	
}
function prettyTime(time){
	var min = Math.floor(time / 60000) % 60, sec = Math.floor(time * 0.001) % 60;
	var hour = Math.floor(time / 3600000);
	var txt = [];
	
	if(hour) txt.push(hour + L['HOURS']);
	if(min) txt.push(min + L['MINUTE']);
	if(!hour) txt.push(sec + L['SECOND']);
	return txt.join(' ');
}
function updateUserList(refresh){
	var $bar;
	var i, o, len = 0;
	var arr;
	
	// refresh = true;
	// if(!$stage.box.userList.is(':visible')) return;
	arr = [];
	for(i in $data.users){
		len++;
		arr.push($data.users[i]);
	}
	if($data.opts.su) arr.sort(function(a, b){ return b.data.score - a.data.score; });
	else if($data.opts.nu) arr.sort(function(a, b){ if(a.nickname > b.nickname) return 1; if(b.nickname > a.nickname) return -1; return 0; });
	refresh = true;
	$stage.lobby.userListTitle.html("<i class='fa fa-users'></i>"
		+ "&lt;<b>" + L['server_' + $data.server] + "</b>&gt; "
		+ L['UserList'].replace("FA{users}", "")
		+ " [" + len + L['MN'] + "]");
	$('#UserListDiag .dialog-title').html("<i class='fa fa-users'></i>"
		+ " &lt;<b>" + L['server_' + $data.server] + "</b>&gt; "
		+ L['UserList'].replace("FA{users}", "")
		+ " [" + len + L['MN'] + "]");
	if(refresh){
		$stage.lobby.userList.empty();
		$stage.dialog.inviteList.empty();
		$stage.dialog.usRList.empty();
		for(i in arr){
			o = arr[i];
			if(o.robot) continue;
			
			$stage.lobby.userList.append(userListBar(o));
			$stage.dialog.usRList.append(onLUsB(o));
			if(o.place == 0) $stage.dialog.inviteList.append(userListBar(o, true));
		}
	}
}
function onLUsB(o){
	if(o.nickname == "") return;
	var $R;
	$R = $("<div>").attr('id', "invite-item-"+o.id).addClass("invite-item users-item")
	// .append($("<div>").addClass("jt-image users-image").css('background-image', "url('"+o.profile.image+"')"))
	.append(getLevelImage(o.data.score, o.equip).addClass("users-level"))
	// .append($("<div>").addClass("jt-image users-from").css('background-image', "url('/img/kkutu/"+o.profile.type+".png')"))
	.append($("<div>").addClass("users-name").html(o.nickname))
	
	addonNickname($R, o, false);
	
	return $R;
}
function userListBar(o, forInvite){
	if(o.nickname == "") return;
	var $R;
	if(forInvite){
		$R = $("<div>").attr('id', "invite-item-"+o.id).addClass("invite-item users-item")
		// .append($("<div>").addClass("jt-image users-image").css('background-image', "url('"+o.profile.image+"')"))
		.append(getLevelImage(o.data.score, o.equip).addClass("users-level"))
		// .append($("<div>").addClass("jt-image users-from").css('background-image', "url('/img/kkutu/"+o.profile.type+".png')"))
		.append($("<div>").addClass("users-name").html(o.nickname))
		.on('click', function(e){
			requestInvite($(e.currentTarget).attr('id').slice(12));
		});
	}else{
		$R = $("<div>").attr('id', "users-item-"+o.id).addClass("users-item")
		// .append($("<div>").addClass("jt-image users-image").css('background-image', "url('"+o.profile.image+"')"))
		.append(getLevelImage(o.data.score, o.equip).addClass("users-level"))
		// .append($("<div>").addClass("jt-image users-from").css('background-image', "url('/img/kkutu/"+o.profile.type+".png')"))
		.append($("<div>").addClass("users-name ellipse").html(o.nickname))
		.on('click', function(e){
			requestProfile($(e.currentTarget).attr('id').slice(11));
		});
	}
	addonNickname($R, o, false);
	
	return $R;
}
function addonNickname($R, o, s){
	if(s){
		$R.addClass("x-spectate");
	} else {
		if(o.equip['NIK']) $R.addClass("x-" + o.equip['NIK']);
		if(o.equip['STY'] == "b1_gm" || o.equip['STY'] == "b1_ds" || o.equip['STY'] == "b1_wd"){
			if(o.equip['STY'] == "b1_gm") $R.addClass("x-gm");
			if(o.equip['STY'] == "b1_ds") $R.addClass("x-ds");
			if(o.equip['STY'] == "b1_wd") $R.addClass("x-wd");
		}else{
			if(o.equip['BDG'] == "b1_manlep") $R.addClass("x-ms");
			if(o.equip['BDG'] == "b1_master") $R.addClass("x-mt");
			if(o.equip['BDG'] == "b1_lv500") $R.addClass("x-500");
			if(o.equip['BDG'] == "b1_lv600") $R.addClass("x-600");
			if(o.equip['BDG'] == "b1_lv750") $R.addClass("x-750");
			if(o.equip['BDG'] == "b1_lv360") $R.addClass("x-360");
			if(o.equip['BDG'] == "b1_lv100") $R.addClass("x-100");
			if(o.equip['BDG'] == "b1_lv200") $R.addClass("x-200");
		}
	}
	$R.addClass("ellipse");
}
function updateRoomList(refresh){
	var i;
	var len = 0;
	
	if(!refresh){
		$(".rooms-create").remove();
		for(i in $data.rooms) len++;
	}else{
		var rlist = [];
		$stage.lobby.roomList.empty();
		for(i in $data.rooms){
			rlist.push($data.rooms[i]);
		}
		if($data.opts.rv) rlist.sort(function(a, b){ return b.id - a.id; });
		else rlist.sort(function(a, b){ return a.id - b.id; });
		for(i in rlist){
			$stage.lobby.roomList.append(roomListBar(rlist[i]));
			len++;
		}
	}
	$stage.lobby.roomListTitle.html(L['RoomList'].replace("FA{bars}", "<i class='fa fa-bars'></i>") + " [" + len + L['GAE'] + "]");
	if(len){
		$(".rooms-gaming").css('display', $data.opts.ow ? "none" : "");
		$(".rooms-locked").css('display', $data.opts.ou ? "none" : "");
	}else{
		$stage.lobby.roomList.append($stage.lobby.createBanner.clone().on('click', onBanner));
	}
	function onBanner(e){
		$stage.menu.newRoom.trigger('click');
	}
}
function roomListBar(o){
	var $R, $ch;
	var opts = getOptions(o.mode, o.opts);
	var pyopts = opts;
	var pdo = false;
	var gmroom = false;
	var wuroom = false;
	o.players.forEach(function(p, i){
		try{
			p = $data.users[p] || NULL_USER;
			if(o.players[i].robot){
				p.profile = { title: L['robot'] };
				p.equip = { robot: true };
			}
			if(p.equip["STY"] == "b1_gm") gmroom = true;
			if(p.equip["STY"] == "b1_wd" || p.equip["STY"] == "b1_ds") wuroom = true;
		}catch(err){
			console.log(err.toString());
		}
	});
	if(gmroom && wuroom) wuroom = false;
	
	/*while(pyopts.length > 4){
		pdo = true;
		pyopts.splice(pyopts.length - 1, 1);
	}
	if(pdo){
		var pmd = pyopts[pyopts.length - 1];
		pmd = pmd + ' <b>…</b>';
		pyopts.splice(pyopts.length - 1, 1);
		pyopts = pyopts.concat(pmd);
		opts = pyopts;
	}*/
	$R = $("<div>").attr('id', "room-"+o.id).addClass("rooms-item")
	.append($ch = $("<div>").addClass("rooms-channel channel-" + o.channel).on('click', function(e){ requestRoomInfo(o.id); }))
	.append($("<div>").addClass("rooms-number").html(o.id < 0 ? 'GM' : roomPadding(o.id, 3)))
	.append($("<div>").addClass("rooms-title ellipse").text(badWords(o.title)))
	.append($("<div>").addClass("rooms-limit").html(o.players.length + " / " + o.limit))
	.append($("<div>").width(mobile ? 220 : 270)
		.append($("<div>").addClass("rooms-mode").html(opts.join(" / ").toString()))
		.append($("<div>").addClass("rooms-round").html(L['rounds'] + " " + o.round))
		.append($("<div>").addClass("rooms-time").html(o.time + L['SECOND']))
	)
	.append($("<div>").addClass("rooms-lock").html(o.password ? "<i class='fa fa-lock'></i>" : "<i class='fa fa-unlock'></i>"))
	.on('click', function(e){
		if(e.target == $ch.get(0)) return;
		tryJoin($(e.currentTarget).attr('id').slice(5));
	});
	if(mobile){
		wuroom = false;
		gmroom = false;
	}
	if(!o.gaming/* && !gmroom && !wuroom*/) $R.addClass("rooms-waiting");
	if(o.gaming/* && !gmroom && !wuroom*/) $R.addClass("rooms-gaming");
	if(o.password) $R.addClass("rooms-locked");
	/*if(!o.gaming && gmroom && !wuroom) $R.addClass("rooms-waiting-gm");
	if(o.gaming && gmroom && !wuroom) $R.addClass("rooms-gaming-gm");
	if(o.gaming && wuroom && !gmroom) $R.addClass("rooms-gaming-wu");
	if(!o.gaming && wuroom && !gmroom) $R.addClass("rooms-waiting-wu");*/
	
	return $R;
}
function normalGameUserBar(o){
	var $m, $n, $bar;
	var lvs = getLevel(o.data.score);
	var gg = lvs > 1000;
	var $R = $("<div>").attr('id', "game-user-"+o.id).addClass("game-user")
		.append($m = $("<div>").addClass("moremi game-user-image"))
		.append($("<div>").addClass("game-user-title")
			.append(getLevelImage(o.data.score, o.equip).addClass("game-user-level"))
			.append($bar = $("<div>").addClass("game-user-name ellipse").html(o.nickname))
			.append($("<div>").addClass("expl").html(gg ? getLevelName(lvs) : L['LEVEL'] + " " + lvs))
		)
		.append($n = $("<div>").addClass("game-user-score"));
	renderMoremi($m, o.equip);
	global.expl($R);
	addonNickname($bar, o, false);
	if(o.game.team) $n.addClass("team-" + o.game.team);
	
	return $R;
}
function miniGameUserBar(o){
	var $n, $bar;
	var $R = $("<div>").attr('id', "game-user-"+o.id).addClass("game-user")
		.append($("<div>").addClass("game-user-title")
			.append(getLevelImage(o.data.score, o.equip).addClass("game-user-level"))
			.append($bar = $("<div>").addClass("game-user-name ellipse").html(o.nickname))
		)
		.append($n = $("<div>").addClass("game-user-score"));
	if(o.id == $data.id) $bar.addClass("game-user-my-name");
	addonNickname($bar, o, false);
	if(o.game.team) $n.addClass("team-" + o.game.team);
	
	return $R;
}
function getAIProfile(level){
	return {
		title: L['aiLevel' + level] + ' ' + L['robot'],
		nickname: L['aiLevel' + level] + ' ' + L['robot'],
		image: cdn + "/img/kkutu/robot.png"
	};
}
function updateRoom(gaming, nickData){
	var i, o, $r;
	var $y, $z;
	var $m;
	var $bar;
	var rule = RULE[MODE[$data.room.mode]];
	var renderer = (mobile || rule.big) ? miniGameUserBar : normalGameUserBar;
	var spec;
	var arAcc = false, allReady = true;
	var mn;

	setRoomHead($(".RoomBox .product-title"), $data.room);
	setRoomHead($(".GameBox .product-title"), $data.room);
	if(gaming){
		$r = $(".GameBox .game-body").empty();
		// updateScore(true);
		for(i in $data.room.game.seq){
			if($data._replay){
				o = $rec.users[$data.room.game.seq[i]] || $data.room.game.seq[i];
			}else{
				o = $data.users[$data.room.game.seq[i]] || $data.robots[$data.room.game.seq[i].id] || $data.room.game.seq[i];
			}
			if(o.robot && !o.profile){
				o.profile = getAIProfile(o.level);
				o.nickname = o.profile.title;
				$data.robots[o.id] = o;
			}
			if($data._replay){
				try{
					mn = $data.users[o.id] || $data.robots[o.id];
					if(!mn) o.nickname = o.id;
					else o.nickname = mn.nickname || o.id;
				}catch(e){
					o.nickname = o.id;
				}
			}
			$r.append(renderer(o));
			updateScore(o.id, o.game.score || 0);
		}
		clearTimeout($data._jamsu);
		delete $data._jamsu;
	}else{
		$r = $(".room-users").empty();
		spec = $data.users[$data.id].game.form == "S";
		// 참가자
		for(i in $data.room.players){
			o = $data.users[$data.room.players[i]] || $data.room.players[i];
			if(!o.game) continue;
			
			var prac = o.game.practice ? ('/' + L['stat_practice']) : '';
			var spec = (o.game.form == "S") ? ('/' + L['stat_spectate']) : false;
			if(o.robot){
				o.profile = getAIProfile(o.level);
				o.nickname = o.profile.title;
				$data.robots[o.id] = o;
			}
			if(nickData){
				if(o.id == nickData.id){
					o.nickname = nickData.nickname;
					$data.room.players[i].nickname = nickData.nickname;
				}
			}
			$r.append($("<div>").attr('id', "room-user-"+o.id).addClass("room-user")
				.append($m = $("<div>").addClass("moremi room-user-image"))
				.append($("<div>").addClass("room-user-stat")
					.append($y = $("<div>").addClass("room-user-ready"))
					.append($z = $("<div>").addClass("room-user-team team-" + o.game.team).html($("#team-" + o.game.team).html()))
				)
				.css($data.opts.th == "dark" ? { 'box-shadow': '0px 1px 1px #363636', 'background-color': '#303030' } : { 'box-shadow': '0px 1px 1px #777777', 'background-color': '#E4E4E4' })
				.append($("<div>").addClass("room-user-title")
					.append(getLevelImage(o.data.score, o.equip).addClass("room-user-level"))
					.append($bar = $("<div>").addClass("room-user-name").html(o.nickname))
				).on('click', function(e){
					requestProfile($(e.currentTarget).attr('id').slice(10));
				}).on('mouseenter', function(e){
					$(this).addClass($data.opts.th + '-hover');
				}).on('mouseleave', function(e){
					$(this).removeClass($data.opts.th + '-hover');
				})
			);
			renderMoremi($m, o.equip);
			if(spec) $z.hide();
			if(o.id == $data.room.master){
				$y.addClass("room-user-master").html(L['master'] + prac + (spec || ''));
			}else if(spec){
				$y.addClass("room-user-spectate").html(L['stat_spectate'] + prac);
			}else if(o.game.ready || o.robot){
				$y.addClass("room-user-readied").html(L['stat_ready']);
				if(!o.robot) arAcc = true;
			}else if(o.game.practice){
				$y.addClass("room-user-practice").html(L['stat_practice']);
				allReady = false;
			}else{
				$y.html(L['stat_noready']);
				allReady = false;
			}
			addonNickname($bar, o, false);
		}
		if(arAcc && $data.room.master == $data.id && allReady){
			if(!$data._jamsu) $data._jamsu = addTimeout(onMasterSubJamsu, 5000);
		}else{
			clearTimeout($data._jamsu);
			delete $data._jamsu;
		}
	}
	if($stage.dialog.profile.is(':visible')){
		requestProfile($data._profiled);
	}
}
function onMasterSubJamsu(){
	notice(L['subJamsu']);
	$data._jamsu = addTimeout(function(){
		send('leave');
		alert(L['masterJamsu']);
	}, 30000);
}
function updateScore(id, score){
	var i, o, t;
	
	if(o = $data["_s"+id]){
		clearTimeout(o.timer);
		o.$obj = $("#game-user-"+id+" .game-user-score");
		o.goal = score;
	}else{
		o = $data["_s"+id] = {
			$obj: $("#game-user-"+id+" .game-user-score"),
			goal: score,
			now: 0
		};
	}
	animateScore(o);
	/*if(id === true){
		// 팀 정보 초기화
		$data.teams = [];
		for(i=0; i<5; i++) $data.teams.push({ list: [], score: 0 });
		for(i in $data.room.game.seq){
			t = $data.room.game.seq[i];
			o = $data.users[t] || $data.robots[t] || t;
			if(o){
				$data.teams[o.game.team].list.push(t.id ? t.id : t);
				$data.teams[o.game.team].score += o.game.score;
			}
		}
		for(i in $data.room.game.seq){
			t = $data.room.game.seq[i];
			o = $data.users[t] || $data.robots[t] || t;
			updateScore(t.id || t, o.game.score);
		}
	}else{
		o = $data.users[id] || $data.robots[id];
		if(o.game.team){
			t = $data.teams[o.game.team];
			i = $data["_s"+id];
			t.score += score - (i ? i.goal : 0);
		}else{
			t = { list: [ id ], score: score };
		}
		for(i in t.list){
			if(o = $data["_s"+t.list[i]]){
				clearTimeout(o.timer);
				o.$obj = $("#game-user-"+t.list[i]+" .game-user-score");
				o.goal = t.score;
			}else{
				o = $data["_s"+t.list[i]] = {
					$obj: $("#game-user-"+t.list[i]+" .game-user-score"),
					goal: t.score,
					now: 0
				};
			}
			animateScore(o);
		}
		return $("#game-user-" + id);
	}*/
	return $("#game-user-" + id);
}
function animateScore(o){
	var v = (o.goal - o.now) * Math.min(1, TICK * 0.01);
	
	if(v < 0.1) v = o.goal - o.now;
	else o.timer = addTimeout(animateScore, TICK, o);
	
	o.now += v;
	drawScore(o.$obj, Math.round(o.now));
}
function drawScore($obj, score){
	if(score > 99999 && score < 10000000){
		var sc = (zeroPadding(Math.round(score * 0.001), 4) + 'k');
	} else if(score > 9999999 && score < 10000000000){
		var sc = (zeroPadding(Math.round(score * 0.000001), 4) + 'm');
	} else if(score > 9999999999 && score < 10000000000000){
		var sc = (zeroPadding(Math.round(score * 0.000000001), 4) + 'b');
	} else if(score > 9999999999999 && score < 10000000000000000){
		var sc = (zeroPadding(Math.round(score * 0.000000000001), 4) + 't');
	} else if(score > 9999999999999999){
		var sc = (zeroPadding(Math.round(score * 0.000000000000001), 3) + 'qa');
	} else {
		var sc = zeroPadding(score, 5);
	}
	//var i, sc = (score > 99999) ? (zeroPadding(Math.round(score * 0.001), 4) + 'k') : zeroPadding(score, 5);
	var i;
	
	$obj.empty();
	for(i=0; i<sc.length; i++){
		$obj.append($("<div>").addClass("game-user-score-char").html(sc[i]));
	}
}
function drawMyDress(avGroup){
	var $view = $("#dress-view");
	var my = $data.users[$data.id];
	
	renderMoremi($view, my.equip);
	$(".dress-type.selected").removeClass("selected");
	$("#dress-type-all").addClass("selected");
	$("#dress-exordial").val(my.exordial);
	$("#dress-nickname").val(my.nickname);
	drawMyGoods(avGroup || true);
}
function renderGoods($target, preId, filter, equip, onClick){
	var $item;
	var list = [];
	var obj, q, g, equipped;
	var isAll = filter === true;
	var i;
	
	$target.empty();
	if(!equip) equip = {};
	for(i in equip){
		if(!$data.box.hasOwnProperty(equip[i])) $data.box[equip[i]] = { value: 0 };
	}
	for(i in $data.box) list.push({ key: i, obj: iGoods(i), value: $data.box[i] });
	list.sort(function(a, b){
		return (a.obj.name < b.obj.name) ? -1 : 1;
	});
	for(i in list){
		obj = list[i].obj;
		q = list[i].value;
		g = obj.group;
		if(g.substr(0, 3) == "BDG") g = "BDG";
		equipped = (g == "Mhand") ? (equip['Mlhand'] == list[i].key || equip['Mrhand'] == list[i].key) : (equip[g] == list[i].key);
		
		if(typeof q == "number") q = {
			value: q
		};
		//if(g == 'EVT') continue;
		if(!q.hasOwnProperty("value") && !equipped) continue;
		if(!isAll) if(filter.indexOf(obj.group) == -1) continue;
		$target.append($item = $("<div>").addClass("dress-item")
			.append(getImage(obj.image).addClass("dress-item-image").html("x" + q.value))
			.append(explainGoods(obj, equipped, q.expire, true))
		);
		$item.attr('id', preId + "-" + obj._id).on('click', onClick);
		if(equipped) $item.addClass("dress-equipped");
	}
	global.expl($target);
}
function getMoney(cost, gid){
	if(gid.charAt() == "$"){
		switch(gid.slice(0, 4)){
			case "$WPC":
				return 5;
			case "$WPB":
				return 30;
			case "$WPC":
				return 50;
		}
	}else return Math.round((cost || 0) * 0.2);
}
function drawMyGoods(avGroup){
	var equip = $data.users[$data.id].equip || {};
	var filter;
	var isAll = avGroup === true;
	
	$data._avGroup = avGroup;
	if(isAll) filter = true;
	else filter = (avGroup || "").split(',');
	
	renderGoods($("#dress-goods"), 'dress', filter, equip, function(e){
		var $target = $(e.currentTarget);
		var id = $target.attr('id').slice(6);
		var item = iGoods(id);
		var isLeft;
		var checkgroupevt = item.group == "CNS";
		var enhanceable = AVAIL_EQUIP.indexOf(item.group)!=-1;
		var chg = item.group == "CNS"; // || item.group == "CHT";
		if(e.ctrlKey){
			if($target.hasClass("dress-equipped")) return fail(426);
			if(!confirm(L['surePayback'] + commify(getMoney(item.cost, id)) + L['ping'])) return;
			$.post("/payback/" + id, function(res){
				if(res.error) return fail(res.error);
				pfAlert(L['painback']);
				$data.box = res.box;
				$data.users[$data.id].money = res.money;
				
				drawMyDress($data._avGroup);
				updateUI(false);
			});
		}else if(AVAIL_EQUIP.indexOf(item.group) != -1 && !e.altKey){
			if(item.group == "Mhand"){
				return pfHand(L['dressWhichHand'], function(){ requestEquip(id, !0) }, function(){ requestEquip(id, 0) });
			}
			requestEquip(id, isLeft);
		}else if(item.group == "CNS" && e.altKey && id == 'dictPage'){
			if(!confirm('정말 이 항목을 모두 사용합니까?')) return;
			var k = $data.users[$data.id];
			var j = k.data.score;
			$.post("/cnsall/" + id, function(res){
				if(res.exp) notice(L['obtainExp'] + ": " + commify(res.exp));
				if(res.money) notice(L['obtainMoney'] + ": " + commify(res.money));
				if(res.cde) notice('정상적으로 처리되었습니다.');
				res.gain.forEach(function(item){ queueObtain(item); });
				$data.box = res.box;
				$data.users[$data.id].data = res.data;
				send('refresh');
				var s = $data.users[$data.id];
				s = getLevel(s.data.score);
				
				if(l < s) playSound('lvup');
				if(l < s && s == 1051) notice("만렙 달성 축하드려요! 지금까지 수고 많으셨습니다. <del>앞으로도 계속 많은 이용 부탁드려요!</del>", "만렙 달성!");
				drawMyDress($data._avGroup);
				updateMe();
			});
		}else if(checkgroupevt && !e.altKey){
			/*pfInput('보낼 말을 입력해주세요.', function(){
				var u = $("#pinput-in").val();
				if(!u) return;
				if(u.indexOf('<')!=-1 || u.indexOf('>')!=-1) return pfAlert('사용할 수 없는 특수문자가 포함되어 있습니다.');
				else{
					send('rainbow', { value: u });
					send('refresh');
					playSound('success');
					updateMe();
				}
			}, noFunc);*/
			//if(!confirm(L['sureConsume'])) return;
			pfConfirm(L['sureConsume'], function(){
				var k = $data.users[$data.id];
				var j = k.data.score;
				$.post("/consume/" + id, function(res){
					var l = getLevel(j);
					if(res.exp) notice(L['obtainExp'] + ": " + commify(res.exp));
					if(res.money) notice(L['obtainMoney'] + ": " + commify(res.money));
					res.gain.forEach(function(item){ queueObtain(item); });
					$data.box = res.box;
					$data.users[$data.id].data = res.data;
					$data.users[$data.id].money = res.mny;
					send('refresh');
					var s = $data.users[$data.id];
					var s = getLevel(s.data.score);
					
					if(l < s) playSound('lvup');
					if(l < s && s == 1051) notice("만렙 달성 축하드려요! 지금까지 수고 많으셨습니다. <del>앞으로도 계속 많은 이용 부탁드려요!</del>", "만렙 달성!");
					drawMyDress($data._avGroup);
					updateMe();
				});
			}, noFunc);
		}else if(enhanceable && e.altKey){
			showEnhance(id);
		}
	});
}
function getPercent(prev, level){
	if(level < 0) return (prev * 100).toFixed(2);
	return (prev * lis[level]).toFixed(2);
}
function getCost(level, sc){
	var sa;
	sa = 0;
	sa += ((level + 1) * 5) * (sc * 15000);
	return Math.floor(sa / 2.25);
}
function showEnhance(item){
	$.get("/enhance/" + item, function(res){
		if(res.error) return fail(res.error);
		else{
			var ui = iGoods(item).options;
			var mode, next, sc;
			if(!ui.hasOwnProperty('gEXP') && !ui.hasOwnProperty('gMNY')) return pfAlert('강화가 불가능한 아이템입니다.');
			else{
				if(ui.hasOwnProperty('gEXP')) mode = 1;
				else if(ui.hasOwnProperty('gMNY')) mode = 2;
			}
			if(res.lv >= 10) return pfAlert('더 이상 강화할 수 없습니다.');
			if(mode){
				if(mode == 1){
					next = '획득 경험치: +' + getPercent(ui["gEXP"], res.lv - 1) + '%p → +' + getPercent(ui["gEXP"], res.lv) + '%p';
					sc = ui["gEXP"];
				}else{
					next = '획득 핑: +' + getPercent(ui["gMNY"], res.lv - 1) + '%p → +' + getPercent(ui["gMNY"], res.lv) + '%p';
					sc = ui["gMNY"];
				}
			}
			en_info.per = per[res.lv].toFixed(2);
			en_info.item = item;
			en_info.ping = res.cost;
			$("#en-name").html(iName(item));
			$("#en-id").html(item);
			$("#en-level").html(res.lv + "레벨 → " + (res.lv + 1) + '레벨');
			$("#en-image").css('background-image', "url(" + iImage(item) + ")");
			$("#en-percent").html(per[res.lv].toFixed(2) + "%");
			$("#en-after").html(next);
			$("#en-cost").html(res.cost + '핑');
			showDialog($stage.dialog.enhance);
		}
	});
}
function requestEquip(id, isLeft){
	var my = $data.users[$data.id];
	var part = $data.shop[id].group;
	if(part == "Mhand") part = isLeft ? "Mlhand" : "Mrhand";
	if(part.substr(0, 3) == "BDG") part = "BDG";
	var already = my.equip[part] == id;
	var reqEquip = function(){
		$.post("/equip/" + id, { isLeft: isLeft }, function(res){
			if(res.error) return fail(res.error);
			$data.box = res.box;
			my.equip = res.equip;
			
			drawMyDress($data._avGroup);
			send('refresh');
			updateUI(false);
		});
	}
	pfConfirm(L[already ? 'sureUnequip' : 'sureEquip'] + ": " + L[id][0], function(){ reqEquip(); });
	/*if(confirm(L[already ? 'sureUnequip' : 'sureEquip'] + ": " + L[id][0])){
		$.post("/equip/" + id, { isLeft: isLeft }, function(res){
			if(res.error) return fail(res.error);
			$data.box = res.box;
			my.equip = res.equip;
			
			drawMyDress($data._avGroup);
			send('refresh');
			updateUI(false);
		});
	}*/
}
function drawCharFactory(){
	var $tray = $("#cf-tray");
	var $dict = $("#cf-dict");
	var $rew = $("#cf-reward");
	var $goods = $("#cf-goods");
	var $cost = $("#cf-cost");
	
	$data._tray = [];
	$dict.empty();
	$rew.empty();
	$cost.html("");
	$stage.dialog.cfCompose.removeClass("cf-composable");
	
	renderGoods($goods, 'cf', [ 'PIX', 'PIY', 'PIZ' ], null, function(e){
		var $target = $(e.currentTarget);
		var id = $target.attr('id').slice(3);
		var bd = $data.box[id];
		var i, c = 0;
		
		if($data._tray.length >= 7) return fail(435);
		for(i in $data._tray) if($data._tray[i] == id) c++;
		if(bd - c > 0){
			$data._tray.push(id);
			drawCFTray();
		}else{
			fail(434);
		}
	});
	function trayEmpty(){
		$tray.html($("<h4>").css('padding-top', "8px").width("100%").html(L['cfTray']));
	}
	function drawCFTray(){
		var LEVEL = { 'WPC': 1, 'WPB': 2, 'WPA': 3 };
		var gd, word = "";
		var level = 0;
		
		$tray.empty();
		$(".cf-tray-selected").removeClass("cf-tray-selected");
		$data._tray.forEach(function(item){
			gd = iGoods(item);
			word += item.slice(4);
			level += LEVEL[item.slice(1, 4)];
			$tray.append($("<div>").addClass("jt-image")
				.css('background-image', "url(" + gd.image + ")")
				.attr('id', "cf-tray-" + item)
				.on('click', onTrayClick)
			);
			$("#cf-\\" + item).addClass("cf-tray-selected");
		});
		$dict.html(L['searching']);
		$rew.empty();
		$stage.dialog.cfCompose.removeClass("cf-composable");
		$cost.html("");
		tryDict(word, function(res){
			var blend = false;
			
			if(res.error){
				if(word.length == 3){
					blend = true;
					$dict.html(L['cfBlend']);
				}else return $dict.html(L['wpFail_' + res.error]);
			}
			viewReward(word, level, blend);
			$stage.dialog.cfCompose.addClass("cf-composable");
			if(!res.error) $dict.html(processWord(res.word, res.mean, res.theme, res.type.split(',')));
		}, 2);
		if(word == "") trayEmpty();
	}
	function viewReward(text, level, blend){
		$.get("/cf/" + text + "?l=" + level + "&b=" + (blend ? "1" : ""), function(res){
			if(res.error) return fail(res.error);
			
			$rew.empty();
			res.data.forEach(function(item){
				var bd = iGoods(item.key);
				var rt = (item.rate >= 1) ? L['cfRewAlways'] : ((item.rate * 100).toFixed(1) + '%');
				
				$rew.append($("<div>").addClass("cf-rew-item")
					.append($("<div>").addClass("jt-image cf-rew-image")
						.css('background-image', "url(" + bd.image + ")")
					)
					.append($("<div>").width(100)
						.append($("<div>").width(100).html(bd.name))
						.append($("<div>").addClass("cf-rew-value").html("x" + item.value))
					)
					.append($("<div>").addClass("cf-rew-rate").html(rt))
				);
			});
			$cost.html(L['cfCost'] + ": " + res.cost + L['ping']);
		});
	}
	function onTrayClick(e){
		var id = $(e.currentTarget).attr('id').slice(8);
		var bi = $data._tray.indexOf(id);
		
		if(bi == -1) return;
		$data._tray.splice(bi, 1);
		drawCFTray();
	}
	trayEmpty();
}
function Ranking(data, res){
	var $board = $stage.dialog.lbTable.empty();
	var fr = data.data[0] ? data.data[0].rank : 0;
	var page = (data.page || Math.floor(fr / 15)) + 1;
	showDialog($stage.dialog.leaderboard, true);
	data.data.forEach(function(item, index){
		if(res.list[index] == null) var jas = true;
		else var jas = false;
		if(!jas) var jk = res.list[index].prev;
		else var jk = 0;
		if(!jk) jk = 0;
		else jk = jk - (item.rank + 1);
		if(jk == 0) jk = '-';
		else if(jk > 0) jk = '<b><font color="red">▲ ' + jk + '</font></b>';
		else if(jk < 0) jk = '<b><font color="blue">▼ ' + (jk * -1) + '</font></b>';
		if(!jas) var profile = res.list[index].nick;
		else var profile = null;
		if(profile == null || profile == undefined) profile = L['hidden'];
		else if(profile.replace(/\s/g, '') == '') profile = L['hidden'];
		item.score = Number(item.score);
		var lvs = getLevel(item.score);
		var gg = lvs > 1000;
		if(String($data.id) == String(item.id)){
			$board.append($("<tr>").attr('id', "ranking-" + item.id)
				.addClass("ranking-" + (item.rank + 1))
				.addClass("ranking-me")
				.append($("<td>").html(item.rank + 1))
				.append($("<td>")
					.append(getLevelImage(item.score).addClass("ranking-image"))
					.append($("<label>").css('padding-top', 2).html(gg ? getLevelNameS(lvs) : lvs))
				)
				.append($("<td>").html(profile))
				.append($("<td>").html(commify(item.score)))
				//.append($("<td>").html(jk))
			);
		}else{
			$board.append($("<tr>").attr('id', "ranking-" + item.id)
				.addClass("ranking-" + (item.rank + 1))
				.append($("<td>").html(item.rank + 1))
				.append($("<td>")
					.append(getLevelImage(item.score).addClass("ranking-image"))
					.append($("<label>").css('padding-top', 2).html(gg ? getLevelNameS(lvs) : lvs))
				)
				.append($("<td>").html(profile))
				.append($("<td>").html(commify(item.score)))
				//.append($("<td>").html(jk))
			);
		}
	});
	$stage.dialog.lbPage.html(L['page'] + " " + page);
	$stage.dialog.lbPrev.attr('disabled', page <= 1);
	$stage.dialog.lbNext.attr('disabled', data.data.length < 15);
	$stage.dialog.lbMe.attr('disabled', !!$data.guest);
	$data._lbpage = page - 1;
}
function Myeong(data, res){
	console.log(data);
	var $board = $stage.dialog.lbTable.empty();
	console.log(res);
	showDialog($stage.dialog.leaderboard, true);
	var fr = data.data[0] ? data.data[0].rank : 0;
	var page = (data.page || Math.floor(fr / 15)) + 1;
	data.data.forEach(function(item, index){
		if(res.list[index] == null) var jas = true;
		else var jas = false;
		if(!jas) var jk = res.list[index].prev;
		else var jk = 0;
		if(!jk) jk = 0;
		else jk = jk - (item.rank + 1);
		if(jk == 0) jk = '-';
		else if(jk > 0) jk = '<b><font color="red">▲ ' + jk + '</font></b>';
		else if(jk < 0) jk = '<b><font color="blue">▼ ' + (jk * -1) + '</font></b>';
		if(!jas) var profile = res.list[index].nick;
		else var profile = null;
		if(profile == null || profile == undefined) profile = L['hidden'];
		else if(profile.replace(/\s/g, '') == '') profile = L['hidden'];
		item.score = Number(item.score);
		var lvs = getLevel(item.score);
		var gg = lvs > 1000;
		if(String($data.id) == String(item.id)){
			$board.append($("<tr>").attr('id', "ranking-" + item.id)
				.addClass("ranking-" + (item.rank + 1))
				.addClass("ranking-me")
				.append($("<td>").html(item.rank + 1))
				.append($("<td>")
					.append((cdn + getLevelImage(item.score)).addClass("ranking-image"))
					.append($("<label>").css('padding-top', 2).html(gg ? getLevelNameS(lvs) : lvs))
				)
				.append($("<td>").html(profile))
				.append($("<td>").html(commify(item.score)))
				.append($("<td>").html(jk))
			);
		}else{
			$board.append($("<tr>").attr('id', "ranking-" + item.id)
				.addClass("ranking-" + (item.rank + 1))
				.append($("<td>").html(item.rank + 1))
				.append($("<td>")
					.append((cdn+getLevelImage(item.score)).addClass("ranking-image"))
					.append($("<label>").css('padding-top', 2).html(gg ? getLevelNameS(lvs) : lvs))
				)
				.append($("<td>").html(profile))
				.append($("<td>").html(commify(item.score)))
				.append($("<td>").html(jk))
			);
		}
	});
	$stage.dialog.lbPage.html(L['page'] + " " + page);
	$stage.dialog.lbPrev.attr('disabled', page <= 1);
	$stage.dialog.lbNext.attr('disabled', data.data.length < 15);
	$stage.dialog.lbMe.attr('disabled', !!$data.guest);
	$data._lbpage = page - 1;
}
function drawLeaderboard(data, typ, cod){
	var $board = $stage.dialog.lbTable.empty();
	var fr = data.data[0] ? data.data[0].rank : 0;
	var page = (data.page || Math.floor(fr / 15)) + 1;
	var routes;
	if(cod){
		if(cod == 2) routes = "/ranknik?p=" + typ;
		else if(cod == 1) routes = "/ranknik?id=" + typ;
	}else routes = "/ranknik?p=0";
	$.get(routes, function(res){
		data.data.forEach(function(item, index){
			/*	CODE 설명:
				2: PAGE 검색
				1: ID 검색
				없음: 1페
			*/
				
			/*var iid = item.id
			var iarr = iid.split('*');
			var itid = iarr[0];
			var itnk = decodeURI(iarr[1]);
			var profile = $data.users[itid];
			if(profile) profile = profile.nickname;
			else profile = L['hidden'];
			var nick;
			$.get("/getnickname/" + item.id), function(res){
				nick = res;
			});
			//if(nick == null) nick = L['hidden'];
			var itnn = itnk.replace(/\s/g, "");
			if(!profile && itnn == "") profile = L['hidden'];
			else if(profile) profile = profile.nickname;
			else profile = itnk;*/
			// var profile = $data.users[item.id];
			/*if(profile) profile = profile.nickname;
			else profile = L['hidden'];*/
			if(res.list[index] == null) var jas = true;
			else var jas = false;
			if(!jas) var jk = res.list[index].prev;
			else var jk = 0;
			if(!jk) jk = 0;
			else jk = jk - (item.rank + 1);
			if(jk == 0) jk = '-';
			else if(jk > 0) jk = '<b><font color="red">▲ ' + jk + '</font></b>';
			else if(jk < 0) jk = '<b><font color="blue">▼ ' + (jk * -1) + '</font></b>';
			if(!jas) var profile = res.list[index].nick;
			else var profile = null;
			if(profile == null || profile == undefined) profile = L['hidden'];
			else if(profile.replace(/\s/g, '') == '') profile = L['hidden'];
			item.score = Number(item.score);
			var lvs = getLevel(item.score);
			var gg = lvs > 1000;
			if(String($data.id) == String(item.id)){
				$board.append($("<tr>").attr('id', "ranking-" + item.id)
					.addClass("ranking-" + (item.rank + 1))
					.addClass("ranking-me")
					.append($("<td>").html(item.rank + 1))
					.append($("<td>")
						.append(getLevelImage(item.score).addClass("ranking-image"))
						.append($("<label>").css('padding-top', 2).html(gg ? getLevelNameS(lvs) : lvs))
					)
					.append($("<td>").html(profile))
					.append($("<td>").html(commify(item.score)))
					.append($("<td>").html(jk))
				);
			}else{
				$board.append($("<tr>").attr('id', "ranking-" + item.id)
					.addClass("ranking-" + (item.rank + 1))
					.append($("<td>").html(item.rank + 1))
					.append($("<td>")
						.append(getLevelImage(item.score).addClass("ranking-image"))
						.append($("<label>").css('padding-top', 2).html(gg ? getLevelNameS(lvs) : lvs))
					)
					.append($("<td>").html(profile))
					.append($("<td>").html(commify(item.score)))
					.append($("<td>").html(jk))
				);
			}
		});
	});
	//$("#ranking-" + $data.id).addClass("ranking-me");
	$stage.dialog.lbPage.html(L['page'] + " " + page);
	$stage.dialog.lbPrev.attr('disabled', page <= 1);
	$stage.dialog.lbNext.attr('disabled', data.data.length < 15);
	$stage.dialog.lbMe.attr('disabled', !!$data.guest);
	$data._lbpage = page - 1;
}
function drawPingboard(data, typ, cod){
	var $board = $stage.dialog.pbTable.empty();
	var fr = data.data[0] ? data.data[0].rank : 0;
	var page = (data.page || Math.floor(fr / 15)) + 1;
	var routes;
	if(cod){
		if(cod == 2) routes = "/pgnik?p=" + typ;
		else if(cod == 1) routes = "/pgnik?id=" + typ;
	}else routes = "/pgnik?p=0";
	$.get(routes, function(res){
		data.data.forEach(function(item, index){
			/*	CODE 설명:
				0: PAGE 검색
				1: ID 검색
				없음: 1페
			*/
			var profile = res.list[index];
			if(profile == null || profile == undefined) profile = L['hidden'];
			else if(profile.replace(/\s/g, '') == '') profile = L['hidden'];
			item.score = Number(item.score);
			var lvs = getPL(item.score);
			$board.append($("<tr>").attr('id', "ping-" + item.id)
				.addClass("ping-" + (item.rank + 1))
				.append($("<td>").html(item.rank + 1))
				.append($("<td>")
					.append(getPImage(item.score).addClass("ping-image"))
					.append($("<label>").css('padding-top', 2).html(lvs))
				)
				.append($("<td>").html(profile))
				.append($("<td>").html(commify(item.score)))
			);
		});
	});
	$("#ping-" + $data.id).addClass("ping-me");
	$stage.dialog.pbPage.html(L['page'] + " " + page);
	$stage.dialog.pbPrev.attr('disabled', page <= 1);
	$stage.dialog.pbNext.attr('disabled', data.data.length < 15);
	$stage.dialog.pbMe.attr('disabled', !!$data.guest);
	$data._pbpage = page - 1;
}
function drawMyeongboard(data, typ, cod){
	var $board = $stage.dialog.mbTable.empty();
	var fr = data.data[0] ? data.data[0].rank : 0;
	var page = (data.page || Math.floor(fr / 15)) + 1;
	var routes;
	if(cod){
		if(cod == 2) routes = "/mygnick?p=" + typ;
		else if(cod == 1) routes = "/mygnick?id=" + typ;
	}else routes = "/mygnick?p=0";
	$.get(routes, function(res){
		data.data.forEach(function(item, index){
			/*	CODE 설명:
				0: PAGE 검색
				1: ID 검색
				없음: 1페
			*/
			/*var iid = item.id
			var iarr = iid.split('*');
			var itid = iarr[0];
			var itnk = decodeURI(iarr[1]);
			var profile = $data.users[itid];
			if(profile) profile = profile.nickname;
			else profile = L['hidden'];
			var nick;
			$.get("/getnickname/" + item.id), function(res){
				nick = res;
			});
			//if(nick == null) nick = L['hidden'];
			var itnn = itnk.replace(/\s/g, "");
			if(!profile && itnn == "") profile = L['hidden'];
			else if(profile) profile = profile.nickname;
			else profile = itnk;*/
			//var profile = $data.users[item.id];
			/*if(profile) profile = profile.nickname;
			else profile = L['hidden'];*/
			var profile = res.list[index];
			if(profile == null || profile == undefined) profile = L['hidden'];
			else if(profile.replace(/\s/g, '') == '') profile = L['hidden'];
			item.score = Number(item.score);
			var lvs = getLevel(item.score);
			var gg = lvs > 1000;
			$board.append($("<tr>").attr('id', "myeong-" + item.id)
				.addClass("myeong-" + (item.rank + 1))
				.append($("<td>").html(item.rank + 1))
				.append($("<td>")
					.append(getLevelImage(item.score).addClass("myeong-image"))
					.append($("<label>").css('padding-top', 2).html(gg ? getLevelNameS(lvs) : lvs))
				)
				.append($("<td>").html(profile))
				.append($("<td>").html(commify(item.score)))
			);
		});
	});
	$("#myeong-" + $data.id).addClass("myeong-me");
	$stage.dialog.mbPage.html(L['page'] + " " + page);
	$stage.dialog.mbPrev.attr('disabled', page <= 1);
	$stage.dialog.mbNext.attr('disabled', data.data.length < 15);
	$stage.dialog.mbMe.attr('disabled', !!$data.guest);
	$data._mbpage = page - 1;
}
/*function drawMyeongboard(data){
	var $board = $stage.dialog.mbTable.empty();
	var fr = data.data[0] ? data.data[0].rank : 0;
	var page = (data.page || Math.floor(fr / 20)) + 1;
	
	data.data.forEach(function(item, index){
		var profile = $data.users[item.id];
		if(profile) profile = profile.nickname;
		else profile = L['hidden'];
		item.score = Number(item.score);
		var lvs = getLevel(item.score);
		var gg = lvs > 750;
		$board.append($("<tr>").attr('id', "myeong-" + item.id)
			.addClass("myeong-" + (item.rank + 1))
			.append($("<td>").html(item.rank + 1))
			.append($("<td>")
				.append(getLevelImage(item.score, item.id).addClass("myeong-image"))
				.append($("<label>").css('padding-top', 2).html(gg ? getLevelNameS(lvs) : lvs))
			)
			.append($("<td>").html(profile))
			.append($("<td>").html(commify(item.score)))
		);
	});
	$("#myeong-" + $data.id).addClass("myeong-me");
	$stage.dialog.mbPage.html(L['page'] + " " + page);
	$stage.dialog.mbPrev.attr('disabled', page <= 1);
	$stage.dialog.mbNext.attr('disabled', data.data.length < 15);
	$stage.dialog.mbMe.attr('disabled', !!$data.guest);
	$data._mbpage = page - 1;
}*/
function updateKeyword(){
	var i, o, p, memo;
	var len = 0;
	var jk;
	var ck = $.cookie('kkw');
	if(!ck || ck == ""){
		jk = true;
		ck = [];
	}else ck = decodeURIComponent(ck);
	var keywords = jk ? ck : ck.split(',');
	$stage.dialog.keywords.empty();
	for(i in keywords){
		len++;
		memo = keywords[i];
		
		$stage.dialog.keywords.append($("<div>").addClass("kw-item").attr('id', "kwi-" + len)
			.append($("<div>").addClass("kwi-memo ellipse").text(memo))
			.append($("<div>").addClass("kwi-menu"))
		);
	}
	$("#KeywordDiag .dialog-title").html('키워드 (' + len + " / 50)");
}
function updateCommunity(){
	updatenik();
	var i, o, p, memo;
	var len = 0;
	var online = 0;

	$stage.dialog.commFriends.empty();
	for(i in $data.friends){
		len++;
		memo = $data.friends[i];
		o = $data._friends[i] || {};
		p = ($data.users[i] || {}).profile;
		if(o) if(o.server) online++;
		
		$stage.dialog.commFriends.append($("<div>").addClass("cf-item").attr('id', "cfi-" + i)
			.append($("<div>").addClass("cfi-status cfi-stat-" + (o.server ? 'on' : 'off')))
			.append($("<div>").addClass("cfi-server").html(o.server ? L['server_' + o.server] : "-"))
			.append($("<div>").addClass("cfi-name ellipse").html(p ? ($data.users[i].nickname || p.title) : L['hidden']))
			.append($("<div>").addClass("cfi-memo ellipse").text(memo))
			.append($("<div>").addClass("cfi-menu")
				.append($("<i>").addClass("fa fa-pencil").on('click', requestEditMemo))
				.append($("<i>").addClass("fa fa-remove").on('click', requestRemoveFriend))
			)
		);
	}
	function requestEditMemo(e){
		var id = $(e.currentTarget).parent().parent().attr('id').slice(4);
		var kemu = $data.friends[id];
		/*var memo = prompt(L['friendEditMemo'], _memo);
		
		if(!memo) return;
		send('friendEdit', { id: id, memo: memo }, true);*/
		pfInput(L['friendEditMemo'], function(){ var memo = $('#pinput-in').val(); if(memo.replace(/\s/g, '') == ''){ return; }else{ send('friendEdit', { id: id, memo: memo }, true);  }}, noFunc, 0, kemu);
	}
	function requestRemoveFriend(e){
		var id = $(e.currentTarget).parent().parent().attr('id').slice(4);
		var memo = $data.friends[id];
		try{
			var kj = $data._friends[id].server;
		}catch(err){
			var kj = false;
		}
		if(kj) return fail(455);
		//if(!confirm(memo + "(#" + id.substr(0, 5) + ")\n" + L['friendSureRemove'])) return;
		pfConfirm(L['friendSureRemove'], function(){ send('friendRemove', { id: id }, true); });
	}
	$("#CommunityDiag .dialog-title").html(L['communityText'] + " (" + len + " / 100, " + online + "명 접속 중)");
}
function updatenik(){
	var i, o, p, memo;
	var len = 0;


	$stage.dialog.unlist.empty();
	for(i in $data.friends){
		len++;
		memo = $data.friends[i];
		o = $data._friends[i] || {};
		p = ($data.users[i] || {}).profile;
		
		$stage.dialog.unlist.append($("<div>").addClass("nu-item").attr('id', "nui-" + i)
			.append($("<div>").addClass("nui-name ellipse").html(p ? (p.title || p.name) : L['hidden']))
			.append($("<div>").addClass("nui-memo ellipse").text(memo))
			.append($("<div>").addClass("nui-menu")
				.append($("<i>").addClass("fa fa-pencil").on('click', requestEditNik))
				.append($("<i>").addClass("fa fa-remove").on('click', removenick))
			)
		);
	}
	function requestEditNik(e){
		var id = $(e.currentTarget).parent().parent().attr('id').slice(4);
		var _memo = $data.friends[id];
		var memo = prompt(L['friendEditMemo'], _memo);
		
		if(!memo) return;
		return;
	}
	function removenick(e){
		var id = $(e.currentTarget).parent().parent().attr('id').slice(4);
		var memo = $data.friends[id];
		try{
			var kj = $data._friends[id].server;
		}catch(err){
			var kj = false;
		}
		if(kj) return fail(455);
		if(!confirm(memo + "(#" + id.substr(0, 5) + ")\n" + L['friendSureRemove'])) return;
		return;
	}
	$("#NicksetDiag .dialog-title").html("사용자 (" + len + " / 100)");
}
function requestRoomInfo(id){
	var o = $data.rooms[id];
	var $pls = $("#ri-players").empty();
	var opts = getOptions(o.mode, o.opts);
	$data._roominfo = id;
	opts.splice(0, 1);
	if(opts.length < 1) opts = [ '없음' ];
	$("#RoomInfoDiag .dialog-title").html(id + L['sRoomInfo']);
	$("#ri-title").html((o.password ? "<i class='fa fa-lock'></i>&nbsp;" : "") + o.title);
	$("#ri-mode").html(L['mode' + MODE[o.mode]]);
	$("#ri-round").html(o.round + ", " + o.time + L['SECOND']);
	$("#ri-misc").html(opts.join(" / ").toString());
	$("#ri-limit").html(o.players.length + " / " + o.limit);
	o.players.forEach(function(p, i){
		var $p, $moremi;
		var rd = o.readies[p] || {};
		
		p = $data.users[p] || NULL_USER;
		if(o.players[i].robot){
			p.profile = { title: L['robot'] };
			p.equip = { robot: true };
			p.nickname = L['robot'];
		}else rd.t = rd.t || 0;
		
		$pls.append($("<div>").addClass("ri-player")
			.append($moremi = $("<div>").addClass("moremi rip-moremi"))
			.append($p = $("<div>").addClass("ellipse rip-title").html(p.nickname))
			.append($("<div>").addClass("rip-team team-" + rd.t).html($("#team-" + rd.t).html()))
			.append($("<div>").addClass("rip-form").html(L['pform_' + rd.f]))
		);
		if(p.id == o.master) $p.prepend($("<label>").addClass("rip-master").html("[" + L['master'] + "]&nbsp;"));
		$p.prepend(getLevelImage(p.data.score, p.equip).addClass("profile-level rip-level"));
		
		renderMoremi($moremi, p.equip);
	});
	showDialog($stage.dialog.roomInfo);
	$stage.dialog.roomInfo.show();
}
function requestProfile(id){
	var o = $data.users[id] || $data.robots[id];
	var $rec = $("#profile-record").empty();
	var $pi, $ex;
	var i;
	
	if(!o){
		notice(L['error_405']);
		return;
	}
	var i = getLevel(o.data.score);
	var gg = i > 1000 /* || o.equip["STY"] === "b1_gm"*/;
	var ml = $data.opts.ml;
	var rq = $data.opts.rq;
	var prev = EXP[i - 2] || 0;
	var goal = EXP[i - 1];
	var gls = (o.data.score-prev)/(goal-prev) * 100;
	var ss = ml ? o.data.score / 50000000 * 100 : gls;
	ss = ss.toFixed(2);
	var jl = o.data.score < 0;
	if(!$data.opts.rq){
		$("#ProfileDiag .dialog-title").html(o.nickname + L['sProfile']);
		$(".profile-head").empty().append($pi = $("<div>").addClass("moremi profile-moremi"))
			.append($("<div>").addClass("profile-head-item")
				//.append(getImage(o.profile.image).addClass("profile-image"))
				.append($("<div>").addClass("profile-title ellipse").html(o.nickname)
					.append($("<label>").addClass("profile-tag").html(" #" + o.id.toString().substr(0, 5)))
				)
			)
			.append($("<div>").addClass("profile-head-item")
				.append(getLevelImage(o.data.score, o.equip).addClass("profile-level"))
				.append($("<div>").addClass("profile-level-text").html(gg ? getLevelName(i) : L['LEVEL'] + " " + i))
				.append($("<div>").addClass("profile-score-text").html(ml ? commify(o.data.score) + " / " + commify(50000000) + L['PTS'] + " [" + ss + "%]" : commify(o.data.score) + " / " + commify(EXP[i - 1]) + L['PTS'] + " [" + ss + "%]"))
			)
			.append($ex = $("<div>").addClass("profile-head-item profile-exordial ellipse").text(badWords(o.exordial || ""))
				.append($("<div>").addClass("expl").css({ 'white-space': "normal", 'width': 300, 'font-size': "11px" }).text(o.exordial))
			);
	}else{
		$("#ProfileDiag .dialog-title").html(o.nickname + L['sProfile']);
		$(".profile-head").empty().append($pi = $("<div>").addClass("moremi profile-moremi"))
			.append($("<div>").addClass("profile-head-item")
				//.append(getImage(o.profile.image).addClass("profile-image"))
				.append($("<div>").addClass("profile-title ellipse").html(o.nickname)
					.append($("<label>").addClass("profile-tag").html(" #" + o.id.toString().substr(0, 5)))
				)
			)
			.append($("<div>").addClass("profile-head-item")
				.append(getLevelImage(o.data.score, o.equip).addClass("profile-level"))
				.append($("<div>").addClass("profile-level-text").html(gg ? getLevelName(i) : L['LEVEL'] + " " + i))
				.append($("<div>").addClass("profile-score-text").html(jl ? commify(o.data.score) + " / " + '0' + L['PTS'] + " [0.00%]" : commify(o.data.score-prev) + " / " + commify(goal-prev) + L['PTS'] + " [" + ss + "%]"))
			)
			.append($ex = $("<div>").addClass("profile-head-item profile-exordial ellipse").text(badWords(o.exordial || ""))
				.append($("<div>").addClass("expl").css({ 'white-space': "normal", 'width': 300, 'font-size': "11px" }).text(o.exordial))
			);
	}
	if(jl && !$data.opts.ml){
		$rec = $("#profile-record").empty();
		$("#ProfileDiag .dialog-title").html(o.nickname + L['sProfile']);
		$(".profile-head").empty().append($pi = $("<div>").addClass("moremi profile-moremi"))
			.append($("<div>").addClass("profile-head-item")
				//.append(getImage(o.profile.image).addClass("profile-image"))
				.append($("<div>").addClass("profile-title ellipse").html(o.nickname)
					.append($("<label>").addClass("profile-tag").html(" #" + o.id.toString().substr(0, 5)))
				)
			)
			.append($("<div>").addClass("profile-head-item")
				.append(getLevelImage(o.data.score, o.equip).addClass("profile-level"))
				.append($("<div>").addClass("profile-level-text").html(gg ? getLevelName(i) : L['LEVEL'] + " " + i))
				.append($("<div>").addClass("profile-score-text").html(commify(o.data.score) + " / " + '0' + L['PTS'] + " [0.00%]"))
			)
			.append($ex = $("<div>").addClass("profile-head-item profile-exordial ellipse").text(badWords(o.exordial || ""))
				.append($("<div>").addClass("expl").css({ 'white-space': "normal", 'width': 300, 'font-size': "11px" }).text(o.exordial))
			);
	}
	if(o.robot){
		$stage.dialog.profileLevel.show();
		$stage.dialog.profileLevel.prop('disabled', $data.id != $data.room.master);
		$("#profile-place").html($data.room.id + L['roomNumber']);
	}else{
		$stage.dialog.profileLevel.hide();
		$("#profile-place").html(o.place ? (o.place + L['roomNumber']) : L['lobby']);
		for(i in o.data.record){
			var r = o.data.record[i];
			var pc = r[1]
			var pp = r[0]
			if(pp != 0){
				var pa = pc / pp;
				var pct = pa * 100
				var pcn = pct.toFixed(2);
			} else {
				var pcn = "0.00";
			}
			$rec.append($("<div>").addClass("profile-record-field")
				.append($("<div>").addClass("profile-field-name").html(L['mode' + i]))
				.append($("<div>").addClass("profile-field-record").html(r[0] + L['P'] + " " + r[1] + L['W']))
				.append($("<div>").addClass("profile-field-record").html(String(pcn) + '%'))
				.append($("<div>").addClass("profile-field-score").html(commify(r[2]) + L['PTS']))
			);
		}
		renderMoremi($pi, o.equip);
	}
	$data._profiled = id;
	$stage.dialog.profileKick.hide();
	$stage.dialog.profileShut.hide();
	$stage.dialog.profileDress.hide();
	$stage.dialog.profileWhisper.hide();
	$stage.dialog.profileHandover.hide();
	$stage.dialog.profileReport.hide();
	
	if($data.id == id) $stage.dialog.profileDress.show();
	else if(!o.robot){
		$stage.dialog.profileShut.show();
		$stage.dialog.profileWhisper.show();
		$stage.dialog.profileReport.show();
	}
	if($data.room){
		if($data.id != id && $data.id == $data.room.master){
			$stage.dialog.profileKick.show();
			if(!o.robot) $stage.dialog.profileHandover.show();
			$stage.dialog.profileShut.hide();
		}
	}
	showDialog($stage.dialog.profile);
	$stage.dialog.profile.show();
	global.expl($ex);
}
function requestInvite(id){
	var nick;
	
	if(id != "AI"){
		nick = $data.users[id].nickname;
		/*if(mobile){
			if(!confirm(nick + L['sureInvite'])) return;
			else send('invite', { target: id });
		}else{*/
		pfConfirm(nick + L['sureInvite'], function(){ send('invite', { target: id }); });
		//}
	}else send('invite', { target: id });
}
function checkFailCombo(id){
	if(!$data._replay && $data.lastFail == $data.id && $data.id == id){
		$data.failCombo++;
		if($data.failCombo == 1) notice(L['trollWarning']);
		if($data.failCombo > 1){
			send('leave');
			fail(437);
		}
	}else{
		$data.failCombo = 0;
	}
	$data.lastFail = id;
}
function clearGame(){
	if($data._spaced) $lib.Typing.spaceOff();
	clearInterval($data._tTime);
	$data._relay = false;
}
function gameReady(){
	var i, u;
	
	for(i in $data.room.players){
		try{
			if($data._replay){
				u = $rec.users[$data.room.players[i]] || $data.room.players[i];
			}else{
				u = $data.users[$data.room.players[i]] || $data.robots[$data.room.players[i].id];
			}
			u.game.score = 0;
			delete $data["_s"+$data.room.players[i]];
		}catch(e){
			continue;
		}
	}
	delete $data.lastFail;
	$data.failCombo = 0;
	$data._spectate = $data.room.game.seq.indexOf($data.id) == -1;
	$data._gAnim = true;
	$stage.box.room.show().height(360).animate({ 'height': 1 }, 500);
	$stage.box.game.height(1).animate({ 'height': 410 }, 500);
	stopBGM();
	$stage.dialog.resultSave.attr('disabled', false);
	clearBoard();
	$stage.game.display.html(L['soon']);
	playSound('game_start', false, $data.room.opts.faster);
	forkChat();
	addTimeout(function(){
		$stage.box.room.height(360).hide();
		$stage.chat.scrollTop(999999999);
	}, 500);
}
function replayPrevInit(){
	var i;
	
	for(i in $data.room.game.seq){
		if($data.room.game.seq[i].robot){
			$data.room.game.seq[i].game.score = 0;
		}
	}
	$rec.users = {};
	for(i in $rec.players){
		var id = $rec.players[i].id;
		var rd = $rec.readies[id] || {};
		var u = $data.users[id] || $data.robots[id];
		var po = id;
		
		if($rec.players[i].robot){
			u = $rec.users[id] = { robot: true };
			po = $rec.players[i];
			po.game = {};
		}else{
			u = $rec.users[id] = {};
		}
		$data.room.players.push(po);
		u.id = po;
		u.profile = $rec.players[i];
		u.data = u.profile.data;
		u.equip = u.profile.equip;
		u.game = { score: 0, team: rd.t };
	}
	$data._rf = 0;
}
function replayReady(){
	var i;
	
	replayStop();
	$data._replay = true;
	$data.room = {
		title: $rec.title,
		players: [],
		events: [],
		time: $rec.roundTime,
		round: $rec.round,
		mode: $rec.mode,
		limit: $rec.limit,
		game: $rec.game,
		opts: $rec.opts,
		readies: $rec.readies
	};
	replayPrevInit();
	for(i in $rec.events){
		$data.room.events.push($rec.events[i]);
	}
	$stage.box.userList.hide();
	$stage.box.roomList.hide();
	$stage.box.game.show();
	$stage.dialog.replay.hide();
	gameReady();
	updateRoom(true);
	$data.$gp = $(".GameBox .product-title").empty()
		.append($data.$gpt = $("<div>").addClass("game-replay-title"))
		.append($data.$gpc = $("<div>").addClass("game-replay-controller")
			.append($("<button>").html(L['replayNext']).on('click', replayNext))
			.append($("<button>").html(L['replayPause']).on('click', replayPause))
			.append($("<button>").html(L['replayPrev']).on('click', replayPrev))
		);
	$data._gpp = L['replay'] + " - " + (new Date($rec.time)).toLocaleString();
	$data._gtt = $data.room.events[$data.room.events.length - 1].time;
	$data._eventTime = 0;
	$data._rt = addTimeout(replayTick, 2000);
	$data._rprev = 0;
	$data._rpause = false;
	replayStatus();
}
function replayPrev(e){
	var ev = $data.room.events[--$data._rf];
	var c;
	var to;
	
	if(!ev) return;
	c = ev.time;
	do{
		if(!(ev = $data.room.events[--$data._rf])) break;
	}while(c - ev.time < 1000);
	
	to = $data._rf - 1;
	replayPrevInit();
	c = $data.muteEff;
	$data.muteEff = 0;
	for(i=0; i<to; i++){
		replayTick();
	}
	$(".deltaScore").remove();
	$data.muteEff = c;
	replayTick();
	/*var pev, ev = $data.room.events[--$data._rf];
	var c;
	
	if(!ev) return;
	
	c = ev.time;
	clearTimeout($data._rt);
	do{
		if(ev.data.type == 'turnStart'){
			$(".game-user-current").removeClass("game-user-current");
			if((pev = $data.room.events[$data._rf - 1]).data.profile) $("#game-user-" + pev.data.profile.id).addClass("game-user-current");
		}
		if(ev.data.type == 'turnEnd'){
			$stage.game.chain.html(--$data.chain);
			if(ev.data.profile){
				addScore(ev.data.profile.id, -(ev.data.score + ev.data.bonus));
				updateScore(ev.data.profile.id, getScore(ev.data.profile.id));
			}
		}
		if(!(ev = $data.room.events[--$data._rf])) break;
	}while(c - ev.time < 1000);
	if($data._rf < 0) $data._rf = 0;
	if(ev) if(ev.data.type == 'roundReady'){
		$(".game-user-current").removeClass("game-user-current");
	}
	replayTick(true);*/
}
function replayPause(e){
	var p = $data._rpause = !$data._rpause;
	
	$(e.target).html(p ? L['replayResume'] : L['replayPause']);
}
function replayNext(e){
	clearTimeout($data._rt);
	replayTick();
}
function replayStatus(){
	$data.$gpt.html($data._gpp
		+ " (" + ($data._eventTime * 0.001).toFixed(1) + L['SECOND']
		+ " / " + ($data._gtt * 0.001).toFixed(1) + L['SECOND']
		+ ")"
	);
}
function replayTick(stay){
	var event = $data.room.events[$data._rf];
	var args, i;
	
	clearTimeout($data._rt);
	if(!stay) $data._rf++;
	if(!event){
		replayStop();
		return;
	}
	if($data._rpause){
		$data._rf--;
		return $data._rt = addTimeout(replayTick, 100);
	}
	args = event.data;
	if(args.hint) args.hint = { _id: args.hint };
	if(args.type == 'chat') args.timestamp = $rec.time + event.time;
	
	onMessage(args);
	
	$data._eventTime = event.time;
	replayStatus();
	if($data.room.events.length > $data._rf) $data._rt = addTimeout(replayTick,
		$data.room.events[$data._rf].time - event.time
	);
	else replayStop();
}
function replayStop(){
	delete $data.room;
	$data._replay = false;
	$stage.box.room.height(360);
	clearTimeout($data._rt);
	updateUI();
	$data.bgm = playBGM($data.opts.bg);
}
/*var bgmAutoPlay = _setInterval(function(){ if(!$data.bgm && isWelcome){
		$data.bgm = playBGM($data.opts.bg);
		clearInterval(bgmAutoPlay);
	}
}, 100)*/
function startRecord(title){
	var i, u;
	
	$rec = {
		version: $data.version,
		me: $data.id,
		players: [],
		events: [],
		title: $data.room.title,
		roundTime: $data.room.time,
		round: $data.room.round,
		mode: $data.room.mode,
		limit: $data.room.limit,
		game: $data.room.game,
		opts: $data.room.opts,
		readies: $data.room.readies,
		time: (new Date()).getTime()
	};
	for(i in $data.room.players){
		var o;
		
		u = $data.users[$data.room.players[i]] || $data.room.players[i];
		o = { id: u.id, score: 0 };
		if(u.robot){
			o.id = u.id;
			o.robot = true;
			o.data = { score: 0 };
			u = { profile: getAIProfile(u.level) };
			u.nickname = u.profile.title;
		}else{
			o.data = u.data;
			o.equip = u.equip;
		}
		o.title = "#" + u.id; // u.profile.title;
		// o.image = u.profile.image;
		$rec.players.push(o);
	}
	$data._record = true;
}
function stopRecord(){
	$data._record = false;
}
function recordEvent(data){
	if($data._replay) return;
	if(!$rec) return;
	var i, _data = data;

	if(!data.hasOwnProperty('type')) return;
	if(data.type == "room") return;
	if(data.type == "obtain") return;
	data = {};
	for(i in _data) data[i] = _data[i];
	if(data.profile) data.profile = { id: data.profile.id, title: "#" + data.profile.id };
	if(data.user) data.user = { id: data.user.profile.id, profile: { id: data.user.profile.id, title: "#" + data.user.profile.id }, data: { score: 0 }, equip: {} };
	
	$rec.events.push({
		data: data,
		time: (new Date()).getTime() - $rec.time
	});
}
function clearBoard(){
	$data._relay = false;
	loading();
	$stage.game.here.hide();
	$stage.dialog.result.hide();
	$stage.dialog.dress.hide();
	$stage.dialog.charFactory.hide();
	$(".jjoriping,.rounds,.game-body").removeClass("cw");
	$('.jjoriping,.rounds').removeClass('dg');
	$('.rounds').removeClass('painter');
	$stage.game.display.empty();
	$stage.game.chain.hide();
	$stage.game.hints.empty().hide();
	$stage.game.tools.hide();
	$stage.game.cwcmd.hide();
	$stage.game.bb.hide();
	$stage.game.round.empty();
	$stage.game.history.empty();
	$stage.game.items.show().css('opacity', 0);
	$(".jjo-turn-time .graph-bar").width(0).css({ 'float': "", 'text-align': "", 'background-color': "" });
	$(".jjo-round-time .graph-bar").width(0).css({ 'float': "", 'text-align': "" }).removeClass("round-extreme");
	$(".game-user-bomb").removeClass("game-user-bomb");
}
function drawRound(round){
	var i;
	
	$stage.game.round.empty();
	for(i=0; i<$data.room.round; i++){
		$stage.game.round.append($l = $("<label>").html($data.room.game.title[i]));
		if((i+1) == round) $l.addClass("rounds-current");
	}
}
function turnGoing(){
	route("turnGoing");
}
function turnHint(data){
	route("turnHint", data);
}
function turnError(code, text){
	$stage.game.display.empty().append($("<label>").addClass("game-fail-text")
		.text((L['turnError_'+code] ? (L['turnError_'+code] + ": ") : "") + text)
	);
	playSound('fail');
	clearTimeout($data._fail);
	$data._fail = addTimeout(function(){
		$stage.game.display.html($data._char);
	}, 1800);
}
function getScore(id){
	if($data._replay) return $rec.users[id].game.score;
	else return ($data.users[id] || $data.robots[id]).game.score;
}
function addScore(id, score){
	if($data._replay) $rec.users[id].game.score += score;
	else ($data.users[id] || $data.robots[id]).game.score += score;
}
function drawObtainedScore($uc, $sc){
	$uc.append($sc);
	addTimeout(function(){ $sc.remove(); }, 2000);
	
	return $uc;
}
function turnEnd(id, data){
	route("turnEnd", id, data);
}
function roundEnd(result, data){
	if(!data) data = {};
	var i, o, r;
	var $b = $(".result-board").empty();
	var $o, $p;
	var lvUp, sc;
	var addit, addp;
	
	$(".result-me-expl").empty();
	$stage.game.display.html(L['roundEnd']);
	$data._resultPage = 1;
	$data._result = null;
	$data._relay = false;
	for(i in result){
		r = result[i];
		if($data._replay){
			o = $rec.users[r.id];
		}else{
			o = $data.users[r.id];
		}
		if(!o){
			o = NULL_USER;
		}
		if(!o.data) continue;
		if(!r.reward) continue;
		
		r.reward.score = $data._replay ? 0 : Math.round(r.reward.score);
		lvUp = getLevel(sc = o.data.score) > getLevel(o.data.score - r.reward.score);
		
		$b.append($o = $("<div>").addClass("result-board-item")
			.append($p = $("<div>").addClass("result-board-rank").html(r.rank + 1))
			.append(getLevelImage(sc, o.equip).addClass("result-board-level"))
			.append($("<div>").addClass("result-board-name").html(o.nickname))
			.append($("<div>").addClass("result-board-score")
				.html(data.scores ? (L['avg'] + " " + commify(data.scores[r.id]) + L['kpm']) : (commify(r.score || 0) + L['PTS']))
			)
			.append($("<div>").addClass("result-board-reward").html(r.reward.score ? ("+" + commify(r.reward.score)) : "-"))
			.append($("<div>").addClass("result-board-lvup").css('display', lvUp ? "block" : "none")
				.append($("<i>").addClass("fa fa-arrow-up"))
				.append($("<div>").html(L['lvUp']))
			)
		);
		if(o.game.team) $p.addClass("team-" + o.game.team);
		if(r.id == $data.id){
			r.exp = o.data.score - r.reward.score;
			r.level = getLevel(r.exp);
			$data._result = r;
			$o.addClass("result-board-me");
			$(".result-me-expl").append(explainReward(r.reward._score, r.reward._money, r.reward._blog));
		}
	}
	$(".result-me").css('opacity', 0);
	$data._coef = 0;
	if($data._result){
		addit = $data._result.reward.score - $data._result.reward._score;
		addp = $data._result.reward.money - $data._result.reward._money;
		
		$data._result._exp = $data._result.exp;
		$data._result._score = $data._result.reward.score;
		$data._result._bonus = addit;
		$data._result._boing = $data._result.reward._score;
		$data._result._addit = addit;
		$data._result._addp = addp;
		
		if(addit > 0){
			addit = "<label class='result-me-bonus' style='font-size: 6.5px;'>(+" + commify(addit) + ")</label>";
		}else addit = "";
		if(addp > 0){
			addp = "<label class='result-me-bonus' style='font-size: 6.5px;'>(+" + commify(addp) + ")</label>";
		}else addp = "";
		
		notice(L['scoreGain'] + ": " + commify($data._result.reward.score) + ", " + L['moneyGain'] + ": " + commify($data._result.reward.money));
		$(".result-me").css('opacity', 1);
		$(".result-me-score").html(L['scoreGain']+" +"+commify($data._result.reward.score)+addit);
		$(".result-me-money").html(L['moneyGain']+" +"+commify($data._result.reward.money)+addp);
	}
	function roundEndAnimation(first){
		var v, nl;
		var going;
		var findL;
		$data._result.goal = EXP[$data._result.level - 1];
		$data._result.before = EXP[$data._result.level - 2] || 0;
		/*if(first){
			$data._result._before = $data._result.before;
		}*/
		if($data._result.reward.score > 0){
			v = $data._result.reward.score * $data._coef;
			if(v < 0.05 && $data._coef) v = $data._result.reward.score;
			
			$data._result.reward.score -= v;
			$data._result.exp += v;
			nl = getLevel($data._result.exp);
			if($data._result.level != nl){
				$data._result._boing -= $data._result.goal - $data._result._exp;
				$data._result._exp = $data._result.goal;
				playSound('lvup');
				if(nl == 1051) notice("만렙 달성 축하드려요! 지금까지 수고 많으셨습니다. <del>앞으로도 계속 많은 이용 부탁드려요!</del>", "만렙 달성!");
			}
			$data._result.level = nl;
			
			addTimeout(roundEndAnimation, 50);
		}
		going = $data._result.exp - $data._result._exp;
		draw('before', $data._result._exp, $data._result.before, $data._result.goal);
		//draw('current', Math.min(going, $data._result._boing), 0, $data._result.goal - $data._result.before);
		//draw('bonus', Math.max(0, going - $data._result._boing), 0, $data._result.goal - $data._result.before);
		draw('bonus', going, 0, $data._result.goal - $data._result.before);
		var gg = $data._result.level > 1000;
		$(".result-me-level-body").html(gg ? getLevelName($data._result.level) : $data._result.level);
		$(".result-me-score-text").html(commify(Math.round($data._result.exp)) + " / " + commify($data._result.goal));
	}
	function draw(phase, val, before, goal){
		$(".result-me-" + phase + "-bar").width((val - before) / (goal - before) * 100 + "%");
	}
	function explainReward(orgX, orgM, list){
		var $sb, $mb;
		var $R = $("<div>")
			.append($("<h4>").html(L['scoreGain']))
			.append($sb = $("<div>"))
			.append($("<h4>").html(L['moneyGain']))
			.append($mb = $("<div>"));
		
		row($sb, L['scoreOrigin'], orgX);
		row($mb, L['moneyOrigin'], orgM);
		list.forEach(function(item){
			var from = item.charAt(0);
			var type = item.charAt(1);
			var target = item.slice(2, 5);
			var value = Number(item.slice(5));
			var $t, vtx, org;
			
			if(target == 'EXP') $t = $sb, org = orgX;
			else if(target == 'MNY') $t = $mb, org = orgM;
			
			if(type == 'g') vtx = "+" + (org * value).toFixed(1);
			else if(type == 'h') vtx = "+" + Math.floor(value);
			
			row($t, L['bonusFrom_' + from], vtx);
		});
		function row($t, h, b){
			$t.append($("<h5>").addClass("result-me-blog-head").html(h))
				.append($("<h5>").addClass("result-me-blog-body").html(b));
		}
		return $R;
	}
	addTimeout(function(){
		showDialog($stage.dialog.result);
		if($data._result) roundEndAnimation(true);
		$stage.dialog.result.css('opacity', 0).animate({ opacity: 1 }, 500);
		addTimeout(function(){
			$data._coef = 0.05;
		}, 500);
	}, 2000);
	stopRecord();
}
function drawRanking(ranks){
	var $b = $(".result-board").empty();
	var $o, $v;
	var me;
	
	$data._resultPage = 2;
	return $stage.dialog.resultOK.trigger('click');
	/*if(!ranks) return $stage.dialog.resultOK.trigger('click');
	for(i in ranks.list){
		r = ranks.list[i];
		o = $data.users[r.id] || {
			profile: { title: L['hidden'] }
		};
		MainDB.users.findOne(['_id', $p.id ]).on(function($body){
			var pname = $body.nickname;
		});
		var pname = r.nickname;
		me = r.id == $data.id;
		
		$b.append($o = $("<div>").addClass("result-board-item")
			.append($("<div>").addClass("result-board-rank").html(r.rank + 1))
			.append(getLevelImage(r.score, null).addClass("result-board-level"))
			.append($("<div>").addClass("result-board-name").html(pname))
			.append($("<div>").addClass("result-board-score").html(commify(r.score) + L['PTS']))
			.append($("<div>").addClass("result-board-reward").html(""))
			.append($v = $("<div>").addClass("result-board-lvup").css('display', me ? "block" : "none")
				.append($("<i>").addClass("fa fa-arrow-up"))
				.append($("<div>").html(ranks.prev - r.rank))
			)
		);
		
		if(me){
			if(ranks.prev - r.rank <= 0) $v.hide();
			$o.addClass("result-board-me");
		}
	}*/
}
function kickVoting(target){
	var op = $data.users[target].profile;
	
	$("#kick-vote-text").html((op.title || op.name) + L['kickVoteText']);
	$data.kickTime = 0;
	$data._kickTime = 0;
	$data._kickTimer = addTimeout(kickVoteTick, 1);
	//showDialog($stage.dialog.kickVote);
}
function kickVoteTick(){
	/*$(".kick-vote-time .graph-bar").width($data.kickTime / $data._kickTime * 300);
	if(--$data.kickTime > 0) $data._kickTimer = addTimeout(kickVoteTick, 1000);
	else*/
	$stage.dialog.kickVoteY.trigger('click');
}
//분홍꽃 제작 (2320 - 2354)
function searchShop(finditem){
	var $body = $("#shop-shelf");
	$('.shop-categories').show();
	var itemname;
	$body.empty();
	$body.html(L['FINDING']);
	processShop(function(res){
		$body.empty();
		if(res.error){
			$stage.menu.shop.trigger('click');
			return fail(res.error);
		}
		var my = $data.users[$data.id];
		var lvl = my.data.score;
		lvl = getLevel(lvl);
		var lmt;
		res.goods.sort(function(a, b){ return b.updatedAt - a.updatedAt; }).forEach(function(item, index, my){
			if(item.cost < 0 && $data.users[$data.id].equip["STY"] !== "b1_gm") return;
			lmt = item.reqlvl < 0;
			//if(item.isEvent != 0) return;
			if(item.reqlvl > lvl && $data.users[$data.id].equip["STY"] !== "b1_gm") return; //필요레벨이 lvl보다 높다면
			var url = iImage(false, item);
			itemname = iName(item._id, item);
			if(itemname == 0) return;
			itemname = itemname.replace(/\s/g, "");
			if(itemname.indexOf(finditem)==-1) return; //itemname에 finditem 값이 없다면 return;
			$body.append($("<div>").attr('id', "goods_" + item._id).addClass("goods")
				.append($("<div>").addClass("jt-image goods-image").css('background-image', "url(" + url + ")"))
				.append($("<div>").addClass("goods-title").html(iName(item._id, item)))
				.append($("<div>").addClass("goods-cost").html(commify(item.cost) + L['ping']))
				.append(explainGoods(item, false))
			.on('click', onGoods));
		});
		global.expl($body);
	});
	$(".shop-type.selected").removeClass("selected");
	$("#shop-type-all").addClass("selected");
}
/*function loadExc(){
	var $body = $("#exchange-shelf");
	$body.html(L['LOADING']);
	processShop(function(res){
		$body.empty();
		if($data.guest) res.error = 423;
		if(res.error){
			$stage.menu.shop.trigger('click');
			return fail(res.error);
		}
		var my = $data.users[$data.id];
		var lvl = my.data.score;
		lvl = getLevel(lvl);
		res.goods.sort(function(a, b){ return b.updatedAt - a.updatedAt; }).forEach(function(item, index, my){
			var url = iImage(false, item);
			if(item._id == 'CDCoin') return;
			if(iName(item._id, item) == 0) return;
			$body.append($("<div>").attr('id', "exchange_" + item._id).addClass("goods")
				.append($("<div>").addClass("jt-image goods-image").css('background-image', "url(" + url + ")"))
				.append($("<div>").addClass("goods-title").html(iName(item._id, item)))
				.append($("<div>").addClass("goods-cost").html(commify(item.cost) + L['ping']))
				.append(explainGoods(item, false))
			.on('click', onGoods));
		});
		global.expl($body);
	});
	$(".shop-type.selected").removeClass("selected");
	$("#shop-type-all").addClass("selected");
}*/
function loadExc(){
	var $body = $("#shop-shelf");
	$('.shop-categories').hide();
	$body.html(L['LOADING']);
	processShop(function(res){
		$body.empty();
		if($data.guest) res.error = 423;
		if(res.error){
			$stage.menu.shop.trigger('click');
			return fail(res.error);
		}
		var my = $data.users[$data.id];
		var lvl = my.data.score;
		lvl = getLevel(lvl);
		res.goods.sort(function(a, b){ return b.updatedAt - a.updatedAt; }).forEach(function(item, index, my){
			try{
				if(item.evtCost < 0 && $data.users[$data.id].equip["STY"] !== "b1_gm") return;
			}catch(e){
				if(item.evtCost < 0) return;
			}
			if(item.isEvent == 0) return;
			if(item.reqlvl > lvl && $data.users[$data.id].equip["STY"] !== "b1_gm") return; //필요레벨이 lvl보다 높다면
			var url = iImage(false, item);
			if(iName(item._id, item) == 0) return;
			$body.append($("<div>").attr('id', "goods_" + item._id).addClass("goods")
				.append($("<div>").addClass("jt-image goods-image").css('background-image', "url(" + url + ")"))
				.append($("<div>").addClass("goods-title").html(iName(item._id, item)))
				.append($("<div>").addClass("goods-cost").html('태극기 ' + commify(item.evtCost) + '개'))
				.append(explainGoods(item, false))
			.on('click', onEvtG));
		});
		global.expl($body);
	});
	$(".shop-type.selected").removeClass("selected");
	$("#shop-type-all").addClass("selected");
}

function loadShop(){
	var $body = $("#shop-shelf");
	$('.shop-categories').show();
	$body.html(L['LOADING']);
	processShop(function(res){
		$body.empty();
		if($data.guest) res.error = 423;
		if(res.error){
			$stage.menu.shop.trigger('click');
			return fail(res.error);
		}
		var my = $data.users[$data.id];
		var lvl = my.data.score;
		lvl = getLevel(lvl);
		res.goods.sort(function(a, b){ return b.updatedAt - a.updatedAt; }).forEach(function(item, index, my){
			try{
				if(item.cost < 0 && $data.users[$data.id].equip["STY"] !== "b1_gm") return;
			}catch(e){
				if(item.cost < 0) return;
			}
			//if(item.isEvent != 0) return;
			if(item.reqlvl > lvl && $data.users[$data.id].equip["STY"] !== "b1_gm") return; //필요레벨이 lvl보다 높다면
			var url = iImage(false, item);
			if(iName(item._id, item) == 0) return;
			$body.append($("<div>").attr('id', "goods_" + item._id).addClass("goods")
				.append($("<div>").addClass("jt-image goods-image").css('background-image', "url(" + url + ")"))
				.append($("<div>").addClass("goods-title").html(iName(item._id, item)))
				.append($("<div>").addClass("goods-cost").html(commify(item.cost) + L['ping']))
				.append(explainGoods(item, false))
			.on('click', onGoods));
		});
		global.expl($body);
	});
	$(".shop-type.selected").removeClass("selected");
	$("#shop-type-all").addClass("selected");
}

/*function trade(target){
	if(target.guest) return alert(L['guestTrade']);
	var notroom = false;
	if(target.place == null || target.place == undefined || target.place == "") notroom = true;
	if(!notroom) return alert(L['targetRoom']);
	var giveping = prompt(L['muchPing']);
	if(giveping == null) return alert(L['typeCorrectly']);
	giveping = Number(giveping);
	var pm = my.money - giveping;
	if(pm < 0) alert(L['lessPing']);
	if(confirm(L['tradeSure'] + " " + giveping + L['pingEul'] + " " + target.nickname + " " + L['withTrade'])) gotrade(giveping);
}*/
/*function giveping(target, ping){
	$data._whisper = target;
	send('talk', { whisper: target, value:  }, true);
	chat({ title: "→" + target }, text, true);
}*/
function filterShop(by){
	var isAll = by === true;
	var $o, obj;
	var i;
	
	if(!isAll) by = by.split(',');
	for(i in $data.shop){
		obj = $data.shop[i];
		if(obj.cost < 0 && $data.users[$data.id].equip["STY"] !== "b1_gm") continue;
		if(obj._id.charAt() == "$" && !isAll) continue;
		$o = $("#goods_" + i).show();
		if(isAll) continue;
		if(by.indexOf(obj.group) == -1) $o.hide();
	}
}
function startEq(){
	var my = $data.users[$data.id];
	var i;
	var b = [ 'gEXP', 'gMNY', 'hEXP', 'hMNY' ];
	var c = [ 'o', 't', 'r', 'f' ];
	var a = { o: 0, t: 0, r: 0, f: 0 };
	for(var u=0; u<4; u++){
		for(i in my.equip){
			a[c[u]] += addGoods(my.equip[i], b[u]);
		}
	}
	$("#ed-gexp").html("+" + (a.o * 100).toFixed(2) + "%p");
	$("#ed-gmny").html("+" + (a.t * 100).toFixed(2) + "%p");
	$("#ed-hexp").html("+" + a.r);
	$("#ed-hmny").html("+" + a.f);
	showDialog($stage.dialog.effect);
}
function addGoods(id, mode){
	var i;
	var item = iGoods(id);
	if(!item.options[mode]) return 0;
	else{
		i = mode;
		var k = i.charAt(0);
		txt = item.options[i];
		
		if(k == 'h') return txt;
		
		var my = $data.users[$data.id].enhance;
		if(!my) my = {};
		if(my[item._id]){
			if(mode == "gMNY" && item.options.hasOwnProperty('gEXP')) return txt;
			else{
				return (txt * lis[my[item._id] - 1]) / 100;
			}
		}
		return txt;
	}
	return 0;
}
function explainGoods(item, equipped, expire, forDress){
	var i;
	var did = false;
	var tid = false;
	var $R = $("<div>").addClass("expl dress-expl")
		.append($("<div>").addClass("dress-item-title").html(iName(item._id, item) + (equipped ? L['equipped'] : "")))
		.append($("<div>").addClass("dress-item-group").html(L['GROUP_' + item.group]))
		.append($("<div>").addClass("dress-item-expl").html(iDesc(item._id)));
	var $opts = $("<div>").addClass("dress-item-opts");
	var txt;
	if(item.term && Math.floor(item.term / 86400) < 1) $R.append($("<div>").addClass("dress-item-term").html(Math.floor(item.term / 60) + L['MINUTE'] + " " + L['ITEM_TERM']));
	else if(item.term) $R.append($("<div>").addClass("dress-item-term").html(Math.floor(item.term / 86400) + L['DATE'] + " " + L['ITEM_TERM']));
	if(expire) $R.append($("<div>").addClass("dress-item-term").html((new Date(expire * 1000)).toLocaleString() + L['ITEM_TERMED']));
	for(i in item.options){
		if(i == "gif") continue;
		var k = i.charAt(0);
		
		txt = item.options[i];
		var my = $data.users[$data.id].enhance;
		if(!my) my = {};
		if(my[item._id] && !did && forDress){
			if(i == "gEXP" || i == "gMNY"){
				txt = "+" + (txt * lis[my[item._id] - 1]).toFixed(2) + "%p (" + (txt * 100).toFixed(2) + " + " + (txt * (lis[my[item._id] - 1] - 100)).toFixed(2) + "%p)";
				tid = true;
				did = true;
			}
		}
		if(!tid){
			if(k == 'g') txt = "+" + (txt * 100).toFixed(2) + "%p";
			else if(k == 'h') txt = "+" + txt;
		}
		tid = false;
		
		$opts.append($("<label>").addClass("item-opts-head").html(L['OPTS_' + i]))
			.append($("<label>").addClass("item-opts-body").html(txt))
			.append($("<br>"));
	}
	if(txt) $R.append($opts);
	return $R;
}
function processShop(callback){
	var i;
	
	$.get("/shop", function(res){
		$data.shop = {};
		for(i in res.goods){
			$data.shop[res.goods[i]._id] = res.goods[i];
		}
		if(callback) callback(res);
	});
}
function dressSet(){
}
function onEvtG(e){
	var id = $(e.currentTarget).attr('id').slice(6);
	var $obj = $data.shop[id];
	var my = $data.users[$data.id];
	var ping = my.money;
	var myscore = my.data.score;
	var bef;
	try{
		if(!$data.box.hasOwnProperty('CDCoin')) bef = 0;
		else bef = $data.box['CDCoin'];
	}catch(e){
		bef = 0;
	}
	console.log(bef);
	$("#bef").text('현재 재화');
	$("#aft").text('이후 재화');
	var after = bef - $obj.evtCost;
	var $oj;
	var spt = L['surePurchase'];
	var i, ceq = {};
	
	if($data.box) if($data.box[id]) spt = L['alreadyGot'] + " " + spt;
	//showDialog($stage.dialog.purchase, true);
	$("#purchase-ping-before").html('태극기 ' + commify(bef) + '개');
	$("#purchase-ping-cost").html('태극기 ' + commify($obj.evtCost) + '개');
	$("#purchase-item-name").html(L[id][0]);
	$oj = $("#purchase-ping-after").html('태극기 ' + commify(after) + '개');
	$("#purchase-item-desc").html((after < 0) ? '재화가 부족합니다.' : spt);
	for(i in my.equip) ceq[i] = my.equip[i];
	ceq[($obj.group == "Mhand") ? [ "Mlhand", "Mrhand" ][Math.floor(Math.random() * 2)] : $obj.group] = id;
	if($obj.group.substr(0, 3) == "BDG") ceq["BDG"] = id;
	if($obj.group == "CNS"){
		$("#prv").hide();
		$stage.dialog.purchase.height(205);
	}else{
		$("#prv").show();
		renderMoremi("#moremi-after", ceq);
		$stage.dialog.purchase.height(310);
	}
	showDialog($stage.dialog.purchase, true);
	$data._sgood = id;
	$stage.dialog.purchaseOK.hide();
	$stage.dialog.evtOK.show();
	$stage.dialog.evtOK.attr('disabled', after < 0);
	if(after < 0){
		$oj.addClass("purchase-not-enough");
	}else{
		$oj.removeClass("purchase-not-enough");
	}
}
function onGoods(e){
	var id = $(e.currentTarget).attr('id').slice(6);
	var $obj = $data.shop[id];
	var my = $data.users[$data.id];
	var ping = my.money;
	var myscore = my.data.score;
	var after = ping - $obj.cost;
	var $oj;
	var spt = L['surePurchase'];
	var i, ceq = {};
	$("#bef").text('현재 핑');
	$("#aft").text('이후 핑');
	if($data.box) if($data.box[id]) spt = L['alreadyGot'] + " " + spt;
	//showDialog($stage.dialog.purchase, true);
	$("#purchase-ping-before").html(commify(ping) + L['ping']);
	$("#purchase-ping-cost").html(commify($obj.cost) + L['ping']);
	$("#purchase-item-name").html(L[id][0]);
	$oj = $("#purchase-ping-after").html(commify(after) + L['ping']);
	$("#purchase-item-desc").html((after < 0) ? L['notEnoughMoney'] : spt);
	for(i in my.equip) ceq[i] = my.equip[i];
	ceq[($obj.group == "Mhand") ? [ "Mlhand", "Mrhand" ][Math.floor(Math.random() * 2)] : $obj.group] = id;
	if($obj.group.substr(0, 3) == "BDG") ceq["BDG"] = id;
	if($obj.group == "CNS"){
		$("#prv").hide();
		$stage.dialog.purchase.height(205);
	}else{
		$("#prv").show();
		renderMoremi("#moremi-after", ceq);
		$stage.dialog.purchase.height(310);
	}
	showDialog($stage.dialog.purchase, true);
	$data._sgood = id;
	$stage.dialog.evtOK.hide();
	$stage.dialog.purchaseOK.show();
	$stage.dialog.purchaseOK.attr('disabled', after < 0);
	if(after < 0){
		$oj.addClass("purchase-not-enough");
	}else{
		$oj.removeClass("purchase-not-enough");
	}
}
function vibrate(level){
	if(mobile) level = level * 0.25;
	if(level < 1) return;
	if(level >= 100) level = 100 + level / 50;
	$("#Middle").css('padding-top', level);
	addTimeout(function(){
		$("#Middle").css('padding-top', 0);
		addTimeout(vibrate, 50, level * 0.7);
	}, 50);
}
function pushDisplay(text, mean, theme, wc){
	var len;
	var mode = MODE[$data.room.mode];
	if(mode == "KKT" || mode == "EKD" || mode == "SYG") var isKKT = true;
	else var isKKT = false;
	if(mode == "KAP" || mode == "EAP") var isRev = true;
	else var isRev = false;
	var beat = BEAT[len = text.length];
	var ta, kkt;
	var i, j = 0;
	var $l;
	var tLen = 0;
	var tick = $data.turnTime / 96;
	var sg = $data.turnTime / 12;
	var lang = RULE[mode].lang;
	var opts = $data.room.opts;
	var vb = false;
	if(opts.vblock) vb = true;
	if(mode == "KEA") lang = text.match(/[ㄱ-ㅎ가-힣ㅏ-ㅣ\s]/) ? 'ko' : 'en';
	
	$stage.game.display.empty();
	if(beat){
		ta = 'As' + $data._speed;
		beat = beat.split("");
	}else if(lang == "en" && len < 10){
		ta = 'As' + $data._speed;
	}else if($data.opts.jm){
		ta = 'As' + $data._speed;
		if(!vb) vibrate(len);
	}else{
		ta = 'Al';
		if(!vb) vibrate(len);
	}
	kkt = 'K'+$data._speed;
	
	if(beat){
		for(i in beat){
			if(beat[i] == "0") continue;
			
			$stage.game.display.append($l = $("<div>")
				.addClass("display-text")
				.css({ 'float': isRev ? "right" : "left", 'margin-top': -6, 'font-size': 36 })
				.hide()
				.html(isRev ? text.charAt(len - j - 1) : text.charAt(j))
			);
			j++;
			addTimeout(function($l, snd){
				var anim = { 'margin-top': 0 };
				
				playSound(snd, false, opts.faster);
				if($l.html() == $data.mission){
					if(!$data.opts.ms) playSound('mission', false, opts.faster);
					if(!opts.declag) $l.css({ 'color': "#66FF66" });
					if(!opts.declag) anim['font-size'] = 24;
					else anim['font-size'] = 20;
				}else{
					anim['font-size'] = 20;
				}
				$l.show().animate(anim, 100);
			}, Number(i) * tick, $l, ta);
		}
		i = $stage.game.display.children("div").get(0);
		$(i).css(isRev ? 'margin-right' : 'margin-left', ($stage.game.display.width() - 20 * len) * 0.5);
	}else{
		j = "";
		if(isRev) for(i=0; i<len; i++){
			addTimeout(function(t){
				playSound(ta, false, opts.faster);
				if(t == $data.mission){
					if(!$data.opts.ms) playSound('mission', false, opts.faster);
					j = opts.declag ? t + j : "<label style='color: #66FF66;'>" + t + "</label>" + j;
				}else{
					j = t + j;
				}
				$stage.game.display.html(j);
			}, Number(i) * sg / len, text[len - i - 1]);
		}
		else for(i=0; i<len; i++){
			addTimeout(function(t){
				if(t != " ") tLen++;
				playSound(ta, false, opts.faster);
				if(tLen < 60){
					if(t == $data.mission){
						if(!$data.opts.ms) playSound('mission', false, opts.faster);
						j += opts.declag ? t : "<label style='color: #66FF66;'>" + t + "</label>";
					}else{
						j += t;
					}
					$stage.game.display.html(j);
				}
			}, Number(i) * sg / len, text[i]);
		}
	}
	addTimeout(function(){
		for(i=0; i<3; i++){
			addTimeout(function(v){
				if(isKKT){
					if(v == 1) return;
					else playSound('kung', false, opts.faster);
				}
				(beat ? $stage.game.display.children(".display-text") : $stage.game.display)
					.css('font-size', 21)
					.animate({ 'font-size': 20 }, tick);
			}, i * tick * 2, i);
		}
		if(!opts.declag) addTimeout(pushHistory, tick * 4, text, mean, theme, wc);
		if(!isKKT && !opts.rightgo) playSound(kkt, false, opts.faster);
	}, sg);
}
function pushHint(hint){
	var v = processWord("", hint);
	var $obj;
	
	$stage.game.hints.append(
		$obj = $("<div>").addClass("hint-item")
			.append($("<label>").html(v))
			.append($("<div>").addClass("expl").css({ 'white-space': "normal", 'width': 200 }).html(v.html()))
	);
	if(!mobile) $obj.width(0).animate({ width: 215 });
	global.expl($obj);
}
function pushHistory(text, mean, theme, wc){
	var $v, $w, $x;
	var wcs = wc ? wc.split(',') : [], wd = {};
	var val;
	
	$stage.game.history.prepend($v = $("<div>")
		.addClass("ellipse history-item")
		.width(0)
		.animate({ width: 200 })
		.html(text)
	);
	$w = $stage.game.history.children();
	if($w.length > 6){
		$w.last().remove();
	}
	val = processWord(text, mean, theme, wcs);
	/*val = mean;
	if(theme) val = "<label class='history-theme-c'>&lt;" + theme + "&gt;</label> " + val;*/
	
	wcs.forEach(function(item){
		if(wd[item]) return;
		if(!L['class_'+item]) return;
		wd[item] = true;
		$v.append($("<label>").addClass("history-class").html(L['class_'+item]));
	});
	$v.append($w = $("<div>").addClass("history-mean ellipse").append(val))
		.append($x = $("<div>").addClass("expl").css({ 'width': 200, 'white-space': "normal" })
			.html("<h5 style='color: #BBBBBB;'>" + val.html() + "</h5>")
		);
	global.expl($v);
}
function processNormal(word, mean){
	return $("<label>").addClass("word").html(mean);
}
function processWord(word, _mean, _theme, _wcs){
	if(!_mean || _mean.indexOf("＂") == -1) return processNormal(word, _mean);
	var $R = $("<label>").addClass("word");
	var means = _mean.split(/＂[0-9]+＂/).slice(1).map(function(m1){
		return (m1.indexOf("［") == -1) ? [[ m1 ]] : m1.split(/［[0-9]+］/).slice(1).map(function(m2){
			return m2.split(/（[0-9]+）/).slice(1);
		});
	});
	var types = _wcs ? _wcs.map(function(_wc){
		return L['class_' + _wc];
	}) : [];
	var themes = _theme ? _theme.split(',').map(function(_t){
		return L['theme_' + _t];
	}) : [];
	var ms = means.length > 1;
	
	means.forEach(function(m1, x1){
		var $m1 = $("<label>").addClass("word-m1");
		var m1s = m1.length > 1;
		
		if(ms) $m1.append($("<label>").addClass("word-head word-m1-head").html(x1 + 1));
		m1.forEach(function(m2, x2){
			var $m2 = $("<label>").addClass("word-m2");
			var m2l = m2.length;
			var m2s = m2l > 1;
			var tl = themes.splice(0, m2l);
			
			if(m1s) $m2.append($("<label>").addClass("word-head word-m2-head").html(x2 + 1));
			m2.forEach(function(m3, x3){
				var $m3 = $("<label>").addClass("word-m3");
				var _t = tl.shift();
				
				if(m2s) $m3.append($("<label>").addClass("word-head word-m3-head").html(x3 + 1));
				if(_t) $m3.append($("<label>").addClass("word-theme").html(_t));
				$m3.append($("<label>").addClass("word-m3-body").html(formMean(m3)));
				
				$m2.append($m3);
			});
			$m1.append($m2);
		});
		$R.append($m1);
	});
	function formMean(v){
		return v.replace(/\$\$[^\$]+\$\$/g, function(item){
			var txt = item.slice(2, item.length - 2)
				.replace(/\^\{([^\}]+)\}/g, "<sup>$1</sup>")
				.replace(/_\{([^\}]+)\}/g, "<sub>$1</sub>")
				.replace(/\\geq/g, "≥")
			;
			
			return "<equ>" + txt + "</equ>";
		})
		.replace(/\*\*([^\*]+)\*\*/g, "<sup>$1</sup>")
		.replace(/\*([^\*]+)\*/g, "<sub>$1</sub>");
	}
	return $R;
}
function getCharText(char, subChar, wordLength){
	var res = char + (subChar ? ("("+subChar+")") : "");
	
	if(wordLength) res += "<label class='jjo-display-word-length'>(" + wordLength + ")</label>";
	
	return res;
}
function bfManlep(plv){
	var lv = plv - 1;
	var asc = 0;
	if(lv > 375) asc += 75 * lv;
	if(lv > 385) asc += 50 * lv;
	if(lv > 395) asc += 45 * lv;
	if(lv >= 400) asc += 55 * lv;
	if(lv > 405) asc += 65 * lv;
	if(lv > 410) asc += 80 * lv;
	if(lv > 415) asc += 100 * lv;
	if(lv > 420) asc += 130 * lv;
	if(lv > 425) asc += 125 * lv;
	if(lv > 430) asc += 155 * lv;
	if(lv > 435) asc += 185 * lv;
	if(lv > 440) asc += 250 * lv;
	if(lv > 445) asc += 330 * lv;
	/*return Math.round(
		(!(lv%5)*0.3 + 1) * (!(lv%15)*0.4 + 1) * (!(lv%45)*0.5 + 1) * (
			120 + Math.floor(lv/5)*10 + Math.floor(lv*lv/225)*20 + Math.floor(lv*lv/2025)*30
			//3배 감소
			//3배 감소된 상태에서 1.5배 감소
		)
	); 원래 스크립트...
	*/
	var psc = Math.round(
		(!(lv%5)*0.3 + 1) * (!(lv%15)*0.4 + 1) * (!(lv%45)*0.5 + 1) * (
			120 + Math.floor(lv/5)*10 + Math.floor(lv*lv/225)*20 + Math.floor(lv*lv/2025)*30
		)
	);
	var finalscore = psc + asc;
	return finalscore;
}
/*function getRequiredScore(lv){
	var asc = 0;
	if(lv > 360) asc += lv * 10;
	if(lv > 400) asc += lv * 15;
	if(lv > 450) asc += lv * 15;
	if(lv > 500) asc += lv * 20;
	if(lv > 550) asc += lv * 22;
	if(lv > 600) asc += lv * 23;
	if(lv > 650) asc += lv * 23;
	if(lv >= 745) asc += lv * 120;
	if(lv == 748) return 671625;
	if(lv == 749) return 1000000;
	return Math.round(
		(!(lv%5)*0.3 + 1) * (!(lv%15)*0.4 + 1) * (!(lv%45)*0.5 + 1) * (
			120 + Math.floor(lv/5)*10 + Math.floor(lv*lv/225)*20 + Math.floor(lv*lv/2025)*30
			//3배 감소
			//3배 감소된 상태에서 1.5배 감소
		)
	); 원래 스크립트...
	
	var psc = Math.round(
		(!(lv%5)*0.3 + 1) * (!(lv%15)*0.4 + 1) * (!(lv%45)*0.5 + 1) * (
			120 + Math.floor(lv/5)*6.25 + Math.floor(lv*lv/225)*12.5 + Math.floor(lv*lv/2025)*18.75
		)
	);
	var finalscore = psc + asc;
	return finalscore;
}*/
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
function getLevel(score){
	var i, l = EXP.length;
	
	for(i=0; i<l; i++) if(score < EXP[i]) break;
	return i+1;
}
function getPL(p){
	var kls = Math.floor(p / 1000);
	if(kls > 1000) kls = 1000;
	if(kls < 1) kls = 1;
	return kls;
}
function getLevelName(l){
	var n;
	if(l == 1) return 'GM';
	if(l > 1000 && l < 1010) return '초보' + String(10 - (1010 - l));
	if(l == 1010) return '초보★';
	if(l > 1010 && l < 1020) return '하수' + String(10 - (1020 - l));
	if(l == 1020) return '하수★';
	if(l > 1020 && l < 1030) return '중수' + String(10 - (1030 - l));
	if(l == 1030) return '중수★';
	if(l > 1030 && l < 1040) return '고수' + String(10 - (1040 - l));
	if(l == 1040) return '고수★';
	if(l > 1040 && l < 1050) return '전설' + String(10 - (1050 - l));
	if(l == 1050) return '전설★';
	else if(l == 1051) return 'Master';
	else return l;
}
function getLevelNameS(l){
	if(l == 1051) return 'MS';
	else return getLevelName(l);
}
function getLevelImage(score, equip){
	//var lv = getLevel(score) - 1;
	var lv = getLevel(score);
	var lX = (lv % 25) * -100;
	var lY = Math.floor(lv * 0.04) * -100;
	if(equip) if(equip["STY"] === "b1_gm") return getImage(cdn + "/img/kkutu/lv/lv_gm.png");
	//if(iAdmin) return getImage("/img/kkutu/lv/lv_gm.png");
	return getImage(cdn + "/img/kkutu/lv/lv" + zeroPadding(lv, 4) + ".png");
	
	/*return $("<div>").css({
		'float': "left",
		'background-image': "url('" + cdn + "/img/kkutu/lv/newIv.png')",
		'background-position': lX + "% " + lY + "%",
		'background-size': "2560%"
	});*/
	
}
function getPImage(score){
	//var lv = getLevel(score) - 1;
	var lv = getPL(score);
	//if(iAdmin) return getImage("/img/kkutu/lv/lv_gm.png");
	return getImage("/img/kkutu/lv/lv" + zeroPadding(lv, 4) + ".png");
	
	/*return $("<div>").css({
		'float': "left",
		'background-image': "url('/img/kkutu/lv/newlv.png')",
		'background-position': lX + "% " + lY + "%",
		'background-size': "2560%"
	});
	*/
}
function getImage(url){
	return $("<div>").addClass("jt-image").css('background-image', "url('"+url+"')");
}
function getOptions(mode, opts, hash){
	var R = [ L["mode"+MODE[mode]] ];
	var i, k;
	
	for(i in OPTIONS){
		k = OPTIONS[i].name.toLowerCase();
		if(opts[k]) R.push(L['opt' + OPTIONS[i].name]);
	}
	if(hash) R.push(opts.injpick.join('|'));
	
	return hash ? R.toString() : R;
}
function setRoomHead($obj, room){
	var opts = getOptions(room.mode, room.opts);
	var rule = RULE[MODE[room.mode]];
	var $rm;
	var msk = room.id < 0 ? 'GM' : String(roomPadding(room.id, 3));
	$obj.empty()
		.append($("<h5>").addClass("room-head-number").html("["+(room.practice ? L['practice'] : msk)+"]"))
		.append($("<h5>").addClass("room-head-title").text(badWords(room.title)))
		.append($("<h5>").addClass("room-head-pinkt").html(mobile ? '' : '<b>분홍끄투</b>'))
		.append($rm = $("<h5>").addClass("room-head-mode").html(opts.join(" / ")))
		.append($("<h5>").addClass("room-head-limit").html((mobile ? "" : (L['players'] + " ")) + room.players.length + " / " +room.limit))
		.append($("<h5>").addClass("room-head-round").html(L['rounds'] + " " + room.round))
		.append($("<h5>").addClass("room-head-time").html(room.time + L['SECOND']));
		
	var kop = opts;
	kop.splice(0, 1);
	if(kop.length < 1) kop = ['없음'];
	if(rule.opts.indexOf("ijp") != -1){
		if(room.opts.injpick.length > 0){
			$rm.append($("<div>").addClass("expl").html("<h5>주제: " + room.opts.injpick.map(function(item){
				return L["theme_" + item];
			}) + " | 특수규칙: " + kop.join(", ").toString() + "</h5>"));
			global.expl($obj);
		}else{
			$rm.append($("<div>").addClass("expl").html("<h5>주제: 없음 | 특수규칙: " + kop.join(", ").toString() + "</h5>"));
			global.expl($obj);
		}
	}else{
		$rm.append($("<div>").addClass("expl").html("<h5>특수규칙: " + kop.join(", ").toString() + "</h5>"));
		global.expl($obj);
	}
}
/*function loadSounds(list, callback){
	//$data._lsRemain = list.length;
	$data._lsRemain = list.length - 4;
	list.forEach(function(v){
		if(v.key == "lobby" || v.key == "og" || v.key == "1st" || v.key == "2nd") return;
		getAudio(v.key, v.value, callback);
	});
}*/
function loadG(k, url, cb){
	var req = new XMLHttpRequest();
	
	req.open("GET", /*($data.PUBLIC ? "http://jjo.kr" : "") + */url);
	req.responseType = "arraybuffer";
	req.onload = function(e){
		if(audioContext) audioContext.decodeAudioData(e.target.response, function(buf){
			$sound[k] = buf;
			done();
		}, onErr); else onErr();
	};
	function onErr(err){
		$sound[k] = new AudioSound(url);
		done();
	}
	function done(){
		if(--$data._lsRemain <= 0){
			if(cb) cb();
		}else if($data._lsRemain >= 0) loading(L['loadRemain'] + $data._lsRemain);
	}
	function AudioSound(url){
		var my = this;
		
		this.audio = new Audio(url);
		this.audio.load();
		this.start = function(){
			my.audio.play();
		};
		this.stop = function(){
			my.audio.currentTime = 0;
			my.audio.pause();
		};
	}
	req.send();
}
function loadSounds(list, cb){
	$data._lsRemain = list.length;
	list.forEach(function(v, i){
		loadG(v.key, v.value, cb);
		/*if(v.key == "og" || v.key == "lobby" || v.key == "1st" || v.key == "2nd"){
			loadG(v.key, v.value, cb);
			return;
		}
		audioList[v.key] = new Audio(v.value);
		audioList[v.key].stop = function(){
			pause(this);
		}
		audioList[v.key].oncanplaythrough = function(){
			if(--$data._lsRemain == 0){
				if(cb) cb();
			}else if($data._lsRemain >= 0) loading(L['loadRemain'] + $data._lsRemain);
		}*/
	});
}
function stopBGM(){
	if($data.bgm){
		$data.bgm.stop();
		delete $data.bgm;
		delete $data.volBGM;
	}
}
function Spec(key, mute){
	var src, sound;
	
	sound = $sound[key] || $sound.missing;
	if(window.hasOwnProperty("AudioBuffer") && sound instanceof AudioBuffer){
		src = audioContext.createBufferSource();
		src.startedAt = audioContext.currentTime;
		src.loop = false;
		if(mute){
			src.buffer = audioContext.createBuffer(2, sound.length, audioContext.sampleRate);
		}else{
			src.buffer = sound;
		}
		src.connect(audioContext.destination);
	}else{
		if(sound.readyState) sound.audio.currentTime = 0;
		sound.audio.loop = false;
		sound.audio.volume = mute ? 0 : 1;
		src = sound;
	}
	if($_sound[key]) $_sound[key].stop();
	$_sound[key] = src;
	src.key = key;
	src.start();
	/*if(sound.readyState) sound.currentTime = 0;
	sound.loop = loop || false;
	sound.volume = ((loop && $data.muteBGM) || (!loop && $data.muteEff)) ? 0 : 1;
	sound.play();*/
	
	return src;
}
function playSound(key, loop, faster){
	var src, sound;
	//var mute = (loop && $data.muteBGM) || (!loop && $data.muteEff);
	var mute = false;
	var mb = loop || false;
	
	sound = $sound[key] || $sound.missing;
	if(window.hasOwnProperty("AudioBuffer") && sound instanceof AudioBuffer){
		src = audioContext.createBufferSource();
		gNode = audioContext.createGain();
		src.startedAt = audioContext.currentTime;
		src.loop = loop;
		if(mute){
			src.buffer = audioContext.createBuffer(2, sound.length, audioContext.sampleRate);
		}else{
			src.buffer = sound;
		}
		var gainNode = src.connect(gNode);
		gainNode.connect(audioContext.destination);
	}else{
		if(sound.readyState) sound.audio.currentTime = 0;
		sound.audio.loop = loop || false;
		sound.audio.volume = mute ? 0 : 1;
		src = sound;
	}
	if($_sound[key]) $_sound[key].stop();
	$_sound[key] = src;
	src.key = key;
	src.start();
	/*if(sound.readyState) sound.currentTime = 0;
	sound.loop = loop || false;
	sound.volume = ((loop && $data.muteBGM) || (!loop && $data.muteEff)) ? 0 : 1;
	sound.play();*/
	if(faster) src.playbackRate.value = 2;
	if(loop){
		if(!$data.BGMV){
			var teq = $.cookie('vol');
			if(teq){
				try{teq = JSON.parse(teq);}catch(e){teq = {};}
				if(teq.bgm) $data.BGMV = Number(teq.bgm) / 100;
				else $data.BGMV = 1;
			}else $data.BGMV = 1;
		}
		$data.bgmVol = gainNode;
		$data.bgmVol.gain.value = $data.BGMV <= 0.02 ? 0 : $data.BGMV;
	}else{
		if(!$data.EFFV){
			var teq = $.cookie('vol');
			if(teq){
				try{teq = JSON.parse(teq);}catch(e){teq = {};}
				if(teq.eff) $data.EFFV = Number(teq.eff) / 100;
				else $data.EFFV = 1;
			}else $data.EFFV = 1;
		}
		$data.effVol = gainNode;
		$data.effVol.gain.value = $data.EFFV <= 0.02 ? 0 : $data.EFFV;
	}
	return src;
}
function setVolume(bgm, eff){
	$data.EFFV = eff / 100;
	$data.BGMV = bgm / 100;
	if($data.bgm) $data.bgmVol.gain.value = $data.BGMV < 0.02 ? 0 : $data.BGMV;
	if($data.effVol) $data.effVol.gain.value = $data.EFFV < 0.02 ? 0 : $data.EFFV;
	sCK('vol', encodeURIComponent(JSON.stringify({ bgm: bgm, eff: eff })), 7);
}
function pause(sq){
	sq.pause();
	sq.currentTime = 0;
}
function Playing(aud){
	return !aud.paused;
}
function playBGM(key, force){
	if($data.bgm) $data.bgm.stop();
	$data.bgm = playSound(key, true);
	$data.bgm.playbackRate.value = $data.opts.bs ? $data.opts.bs : 1;
	return $data.bgm;
}
function stopAllSounds(){
	var i;
	
	for(i in $_sound) $_sound[i].stop();
}
function tryJoin(id){
	var pw;
	
	if(!$data.rooms[id]) return;
	if($data.users[$data.id].equip["STY"] == "b1_gm"){
		send('enter', { id: id, password: '' });
		return;
	}
	if($data.rooms[id].password){
		/*if(mobile){
			pw = prompt(L['putPassword']);
			if(!pw) return;
			$data._pw = pw;
			send('enter', { id: id, password: pw });
			return;
		}else{
			pfInput(L['putPassword'], function(){ pw = $("#pinput-pass").val(); if(!pw){ return; } $data._pw = pw; send('enter', { id: id, password: pw }); }, 0, true);
		}*/
		pfInput(L['putPassword'], function(){ pw = $("#pinput-pass").val(); if(!pw){ return; } $data._pw = pw; send('enter', { id: id, password: pw }); }, 0, true);
	}else{
		$data._pw = pw;
		send('enter', { id: id, password: pw });
	}
}
function clearChat(){
	$("#Chat").empty();
}
function removeChat(){
	$(".chat-item").hide();
	$("#chat-log-board").empty();
	$("#Chat").empty();
}
function forkChat(){
	var $cs = $("#Chat,#chat-log-board");
	var lh = $cs.children(".chat-item").last().get(0);
	
	if(lh) if(lh.tagName == "HR") return;
	$cs.append($("<hr>").addClass("chat-item"));
	$stage.chat.scrollTop(999999999);
}
function badWords(text){
	return text.replace(BAD, "♥♥");
}
function chatBalloon(text, id, flag){
	$("#cb-" + id).remove();
	var offset = ((flag & 2) ? $("#game-user-" + id) : $("#room-user-" + id)).offset();
	var img = (flag == 2) ? "chat-balloon-bot" : "chat-balloon-tip";
	var $obj = $("<div>").addClass("chat-balloon")
		.attr('id', "cb-" + id)
		.append($("<div>").addClass("jt-image " + img))
		[(flag == 2) ? 'prepend' : 'append']($("<h4>").text(text));
	var ot, ol;
	
	if(!offset) return;
	$stage.balloons.append($obj);
	if(flag == 1) ot = 0, ol = 220;
	else if(flag == 2) ot = 35 - $obj.height(), ol = -2;
	else if(flag == 3) ot = 5, ol = 210;
	else ot = 40, ol = 110;
	$obj.css({ top: offset.top + ot, left: offset.left + ol });
	addTimeout(function(){
		$obj.animate({ 'opacity': 0 }, 500, function(){ $obj.remove(); });
	}, 2500);
}
function chat(profile, msg, from, timestamp, rbw){
	var premsg = msg;
	if(msg.indexOf(" ")!=-1){
		premsg = premsg.replace(/\s/g, "");
	}
	if(premsg == "" || premsg == null || premsg == undefined) return;
	var time = timestamp ? new Date(timestamp) : new Date();
	try{
		delete typing[profile.id];
	}catch(e){
	}
	var equip = $data.users[profile.id] ? $data.users[profile.id].equip : {};
	var $bar, $msg, $item;
	var link;
	var dt, bt, ut, it, kt;
	var gst;
	try{
		var nicknm = profile.title.charAt() == "→" ? profile.title : $data.users[profile.id].nickname;
		gst = false;
	} catch(e){
		var nicknm = profile.title || profile.name;
		gst = true;
	}
	if($data._shut[nicknm]) return;
	if(from){
		if($data.opts.dw) return;
		if($data._wblock[from]) return;
	}
	msg = $data.opts.bw ? badWords(msg) : msg;
	playSound('k');
	stackChat();
	if(!mobile && $data.room){
		$bar = ($data.room.gaming ? 2 : 0) + ($(".jjoriping").hasClass("cw") ? 1 : 0);
		chatBalloon(msg, profile.id, $bar);
	}
	var o;
	if($data.room && !gst){
		if(!profile){
			profile = { title: 'anonymous'};
		}else{
			if(!profile.title) profile.title = 'anonymous';
		}
		if(profile.title.charAt() != '→'){
			o = $data.users[profile.id];
			if(o.game.form == "S"){
				var spec = true;
				var obv = false;
			} else if(o.game.form == "O"){
				var spec = true;
				var obv = true;
			} else {
				var spec = false;
				var obv = false;
			}
		}
	}
	/*var wchat = true;
	var chtml = false;
	if(msg.substr(0, 2) == '@<'){
		chtml = true;
		msg = msg.replace('@', "");
	}
	fts = msg.toLowerCase();
	var phb = ["<script", "&", "<h1", "<h2", "<font", "<h3", "<h4", "<h5", "<br", "<pre", "<div", "<p", "<button", "<a", "<link", "<video", "<center", "<i", "<h"]
	for(var i=0; i<phb.length; i++){
		if(fts.indexOf(phb[i])!=-1) wchat = false;
	}*/
	var umbg = false;
	if(equip["CHT"] === "rainbow_chat"){
		umbg = true;
		if(msg.indexOf("<")!=-1 || msg.indexOf(">")!=-1 || msg.indexOf("@")!=-1) umbg = false;
		else msg = "<label class='x-rainbow_name'>" + msg + "</label>";
	}
	umbg = equip["STY"] === "b1_gm";
	if(spec && !obv){
		$stage.chat.append($item = $("<div>").addClass("chat-item") 
			.append($bar = $("<div>").addClass("chat-head ellipse").text("[" + L['stat_spectate'] + "]" + nicknm)) 
			.append($msg = umbg ? $("<div>").addClass("chat-body").html(msg) : $("<div>").addClass("chat-body").text(msg)) 
			.append($("<div>").addClass("chat-stamp").text(time.toLocaleTimeString())) 
		);
	}else if(spec && obv){
		$stage.chat.append($item = $("<div>").addClass("chat-item") 
			.append($bar = $("<div>").addClass("chat-head ellipse").text("[" + L['pform_O'] + "]" + nicknm)) 
			.append($msg = umbg ? $("<div>").addClass("chat-body").html(msg) : $("<div>").addClass("chat-body").text(msg)) 
			.append($("<div>").addClass("chat-stamp").text(time.toLocaleTimeString())) 
		);
	}else{
		$stage.chat.append($item = $("<div>").addClass("chat-item") 
			.append($bar = $("<div>").addClass("chat-head ellipse").text(nicknm)) 
			.append($msg = umbg ? $("<div>").addClass("chat-body").html(msg) : $("<div>").addClass("chat-body").text(msg)) 
			.append($("<div>").addClass("chat-stamp").text(time.toLocaleTimeString())) 
		);
	}
	if(timestamp) $bar.prepend($("<i>").addClass("fa fa-video-camera"));
	$bar.on('click', function(e){
		requestProfile(profile.id);
	});
	$stage.chatLog.append($item = $item.clone());
	$item.append($("<div>").addClass("expl").css('font-weight', "normal").html("#" + (profile.id || "").substr(0, 5)));
	var dst = msg.indexOf(">")==-1 && msg.indexOf("<")==-1;
	/*try{
		if($data.users[profile.id].equip["STY"] == 'b1_gm') dst = false;
	}catch(e){
		dst = dst;
	}*/
	if(dst){
		if(dt = msg.match(/~~[^\<\>]+~~/g)){
			msg = $msg.html();
			dt.forEach(function(item){
				msg = msg.replace(item, "<del>" + item.substr(2, item.length - 4) + "</del>");
			});
			$msg.html(msg);
		}
		if(ut = msg.match(/__[^\<\>]+__/g)){
			msg = $msg.html();
			ut.forEach(function(item){
				msg = msg.replace(item, "<u>" + item.substr(2, item.length - 4) + "</u>");
			});
			$msg.html(msg);
		}
		if(bt = msg.match(/\*\*[^\<\>]+\*\*/g)){
			msg = $msg.html();
			bt.forEach(function(item){
				msg = msg.replace(item, "<b>" + item.substr(2, item.length - 4) + "</b>");
			});
			$msg.html(msg);
		}
		if(it = msg.match(/\_[^\<\>]+\_/g)){
			msg = $msg.html();
			it.forEach(function(item){
				msg = msg.replace(item, "<i>" + item.substr(1, item.length - 2) + "</i>");
			});
			$msg.html(msg);
		}
		if(it = msg.match(/\*[^\<\>]+\*/g)){
			msg = $msg.html();
			it.forEach(function(item){
				msg = msg.replace(item, "<i>" + item.substr(1, item.length - 2) + "</i>");
			});
			$msg.html(msg);
		}
		try{
			var jss = $data.users[$data.id].nickname + " ";
			var k = false;
			var isment = false;
			msg = msg + " ";
			if(msg.indexOf('@' + jss)!=-1 && msg.indexOf('<')==-1 && msg.indexOf('>')==-1){
				var nik = new RegExp("@" + $data.users[$data.id].nickname + " ", "g");
				//var ti = msg.match(nik);
				msg = msg.replace(nik, "<b><font color='blue' style='background-color: #C2D3FF; border-radius: 2px;'>@" + jss.trim() + "</font></b> ");
				msg = msg.trim();
				isment = true;
				//msg = msg.replace('@' + jss, "<b><font color='blue'>@" + jss + "</font></b>");
				Spec('success', $data.opts.mc);
			}
			$msg.html(msg);
			var pis;
			msg = $msg.html() + " ";
			for(i in $data.users){
				if($data.users[i].nickname == $data.users[$data.id].nickname) continue;
				pis = new RegExp("@" + $data.users[i].nickname + " ", "g");
				msg = msg.replace(pis, "<b><font color='blue'>@" + $data.users[i].nickname + "</font></b> ");
			}
			msg = msg.replace($msg.html() + " ", $msg.html());
			$msg.html(msg);
			
			msg = $msg.html();
			if(msg.indexOf('@everyone')!=-1 && $data.users[profile.id].equip["STY"] == 'b1_gm'){
				msg = msg.replace('@everyone', "<b><font color='blue' style='background-color: #C2D3FF; border-radius: 2px;'>@everyone</font></b>");
				Spec('success', $data.opts.mc);
				isment = true;
			}
			$msg.html(msg);
			msg = $msg.html();
			var eld = false;
			var k;
			if(!$data.opts.wd){
				var kw = $.cookie('kkw');
				if(!kw) kw = [];
				else{
					kw = decodeURIComponent(kw);
					kw = kw.split(',');
				}
				kw.forEach(function(v, i){
					if(msg.indexOf(v)!=-1){
						k = new RegExp(v, "g");
						msg = msg.replace(k, '<font color="white" style="background-color: #FF0000; border-radius: 1.1px;">' + v + '</font>');
						if(!eld){
							Spec('success', $data.opts.kw);
							eld = true;
						}
					}
				});
			}else{
				var kw = $.cookie('kkw');
				if(!kw) kw = [];
				else{
					kw = decodeURIComponent(kw);
					kw = kw.split(',');
				}
				kw.forEach(function(v, i){
					if(msg.indexOf(v + ' ')!=-1){
						k = new RegExp(v + ' ', "g");
						msg = msg.replace(k, '<font color="white" style="background-color: #FF0000; border-radius: 1.1px;">' + v + '</font>');
						if(!eld){
							Spec('success', $data.opts.kw);
							eld = true;
						}
					}
				});
			}
			$msg.html(msg);
			/*if(isment){
				msg = $msg.html();
				msg = msg.replace(msg, "<font style='background-color: #C2D3FF;'>" + msg + "</font>");
				$msg.html(msg);
			}*/
		}catch(e){
			console.log(e.toString());
		}
		if(link = msg.match(/https?:\/\/[\w\.\?\/&#%=\-\_\+]+/g)){
			if(msg.indexOf('<script>')==-1 || msg.indexOf('<img')==-1){
				msg = $msg.html();
				link.forEach(function(item){
					msg = msg.replace(item, "<a href='#' style='color: #2222FF;' onclick='if(confirm(\"" + L['linkWarning'] + "\")) window.open(\"" + item + "\");'>" + item + "</a>");
				});
				$msg.html(msg);
			}
		}
	}
	if(from){
		if(from !== true) $data._recentFrom = from;
		$msg.html("<label style='color: #7777FF; font-weight: bold;'>&lt;" + L['whisper'] + "&gt;</label>" + $msg.html());
	}

	try{if(profile.title.charAt() != '→'){addonNickname($bar, { equip: equip }, spec);}}catch(e){addonNickname($bar, { equip: equip }, spec);}
	$stage.chat.scrollTop(999999999);
}
function drawCanvas (data) {
	route('drawCanvas', data);
}
function notice(msg, head){
	var time = new Date();
	
	playSound('k');
	stackChat();
	$("#Chat,#chat-log-board").append($("<div>").addClass("chat-item chat-notice")
		.append($("<div>").addClass("chat-head").text(head || L['notice']))
		.append($("<div>").addClass("chat-body").html(msg))
		.append($("<div>").addClass("chat-stamp").text(time.toLocaleTimeString()))
	);
	$stage.chat.scrollTop(999999999);
	if(head == "tail") console.warn(time.toLocaleString(), msg);
}
function hwak(msg){
	var time = new Date();
	
	playSound('k');
	stackChat();
	$("#Chat,#chat-log-board").append($("<div>").addClass("chat-item chat-notice")
		.append($("<div>").addClass("chat-head").html('<i class="fa fa-bullhorn">'))
		.append($("<div>").addClass("chat-body").text(msg))
		.append($("<div>").addClass("chat-stamp").text(time.toLocaleTimeString()))
	);
	$stage.chat.scrollTop(999999999);
}
function stackChat(){
	var $v = $("#Chat .chat-item");
	var $w = $("#chat-log-board .chat-item");
	
	if($v.length > 99){
		$v.first().remove();
	}
	if($w.length > 199){
		$w.first().remove();
	}
}
function iGoods(key){
	var obj;
	
	if(key.charAt() == "$"){
		obj = $data.shop[key.slice(0, 4)];
	}else{
		obj = $data.shop[key];
	}
	return {
		_id: key,
		group: obj.group,
		term: obj.term,
		name: iName(key),
		cost: obj.cost,
		image: iImage(key, obj),
		desc: iDesc(key),
		options: obj.options
	};
}
function iName(key, oj){
	if(key == 'dizzy_rainbow' && $data.opts.dz) return 0;
	try{
		if(key.charAt() == "$") return L[key.slice(0, 4)][0] + ' - ' + key.slice(4);
		return L[key][0];
	}catch(e){
		return 0;
	}
}
function iDesc(key){
	if(key.charAt() == "$") return L[key.slice(0, 4)][1];
	else return L[key][1];
}
function iImage(key, sObj){
	var obj;
	var gif;
	if(key){
		if(key.charAt() == "$"){
			return iDynImage(key.slice(1, 4), key.slice(4));
		}
	}else if(typeof sObj == "string") sObj = { _id: "def", group: sObj, options: {} };
	obj = $data.shop[key] || sObj;
	gif = obj.options.hasOwnProperty('gif') ? ".gif" : ".png";
	if(obj._id == 'dizzy_rainbow' && $data.opts.dz) return cdn + "/img/kkutu/moremi/back/def.png";
	if(obj.group.slice(0, 3) == "BDG") return cdn + "/img/kkutu/moremi/badge/" + obj._id + gif;
	return (obj.group.charAt(0) == 'M')
		? cdn + "/img/kkutu/moremi/" + obj.group.slice(1) + "/" + obj._id + gif
		: cdn + "/img/kkutu/shop/" + obj._id + gif;
}
function iDynImage(group, data){
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext('2d');
	var i;
	
	canvas.width = canvas.height = 50;
	ctx.font = "24px NBGothic";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	switch(group){
		case 'WPC':
		case 'WPB':
		case 'WPA':
			i = [ 'WPC', 'WPB', 'WPA' ].indexOf(group);
			ctx.beginPath();
			ctx.arc(25, 25, 25, 0, 2 * Math.PI);
			ctx.fillStyle = [ "#DDDDDD", "#A6C5FF", "#FFEF31" ][i];
			ctx.fill();
			ctx.fillStyle = [ "#000000", "#4465C3", "#E69D12" ][i];
			ctx.fillText(data, 25, 25);
			break;
		default:
	}
	return canvas.toDataURL();
}
function queueObtain(data){
	if($stage.dialog.obtain.is(':visible')){
		$data._obtain.push(data);
	}else{
		drawObtain(data);
		showDialog($stage.dialog.obtain, true);
	}
}
function drawObtain(data){
	playSound('success');

	$("#obtain-image").css('background-image', "url(" + iImage(data.key) + ")");
	$("#obtain-name").html(iName(data.key));
}
function renderMoremi(target, equip){
	var $obj = $(target).empty();
	var LR = { 'Mlhand': "Mhand", 'Mrhand': "Mhand" };
	var i, key;
	
	if(!equip) equip = {};
	
	for(i in MOREMI_PART){
		key = 'M' + MOREMI_PART[i];
		if(key == 'Meyeacc' || key == 'Mrhand' || key == "Mlhand") continue;
		if(key != 'Mskin'){
			$obj.append($("<img>")
				.addClass("moremies moremi-" + key.slice(1))
				.attr('src', iImage(equip[key], LR[key] || key))
				.css({ 'width': "100%", 'height': "100%" })
			);
		}
	}
	key = 'Meyeacc';
	$obj.append($("<img>")
		.addClass("moremies moremi-" + key.slice(1))
		.attr('src', iImage(equip[key], LR[key] || key))
		.css({ 'width': "100%", 'height': "100%" })
	);
	key = 'Mrhand';
	$obj.append($("<img>")
		.addClass("moremies moremi-" + key.slice(1))
		.attr('src', iImage(equip[key], LR[key] || key))
		.css({ 'width': "100%", 'height': "100%" })
	);
	key = 'Mlhand';
	$obj.append($("<img>")
		.addClass("moremies moremi-" + key.slice(1))
		.attr('src', iImage(equip[key], LR[key] || key))
		.css({ 'width': "100%", 'height': "100%" })
	);
	if(key = equip['BDG']){
		$obj.append($("<img>")
			.addClass("moremies moremi-badge")
			.attr('src', iImage(key))
			.css({ 'width': "100%", 'height': "100%" })
		);
	}
	$obj.children(".moremi-back").after($("<img>").addClass("moremies moremi-body")
		.attr('src', equip.robot ? cdn + "/img/kkutu/moremi/robot.png" : iImage(equip['Mskin'], 'Mskin'))
		.css({ 'width': "100%", 'height': "100%" })
	);
	$obj.children(".moremi-rhand").css('transform', "scaleX(-1)");
}
function renderAccountMoremi(equip){
	var $obj = $("#account-moremi").empty();
	var LR = { 'Mlhand': "Mhand", 'Mrhand': "Mhand" };
	var i, key;
	
	if(!equip) equip = {};
	key = 'Mskin';
	$obj.append($("<img>")
		.addClass("moremies moremi-" + key.slice(1))
		.attr('src', iImage(equip[key], LR[key] || key))
		.css({ 'width': "100%", 'height': "100%" })
	);
	for(i in MOREMI_PART){
		key = 'M' + MOREMI_PART[i];
		if(key == 'Meyeacc' || key == 'Mrhand' || key == "Mlhand" || key == "Mback" || key == "Mskin") continue;
		$obj.append($("<img>")
			.addClass("moremies moremi-" + key.slice(1))
			.attr('src', iImage(equip[key], LR[key] || key))
			.css({ 'width': "100%", 'height': "100%" })
		);
	}
	key = 'Meyeacc';
	$obj.append($("<img>")
		.addClass("moremies moremi-" + key.slice(1))
		.attr('src', iImage(equip[key], LR[key] || key))
		.css({ 'width': "100%", 'height': "100%" })
	);
	key = 'Mrhand';
	$obj.append($("<img>")
		.addClass("moremies moremi-" + key.slice(1))
		.attr('src', iImage(equip[key], LR[key] || key))
		.css({ 'width': "100%", 'height': "100%" })
	);
	key = 'Mlhand';
	$obj.append($("<img>")
		.addClass("moremies moremi-" + key.slice(1))
		.attr('src', iImage(equip[key], LR[key] || key))
		.css({ 'width': "100%", 'height': "100%" })
	);
	$obj.children(".moremi-back").after($("<img>").addClass("moremies moremi-body")
		.attr('src', equip.robot ? cdn + "/img/kkutu/moremi/robot.png" : iImage(equip['Mskin'], 'Mskin'))
		.css({ 'width': "100%", 'height': "100%" })
	);
	$obj.children(".moremi-rhand").css('transform', "scaleX(-1)");
}
function commify(val){
	var tester = /(^[+-]?\d+)(\d{3})/;
	
	if(val === null) return "?";
	
	val = val.toString();
	while(tester.test(val)) val = val.replace(tester, "$1,$2");
	
	return val;
}
function setLocation(place){
	if(place) location.hash = "#"+place;
	else location.hash = "";
}
function fail(code){
	var jsa = L['error_' + code ];
	return pfAlert(jsa.replace(/\n/g, '<br>'));
}
function yell(msg){
	//$stage.yell.show().css('opacity', 1).html(msg);
	$stage.yell.show().css('opacity', 0).html(msg);
	$stage.yell.animate({ 'opacity': 1 }, 3300)
	addTimeout(function(){
		$stage.yell.animate({ 'opacity': 0 }, 3300);
		addTimeout(function(){
			$stage.yell.hide();
		}, 3000);
	}, 4300);
}
