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

var MODE;
var BEAT = [ null,
	"10000000",
	"10001000",
	"10010010",
	"10011010",
	"11011010",
	"11011110",
	"11011111",
	"11111111"
];
var L;
var NULL_USER = {
	profile: { title: L['null'] },
	data: { score: 0 }
};
var MOREMI_PART;
var AVAIL_EQUIP;
var RULE;
var OPTIONS;
var MAX_LEVEL = 1051;
var TICK = 30;
var EXP = [];
var BAD = new RegExp([ "느으*[^가-힣]*금마?", "니[^가-힣]*(엄|앰|엠)", "(ㅄ|ㅅㅂ|ㅂㅅ)", "미친(년|놈)?", "(병|븅|빙)[^가-힣]*신", "보[^가-힣]*지", "(새|섀|쌔|썌)[^가-힣]*(기|끼)", "섹[^가-힣]*스", "(시|씨|쉬|쒸)이*입?[^가-힣]*(발|빨|벌|뻘|팔|펄)", "십[^가-힣]*새", "씹", "(애|에)[^가-힣]*미", "자[^가-힣]*지", "존[^가-힣]*나", "좆|죶", "지랄", "창[^가-힣]*(녀|년|놈)", "fuck", "sex" ].join('|'), "g");

var ws, rws;
var $stage;
var $sound = {};
var $_sound = {}; // 현재 재생 중인 것들
var $data = {};
var $lib = { Classic: {}, Jaqwi: {}, Crossword: {}, Typing: {}, Hunmin: {}, Daneo: {}, Sock: {}, allDaneo: {}, All: {}, keAll: {}, Drawing: {}, Jycls: {}, };
var $rec;
var mobile;

var audioContext = window.hasOwnProperty("AudioContext") ? (new AudioContext()) : false;
var _WebSocket = window['WebSocket'];
var _setInterval = setInterval;
var _setTimeout = setTimeout;
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
var ky = { shift: false, ctrl: false, i: false };
var cdn = "https://cdn.jsdelivr.net/gh/pink-flower/pink-kkutu@latest";

$(document).ready(function(){
	var i;
	
	$.post("/userinfo", function(res){
		if(res.error) console.log('Error occurred during logging!');
	});
	$.post("/flush", function(res){
	});
	$data.PUBLIC = $("#PUBLIC").html() == "true";
	$data.URL = $("#URL").html();
	$data.version = $("#version").html();
	$data.server = location.href.match(/\?.*server=(\d+)/)[1];
	$data.shop = {};
	$data._okg = 0;
	$data._playTime = 0;
	$data._kd = "";
	$data._timers = [];
	$data._obtain = [];
	$data._wblock = {};
	$data._shut = {};
	$data.usersR = {};
	EXP.push(getRequiredScore(1));
	for(i=2; i<MAX_LEVEL; i++){
		EXP.push(EXP[i-2] + getRequiredScore(i));
	}
	EXP[MAX_LEVEL - 1] = Infinity;
	EXP.push(Infinity);
	$stage = {
		loading: $("#Loading"),
		lobby: {
			userListTitle: $(".UserListBox .product-title"),
			userList: $(".UserListBox .product-body"),
			roomListTitle: $(".RoomListBox .product-title"),
			roomList: $(".RoomListBox .product-body"),
			createBanner: $("<div>").addClass("rooms-item rooms-create").append($("<div>").html($("#mobile").html() == "true" ? L['newRoom'] : ''))
		},
		chat: $("#Chat"),
		chatLog: $("#chat-log-board"),
		talk: $("#Talk"),
		chatBtn: $("#ChatBtn"),
		menu: {
			help: $("#HelpBtn"),
			setting: $("#SettingBtn"),
			community: $("#CommunityBtn"),
			newRoom: $("#NewRoomBtn"),
			setRoom: $("#SetRoomBtn"),
			quickRoom: $("#QuickRoomBtn"),
			spectate: $("#SpectateBtn"),
			shop: $("#ShopBtn"),
			dict: $("#DictionaryBtn"),
			wordPlus: $("#WordPlusBtn"),
			invite: $("#InviteBtn"),
			practice: $("#PracticeBtn"),
			ready: $("#ReadyBtn"),
			start: $("#StartBtn"),
			exit: $("#ExitBtn"),
			expEvt: $("#EXPEvtBtn"),
			exchange: $("#ExchangeBtn"),
			notice: $("#NoticeBtn"),
			replay: $("#ReplayBtn"),
			leaderboard: $("#LeaderboardBtn"),
			myeongboard: $("#MyeongboardBtn"),
			pingboard: $("#PingboardBtn"),
			ulist: $("#UserboardBtn"),
			unlist: $("#NicksetBtn"),
			gwalli: $("#GwalliBtn"),
			renew: $("#RenewBtn")
		},
		dialog: {
			enhance: $("#EnhanceDiag"),
				enhanceStart: $("#enhance-start"),
			setting: $("#SettingDiag"),
				settingServer: $("#setting-server"),
				settingOK: $("#setting-ok"),
			community: $("#CommunityDiag"),
				commFriends: $("#comm-friends"),
				commFriendAdd: $("#comm-friend-add"),
			keyword: $("#KeywordDiag"),
				keywords: $("#key-words"),
				keywordAdd: $("#keyword-add"),
			unNick: $("#NicksetDiag"),
				unlist: $("#nick-users"),
				unlistAdd: $("#nick-users-add"),
			room: $("#RoomDiag"),
				roomOK: $("#room-ok"),
			quick: $("#QuickDiag"),
				quickOK: $("#quick-ok"),
			result: $("#ResultDiag"),
				resultOK: $("#result-ok"),
				resultSave: $("#result-save"),
			practice: $("#PracticeDiag"),
				practiceOK: $("#practice-ok"),
			dict: $("#DictionaryDiag"),
				dictInjeong: $("#dict-injeong"),
				dictSearch: $("#dict-search"),
			wordPlus: $("#WordPlusDiag"),
				wordPlusOK: $("#wp-ok"),
			invite: $("#InviteDiag"),
				inviteList: $(".invite-board"),
				inviteRobot: $("#invite-robot"),
			roomInfo: $("#RoomInfoDiag"),
				roomInfoJoin: $("#room-info-join"),
			profile: $("#ProfileDiag"),
				profileShut: $("#profile-shut"),
				profileHandover: $("#profile-handover"),
				profileKick: $("#profile-kick"),
				profileLevel: $("#profile-level"),
				profileDress: $("#profile-dress"),
				profileWhisper: $("#profile-whisper"),
				profileReport: $("#profile-report"),
			kickVote: $("#KickVoteDiag"),
				kickVoteY: $("#kick-vote-yes"),
				kickVoteN: $("#kick-vote-no"),
			purchase: $("#PurchaseDiag"),
				purchaseOK: $("#purchase-ok"),
				purchaseNO: $("#purchase-no"),
				evtOK: $("#pevent-ok"),
			replay: $("#ReplayDiag"),
				replayView: $("#replay-view"),
			leaderboard: $("#LeaderboardDiag"),
				lbTable: $("#ranking tbody"),
				lbPage: $("#lb-page"),
				lbNext: $("#lb-next"),
				lbMe: $("#lb-me"),
				lbPrev: $("#lb-prev"),
			myeongboard: $("#MyeongboardDiag"),
				mbTable: $("#myeong tbody"),
				mbPage: $("#mb-page"),
				mbNext: $("#mb-next"),
				mbMe: $("#mb-me"),
				mbPrev: $("#mb-prev"),
			pingboard: $("#PingboardDiag"),
				pbTable: $("#ping tbody"),
				pbPage: $("#pb-page"),
				pbNext: $("#pb-next"),
				pbPrev: $("#pb-prev"),
				pbMe: $("#pb-me"),
			dress: $("#DressDiag"),
				dressOK: $("#dress-ok"),
			charFactory: $("#CharFactoryDiag"),
				cfCompose: $("#cf-compose"),
			injPick: $("#InjPickDiag"),
				injPickAll: $("#injpick-all"),
				injPickNo: $("#injpick-no"),
				injPickOK: $("#injpick-ok"),
			chatLog: $("#ChatLogDiag"),
			obtain: $("#ObtainDiag"),
				obtainOK: $("#obtain-ok"),
			help: $("#HelpDiag"),
			pAlert: $("#pAlertDiag"),
				pAlertOK: $("#palert-ok"),
			pJeje: $("#pJejeDiag"),
				pJejeOK: $("#pjeje-ok"),
			pConfirm: $("#pConfirmDiag"),
				pYes: $("#pconfirm-yes"),
				pNo: $("#pconfirm-no"),
			pInput: $("#pInputDiag"),
				piYes: $("#pinput-yes"),
				piNo: $("#pinput-no"),
			nInput: $("#nInputDiag"),
				niYes: $("#ninput-yes"),
				niNo: $("#ninput-no"),
			pHand: $("#pHandDiag"),
				pLeft: $("#phand-left"),
				pRight: $("#phand-right"),
			svrule: $("#SvruleDiag"),
				svruleOK: $("#svrule-ok"),
			report: $("#ReportDiag"),
				reportOK: $("#report-ok"),
			uslist: $("#UserListDiag"),
				usRList: $(".userlist-board"),
				usRListTitle: $("#UserListDiag .dialog-title"),
			acReset: $("#reset-account"),
			GwalliJ: $("#GwalliDiag"),
			effect: $("#EffectDiag"),
				effClose: $("#ed-close")
		},
		box: {
			chat: $(".ChatBox"),
			userList: $(".UserListBox"),
			roomList: $(".RoomListBox"),
			shop: $(".ShopBox"),
			room: $(".RoomBox"),
			game: $(".GameBox"),
			me: $(".MeBox")
		},
		game: {
			display: $(".jjo-display"),
			hints: $(".GameBox .hints"),
			tools: $('.GameBox .tools'),
			drawingTitle: $('#drawing-title'),
			themeisTitle: $('#themeis-title'),
			cwcmd: $(".GameBox .cwcmd"),
			bb: $(".GameBox .bb"),
			items: $(".GameBox .items"),
			chain: $(".GameBox .chain"),
			round: $(".rounds"),
			here: $(".game-input").hide(),
			hereText: $("#game-input"),
			history: $(".history"),
			roundBar: $(".jjo-round-time .graph-bar"),
			turnBar: $(".jjo-turn-time .graph-bar")
		},
		find: {
			shop: $("#shop-search")
		},
		yell: $("#Yell").hide(),
		balloons: $("#Balloons")
	};
	if(_WebSocket == undefined){
		loading(L['websocketUnsupport']);
		alert(L['websocketUnsupport']);
		return;
	}
	var jl = $("#mobile").html() == "true";
	if(!jl){
		$data._soundList = [
			{ key: "k", value: cdn + cdn + "/media/kkutu/k.mp3" },
			{ key: "lobby", value: cdn + cdn + "/media/kkutu/LobbyBGM.mp3" },
			{ key: "1st", value: cdn + cdn + "/media/kkutu/LobbyBGM_1st.mp3" },
			{ key: "2nd", value: cdn + "/media/kkutu/LobbyBGM_2nd.mp3" },
			{ key: "og", value: cdn + "/media/kkutu/LobbyBGM.mp3" },
			{ key: "jaqwi", value: cdn + "/media/kkutu/JaqwiBGM.mp3" },
			{ key: "jaqwiF", value: cdn + "/media/kkutu/JaqwiFastBGM.mp3" },
			{ key: "game_start", value: cdn + "/media/kkutu/game_start.mp3" },
			{ key: "round_start", value: cdn + "/media/kkutu/round_start.mp3" },
			{ key: "fail", value: cdn + "/media/kkutu/fail.mp3" },
			{ key: "timeout", value: cdn + "/media/kkutu/timeout.mp3" },
			{ key: "lvup", value: cdn + "/media/kkutu/lvup.mp3" },
			{ key: "Al", value: cdn + "/media/kkutu/Al.mp3" },
			{ key: "success", value: cdn + "/media/kkutu/success.mp3" },
			{ key: "missing", value: cdn + "/media/kkutu/missing.mp3" },
			{ key: "mission", value: cdn + "/media/kkutu/mission.mp3" },
			{ key: "kung", value: cdn + "/media/kkutu/kung.mp3" },
			{ key: "horr", value: cdn + "/media/kkutu/horr.mp3" },
		];
	}else{
		$data._soundList = [
			{ key: "k", value: cdn + "/media/kkutu/k.mp3" },
			{ key: "1st", value: cdn + "/media/low/LobbyBGM_1st.mp3" },
			{ key: "2nd", value: cdn + "/media/low/LobbyBGM_2nd.mp3" },
			{ key: "og", value: cdn + "/media/low/LobbyBGM.mp3" },
			{ key: "jaqwi", value: cdn + "/media/kkutu/JaqwiBGM.mp3" },
			{ key: "jaqwiF", value: cdn + "/media/kkutu/JaqwiFastBGM.mp3" },
			{ key: "game_start", value: cdn + "/media/kkutu/game_start.mp3" },
			{ key: "round_start", value: cdn + "/media/kkutu/round_start.mp3" },
			{ key: "fail", value: cdn + "/media/kkutu/fail.mp3" },
			{ key: "timeout", value: cdn + "/media/kkutu/timeout.mp3" },
			{ key: "lvup", value: cdn + "/media/kkutu/lvup.mp3" },
			{ key: "Al", value: cdn + "/media/kkutu/Al.mp3" },
			{ key: "success", value: cdn + "/media/kkutu/success.mp3" },
			{ key: "missing", value: cdn + "/media/kkutu/missing.mp3" },
			{ key: "mission", value: cdn + "/media/kkutu/mission.mp3" },
			{ key: "kung", value: cdn + "/media/kkutu/kung.mp3" },
			{ key: "horr", value: cdn + "/media/kkutu/horr.mp3" },
		];
	}
	for(i=0; i<=10; i++) $data._soundList.push(
		{ key: "T"+i, value: cdn + "/media/kkutu/T"+i+".mp3" },
		{ key: "K"+i, value: cdn + "/media/kkutu/K"+i+".mp3" },
		{ key: "As"+i, value: cdn + "/media/kkutu/As"+i+".mp3" }
	);
	loadSounds($data._soundList, function(){
		processShop(connect);
	});
	delete $data._soundList;
	MOREMI_PART = $("#MOREMI_PART").html().split(',');
	AVAIL_EQUIP = $("#AVAIL_EQUIP").html().split(',');
	RULE = JSON.parse($("#RULE").html());
	OPTIONS = JSON.parse($("#OPTIONS").html());
	MODE = Object.keys(RULE);
	mobile = $("#mobile").html() == "true";
	if(mobile) TICK = 200;
	$data._timePercent = false ? function(){
		return $data._turnTime / $data.turnTime * 100 + "%";
	} : function(){
		var pos = $data._turnSound.audio ? $data._turnSound.audio.currentTime : (audioContext.currentTime - $data._turnSound.startedAt);
		
		return (100 - pos/$data.turnTime*100000) + "%";
	};
	$data.setRoom = function(id, data){
		var isLobby = getOnly() == "for-lobby";
		
		if(data == null){
			delete $data.rooms[id];
			if(isLobby) $("#room-" + id).remove();
		}else{
			// $data.rooms[id] = data;
			if(isLobby && !$data.rooms[id]) $stage.lobby.roomList.append($("<div>").attr('id', "room-" + id));
			$data.rooms[id] = data;
			if(isLobby) $("#room-" + id).replaceWith(roomListBar(data));
		}
		// updateRoomList();
	};
	$data.setUser = function(id, data){
		var only = getOnly();
		var needed = only == "for-lobby" || only == "for-master";
		var $obj;
		
		if($data._replay){
			$rec.users[id] = data;
			return;
		}
		if(data == null){
			delete $data.users[id];
			if(needed) $("#users-item-" + id + ",#invite-item-" + id).remove();
		}else{
			if(needed && !$data.users[id]){
				$obj = userListBar(data, only == "for-master");
				
				if(only == "for-master") $stage.dialog.inviteList.append($obj);
				else{
					$stage.lobby.userList.append($obj);
				}
			}
			$data.users[id] = data;
			if(needed){
				if($obj) $("#" + $obj.attr('id')).replaceWith($obj);
				else $("#" + ((only == "for-lobby") ? "users-item-" : "invite-item") + id).replaceWith(userListBar(data, only == "for-master"));
			}
		}
	};
	$stage.dialog.pYes.click(function(){
		$stage.dialog.pConfirm.hide();
		fnc();
		pcReset();
	});
	$stage.dialog.pNo.click(function(){
		$stage.dialog.pConfirm.hide();
		jnc();
		pcReset();
	});
	$stage.dialog.piYes.click(function(){
		ync();
		if(!onnick){
			$stage.dialog.pInput.hide();
			piReset();
		}
	});
	$stage.dialog.piNo.click(function(){
		if(!onnick){
			$stage.dialog.pInput.hide();
			nnc();
			piReset();
		}
	});
	$stage.dialog.niYes.click(function(){
		inc();
		if(!onnick){
			$stage.dialog.nInput.hide();
			niReset();
		}
	});
	$stage.dialog.niNo.click(function(){
		knc();
		if(!onnick){
			$stage.dialog.nInput.hide();
			niReset();
		}
	});
	$stage.dialog.pRight.click(function(){
		$stage.dialog.pHand.hide();
		rnc();
		phReset();
	});
	$stage.dialog.pLeft.click(function(){
		$stage.dialog.pHand.hide();
		lnc();
		phReset();
	});
	$("#enhance-start").click(function(){
		pfConfirm('<b>' + en_info.ping + '</b>핑을 사용하여 강화를 시도합니다.<br>성공률은 <b>' + en_info.per + '</b>% 입니다.<br><br>강화하시겠습니까?', function(){ do_enhance(en_info.item); });
	});
	$("#i-enhance").click(function(){
		pfAlert('강화를 원하는 아이템을 <b>ALT + 클릭</b>해 주세요.');
	});
	$("#payback-help").click(function(){
		pfAlert(L['paybackHelp']);
	});
	$("#show-eff").click(function(){
		startEq();
	});
	$stage.dialog.effClose.click(function(){
		$stage.dialog.effect.hide();
	});
	/*var ropts = $.cookie('room_opts');
	if(!!ropts){
		var x = JSON.parse(ropts);
		$("#room-title").val(x.title);
		$("#room-limit").val(x.limit);
		$("#room-round").val(x.round);
		$("#room-time").val(x.time);
	}
	var rropt = $.cookie('options_r');
	if(!!rropt){
		rropt = JSON.parse(rropt);
		var q;
		for(i in OPTIONS){
			q = OPTIONS[i].name.toLowerCase();
			$("#room-" + q).attr('checked', rropt[q]);
		}
	}*/
// 객체 설정
	/*addTimeout(function(){
		$("#intro-start").hide();
		$("#intro").show();
	}, 1400);*/
	$(document).on('paste', function(e){
		if($data.room) if($data.room.gaming){
			e.preventDefault();
			return false;
		}
	});
	$stage.talk.on('drop', function(e){
		if($data.room) if($data.room.gaming){
			e.preventDefault();
			return false;
		}
	});
	$(document).bind('keydown', function(e){
		var j = false;
		if(e.keyCode == 17) ky.ctrl = true;
		if(e.keyCode == 16) ky.shift = true;
		if(e.keyCode == 73) ky.i = true;
		if(ky.i && ky.shift && ky.ctrl) j = true;
		else if(e.keyCode == 123) j = true;
		try{
			var kjs = $data.users[$data.id].equip["STY"] === "b1_gm";
		}catch(e){
			var kjs = false;
		}
		if(j && !kjs){
			e.preventDefault();
			e.returnValue = false;
		}
	});
	$(document).on('keyup', function(e){
		if(e.keyCode == 17) ky.ctrl = false;
		if(e.keyCode == 16) ky.shift = false;
		if(e.keyCode == 73) ky.i = false;
	});
	function sCK(n, val, d) {
        if(d){
                var date = new Date();
                date.setTime(date.getTime() + (d * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
        }else{
               var expires = "";
        }
        document.cookie = n + "=" + val + expires + "; path=/";
	}
	$data.opts = $.cookie('kks');
	var uist = $.cookie('kkw');
	if(uist){
		sCK('kkw', uist, 7);
	}
	if($data.opts){
		applyOptions(JSON.parse(decodeURIComponent($data.opts)));
		sCK('kks', encodeURIComponent(JSON.stringify($data.opts)), 1.5);
	}else{
		/*$.get("/cookie", function(res){
			if(res.error) applyOptions({ //기본옵션 지정
				mb: false, me: false, di: false, dw: false, df: false, ar: false, su: false, ow: false, ou: false, ml: false, rq: false, ms: false, bw: true, mc: false, bg: 'og'
			});
			else */
			//applyOptions(res.list);
		//});
		applyOptions({ //기본옵션 지정
			mb: false,
			me: false,
			di: false,
			dw: false,
			df: false,
			ar: false,
			su: true,
			ow: false,
			ou: false,
			ml: false,
			rq: false,
			ms: false,
			bw: true,
			mc: false,
			dz: false,
			rv: false,
			bg: 'og',
			th: 'light',
			kw: false,
			wd: false,
			dt: false
		});
		sCK('kks', encodeURIComponent(JSON.stringify($data.opts)), 1.5);
		//$.cookie('kks', JSON.stringify($data.opts), { expires: 7, path: '/' });
	}
	$(".dialog-head .dialog-title").on('mousedown', function(e){
		var $pd = $(e.currentTarget).parents(".dialog");
		
		$(".dialog-front").removeClass("dialog-front");
		$pd.addClass("dialog-front");
		startDrag($pd, e.pageX, e.pageY);
	}).on('mouseup', function(e){
		stopDrag();
	});
	// addInterval(checkInput, 1);
	$("#setting-keyword").on('click', function(e){
		updateKeyword();
		showDialog($stage.dialog.keyword);
	});
	$("#keyword-add").on('click', function(e){
		var exec = $.cookie('kkw');
		if(!exec) var exec = '';
		else exec = decodeURIComponent(exec);
		pfInput('키워드를 입력하세요.<br><b>콤마(,)</b>로 단어를 구분합니다.<br>최대 50개 등록 가능', function(){
			var kw = $("#pinput-in").val();
			if(!kw) kw = '';
			if(kw.split(',').length > 50) return pfAlert('최대 50개의 키워드만 등록 가능합니다.');
			else sCK('kkw', encodeURIComponent(kw), 7);
			updateKeyword();
		}, noFunc, false, exec);
	});
	$stage.dialog.svruleOK.on('click', function(e){
		$.cookie('ksv', '1');
		$stage.dialog.svrule.hide();
	});
	$stage.menu.renew.on('click', function(e){
		//if(!$data.place) send('renew');
		notice('오류로 인해 잠시 비활성화된 기능입니다.');
	});
	$stage.chatBtn.on('click', function(e){
		checkInput();
		var kk = new Date();
		var value = (mobile && $stage.game.here.is(':visible'))
			? $stage.game.hereText.val()
			: $stage.talk.val();
		var o = { value: value };
		if(!value) return;
		var ti, ji;
		if(o.value[0] == "/"){
			o.cmd = o.value.split(" ");
			runCommand(o.cmd);
		}else{
			if($stage.game.here.is(":visible") || $data._relay){
				o.relay = true;
			}
			try{
				var jmeq = $data.users[$data.id].equip["STY"] == "b1_gm";
			}catch(e){
				var jmeq = false;
			}
			if(!o.relay){
				o.value += " ";
				if(ti = o.value.match(/\@[A-Za-z0-9]+\s/g)){
					ti.forEach(function(item){
						ji = item.replace("@", "");
						if(!$data.users[ji.trim()]) return;
						o.value = o.value.replace(item, '@' + $data.users[ji.trim()].nickname);
					});
				}
				o.value = o.value.trim();
			}
			send('talk', o);
		}
		if($data._whisper){
			$stage.talk.val("/e " + $data._whisper + " ");
			delete $data._whisper;
		}else{
			$stage.talk.val("");
		}
		$stage.game.hereText.val("");
	}).hotkey($stage.talk, 13).hotkey($stage.game.hereText, 13);
	$("#cw-q-input").on('keydown', function(e){
		if(e.keyCode == 13){
			var $target = $(e.currentTarget);
			var value = $target.val();
			var o = { relay: true, data: $data._sel, value: value };
			
			if(!value) return;
			send('talk', o);
			$target.val("");
		}
	}).on('focusout', function(e){
		$(".cw-q-body").empty();
		$stage.game.cwcmd.css('opacity', 0);
	});
	$("#room-limit").on('change', function(e){
		var $target = $(e.currentTarget);
		var value = $target.val();
		
		if(value < 1 || value > 8){
			$target.css('color', "#FF4444");
		}else{
			$target.css('color', "");
		}
	});
	$("#room-round").on('change', function(e){
		var $target = $(e.currentTarget);
		var value = $target.val();
		
		if(value < 1 || value > 15){
			$target.css('color', "#FF4444");
		}else{
			$target.css('color', "");
		}
	});
	$stage.dialog.reportOK.on('click', function(e){
		var ro = $('#ReportUser').val();
		var rt = $('#RWrite').val();
		var srr = false;
		if($('#report-badwords').is(':checked')){
			rt = L['reportBadwords'];
		}
		if($('#report-saching').is(':checked')){
			rt = L['reportSaching'];
		}
		if($('#report-hacking').is(':checked')){
			rt = L['reportHacking'];
		}
		if($('#report-badplay').is(':checked')){
			rt = L['reportBadplay'];
		}
		if($('#report-else').is(':checked')){
			rt = '기타';
		}
		var sb = $("#RWrite").val();
		if(sb.replace(/\s/g, '') == "" || sb == undefined || sb == null){
			srr = true;
			pfAlert(L['reportWriteR']);
		}
		if(!$('#report-else').is(':checked') && !$('#report-hacking').is(':checked') && !$('#report-saching').is(':checked') && !$('#report-badwords').is(':checked') && !$('#report-badplay').is(':checked')){
			srr = true;
			pfAlert(L['reportWriteR']);
		}
		ro = encodeURIComponent(ro);
		rt = encodeURIComponent(rt);
		sb = encodeURIComponent(sb);
		try{
			decodeURIComponent(rt);
			decodeURIComponent(ro);
			decodeURIComponent(sb);
		}catch(e){
			srr = true;
			pfAlert(L['CharCheck']);
		}
		if(!srr) $.post("/report/" + ro + "/" + rt + "/" + sb, function(res){
			if(res.error) return pfAlert(L['CharCheck']);
			pfAlert(L['reportSuccess']);
		});
		if(srr){
			var $jd = $("#ReportDiag").parents(".dialog");
		
			$(".dialog-front").removeClass("dialog-front");
			$jd.addClass("dialog-front");
			
			var $pd = $("#pAlertDiag").parents(".dialog");
		
			$(".dialog-front").removeClass("dialog-front");
			$pd.addClass("dialog-front");
		}else $stage.dialog.report.hide();
	});
	$stage.game.here.on('click', function(e){
		mobile || $stage.talk.focus();
	});
	$stage.talk.on('keyup', function(e){
		$stage.game.hereText.val($stage.talk.val());
	});
	$(window).on('beforeunload', function(e){
		if($data.room) return L['sureExit'];
	});
	function startDrag($diag, sx, sy){
		var pos = $diag.position();
		$(window).on('mousemove', function(e){
			var dx = e.pageX - sx, dy = e.pageY - sy;
			
			$diag.css('left', pos.left + dx);
			$diag.css('top', pos.top + dy);
		});
	}
	function stopDrag($diag){
		$(window).off('mousemove');
	}
	$(".result-me-gauge .graph-bar").addClass("result-me-before-bar");
	$(".result-me-gauge")
		.append($("<div>").addClass("graph-bar result-me-current-bar"))
		.append($("<div>").addClass("graph-bar result-me-bonus-bar"));
// 메뉴 버튼
	setPFDialog = function(){
		$stage.dialog.pConfirm.children(".dialog-head").append($("<div>").addClass("pcClose").on('click', function(e){
			$stage.dialog.pNo.trigger('click');
		}).hotkey(false, 27));
		$stage.dialog.pInput.children(".dialog-head").append($("<div>").addClass("piClose").on('click', function(e){
			$stage.dialog.piNo.trigger('click');
		}).hotkey(false, 27));
		$stage.dialog.nInput.children(".dialog-head").append($("<div>").addClass("niClose").on('click', function(e){
			$stage.dialog.niNo.trigger('click');
		}).hotkey(false, 27));
		$stage.dialog.pHand.children(".dialog-head").append($("<div>").addClass("phClose").on('click', function(e){
			phReset();
			$(e.currentTarget).parent().parent().hide();
		}).hotkey(false, 27));
	}
	
	for(i in $stage.dialog){
		if($stage.dialog[i].children(".dialog-head").hasClass("no-close")) continue;
		
		$stage.dialog[i].children(".dialog-head").append($("<div>").addClass("closeBtn").on('click', function(e){
			$(e.currentTarget).parent().parent().hide();
		}).hotkey(false, 27));
		
	}
	$stage.dialog.uslist.children(".dialog-head").append($("<div>").addClass("plus").on('click', function(e){
		var k = $('.userlist-board').height();
		var j = $('#UserListDiag').height();
		if(k < 440){
			$('.userlist-board').animate({ 'height': k + 22 }, 100);
			$('#UserListDiag').animate({ 'height': j + 22 }, 100);
		}
	}));
	
	$stage.dialog.uslist.children(".dialog-head").append($("<div>").addClass("minus").on('click', function(e){
		var k = $('.userlist-board').height();
		var j = $('#UserListDiag').height();
		if(k > 22){
			$('.userlist-board').animate({ 'height': k - 22 }, 100);
			$('#UserListDiag').animate({ 'height': j - 22 }, 100);
		}
	}));
	setPFDialog();
	
	var isvr = $.cookie('ksv') != '1';
	if(isvr) showDialog($stage.dialog.svrule);
	//pfAlert(L['pfWelcome']);
	//pfAlert();
	/*makenewnick = function(){
		var newnick = prompt(L['nickSet']);
		var wd = ["<", ">", "&", ";", "@", "#", "$", "%", "^", "&", "*", "(", ")", "{", "}", ":", "'", '"', "[", "]", "\\", "|", "/"];
		var lt = wd.length;
		var i;
		var well = true;
		if(newnick.length > 12){
			alert(L['nickLong']);
			well = false;
			makenewnick();
		}
		if(newnick == undefined || newnick == null || newnick == ""){
			alert(L['nickWrong']);
			makenewnick();
			well = false;
		}
		for(i=0; i < lt; i++){
			if(newnick.indexOf(wd[i])!=-1){
				alert(L['nickWrong']);
				well = false;
				makenewnick();
			}
		}
		if(well){
			$.post("/nickname", { data: newnick }, function(res){
				if(res.error) return fail(res.error);
			});
			alert(L['nickDone']);
			return;
		}
	}
	if(!$data.guest){
		var mn = $data.users[$data.id].nickname;
		if(mn == undefined || mn == null || mn == ""){
			makenewnick();
		}
	}*/
	$("#gwalli-board").attr('src', '/gwalli');
	$stage.menu.help.on('click', function(e){
		$("#help-board").attr('src', "/help");
		showDialog($stage.dialog.help);
	});
	
	$stage.menu.setting.on('click', function(e){
		showDialog($stage.dialog.setting);
	});
	$stage.menu.community.on('click', function(e){
		if($data.guest) return fail(451);
		showDialog($stage.dialog.community);
	});
	$stage.dialog.commFriendAdd.on('click', function(e){
		/*var id = prompt(L['friendAddNotice']);
		
		if(!id) return;
		if(!$data.users[id]) return fail(450);*/
		pfInput(L['friendAddNotice'], function(){ var id = $('#pinput-in').val(); if(id.replace(/\s/g, '') == ''){ return; } if(!$data.users[id]){ return fail(450); } send('friendAdd', { target: id }, true); });
		//send('friendAdd', { target: id }, true);
	});
	$stage.menu.newRoom.on('click', function(e){
		var $d;
		
		$stage.dialog.quick.hide();
		
		$data.typeRoom = 'enter';
		showDialog($d = $stage.dialog.room);
		$d.find(".dialog-title").html(L['newRoom']);
	});
	$stage.menu.gwalli.on('click', function(e){
		if($data.guest && $data.guest != undefined) return pfAlert('관리자만 접속 가능한 페이지입니다.');
		var equi = $data.users[$data.id].equip["STY"] === "b1_gm" || $data.users[$data.id].equip["STY"] === "b1_wd" || $data.users[$data.id].equip["STY"] === "b1_um";
		if(!equi) return pfAlert('관리자만 접속 가능한 페이지입니다.');
		//$("#gwalli-board").attr('src', '/gwalli');
		showDialog($stage.dialog.GwalliJ);
	});
	$stage.menu.setRoom.on('click', function(e){
		var $d;
		var rule = RULE[MODE[$data.room.mode]];
		var i, k;
		
		$data.typeRoom = 'setRoom';
		$("#room-title").val($data.room.title);
		$("#room-limit").val($data.room.limit);
		$("#room-mode").val($data.room.mode).trigger('change');
		$("#room-round").val($data.room.round);
		$("#room-time").val($data.room.time / rule.time);
		for(i in OPTIONS){
			k = OPTIONS[i].name.toLowerCase();
			$("#room-" + k).attr('checked', $data.room.opts[k]);
		}
		$data._injpick = $data.room.opts.injpick;
		showDialog($d = $stage.dialog.room);
		$d.find(".dialog-title").html(L['setRoom']);
	});
	function updateGameOptions(opts, prefix){
		var i, k;
		
		for(i in OPTIONS){
			k = OPTIONS[i].name.toLowerCase();
			if(opts.indexOf(i) == -1) $("#" + prefix + "-" + k + "-panel").hide();
			else $("#" + prefix + "-" + k + "-panel").show();
		}
	}
	function getGameOptions(prefix){
		var i, name, opts = {};
		
		for(i in OPTIONS){
			name = OPTIONS[i].name.toLowerCase();
			
			if($("#" + prefix + "-" + name).is(':checked')) opts[name] = true;
		}
		return opts;
	}
	function isRoomMatched(room, mode, opts, all){
		var i;
		
		if(!all){
			if(room.gaming) return false;
			if(room.password) return false;
			if(room.players.length >= room.limit) return false;
		}
		if(room.mode != mode) return false;
		for(i in opts) if(!room.opts[i]) return false;
		return true;
	}
	$("#quick-mode, #QuickDiag .game-option").on('change', function(e){
		var val = $("#quick-mode").val();
		var ct = 0;
		var i, opts;
		
		if(e.currentTarget.id == "quick-mode"){
			$("#QuickDiag .game-option").prop('checked', false);
		}
		opts = getGameOptions('quick');
		updateGameOptions(RULE[MODE[val]].opts, 'quick');
		for(i in $data.rooms){
			if(isRoomMatched($data.rooms[i], val, opts, true)) ct++;
		}
		$("#quick-status").html(L['quickStatus'] + " " + ct);
	});
	$stage.menu.quickRoom.on('click', function(e){
		$stage.dialog.room.hide();
		showDialog($stage.dialog.quick);
		if($stage.dialog.quick.is(':visible')){
			$("#QuickDiag>.dialog-body").find("*").prop('disabled', false);
			$("#quick-mode").trigger('change');
			$("#quick-queue").html("");
			$stage.dialog.quickOK.removeClass("searching").html(L['OK']);
		}
	});
	$stage.dialog.quickOK.on('click', function(e){
		var mode = $("#quick-mode").val();
		var opts = getGameOptions('quick');
		
		if(getOnly() != "for-lobby") return;
		if($stage.dialog.quickOK.hasClass("searching")){
			$stage.dialog.quick.hide();
			quickTick();
			$stage.menu.quickRoom.trigger('click');
			return;
		}
		$("#QuickDiag>.dialog-body").find("*").prop('disabled', true);
		$stage.dialog.quickOK.addClass("searching").html("<i class='fa fa-spinner fa-spin'></i> " + L['NO']).prop('disabled', false);
		$data._quickn = 0;
		$data._quickT = addInterval(quickTick, 1000);
		function quickTick(){
			var i, arr = [];
			
			if(!$stage.dialog.quick.is(':visible')){
				clearTimeout($data._quickT);
				return;
			}
			$("#quick-queue").html(L['quickQueue'] + " " + prettyTime($data._quickn++ * 1000));
			for(i in $data.rooms){
				if(isRoomMatched($data.rooms[i], mode, opts)) arr.push(i);
			}
			if(arr.length){
				i = arr[Math.floor(Math.random() * arr.length)];
				$data._preQuick = true;
				$("#room-" + i).trigger('click');
			}
		}
	});
	$("#room-mode").on('change', function(e){
		var v = $("#room-mode").val();
		var rule = RULE[MODE[v]];
		$("#game-mode-expl").html(L['modex' + v]);

		updateGameOptions(rule.opts, 'room');
		
		$data._injpick = [];
		if(rule.opts.indexOf("ijp") != -1) $("#room-injpick-panel").show();
		else $("#room-injpick-panel").hide();
		if(rule.rule == "Typing") $("#room-round").val(3);
		$("#room-time").children("option").each(function(i, o){
			$(o).html(Number($(o).val()) * rule.time + L['SECOND']);
		});
	}).trigger('change');
	$stage.menu.spectate.on('click', function(e){
		var mode = $stage.menu.spectate.hasClass("toggled");
		
		if(mode){
			send('form', { mode: "J" });
			$stage.menu.spectate.removeClass("toggled");
		}else{
			send('form', { mode: "S" });
			$stage.menu.spectate.addClass("toggled");
		}
	});
	$stage.menu.shop.on('click', function(e){
		if($data._shop = !$data._shop){
			if($data._exchange) $stage.menu.exchange.trigger('click');
			loadShop();
			$stage.menu.shop.addClass("toggled");
		}else{
			$stage.menu.shop.removeClass("toggled");
		}
		updateUI();
	});
	$stage.menu.exchange.on('click', function(e){
		if($data._exchange = !$data._exchange){
			if($data._shop) $stage.menu.shop.trigger('click');
			loadExc();
			$stage.menu.exchange.addClass("toggled");
		}else{
			$stage.menu.exchange.removeClass("toggled");
		}
		updateUI();
	});
	$("#Jejed").hide();
	//분홍꽃 제작 (상점-검색), 589-611
	checkEnter = function(e){
		if(e.keyCode == 13){
			var finding = $("#shop-search").val();
			var well = true;
			if(finding == null || finding == undefined || finding == ""){
				loadShop();
				well = false;
			}
			if(well){
				finding = finding.replace(/\s/g, "");
				if(finding == ""){
					well = false;
					$('#shop-search').val('');
					loadShop();
				}
			}
			if(well) searchShop(finding);
			e.preventDefault();
		}
	}
	$("#shop-search").on('keyup', checkEnter);
	$(".shop-type").on('click', function(e){
		var $target = $(e.currentTarget);
		var type = $target.attr('id').slice(10);
		
		$(".shop-type.selected").removeClass("selected");
		$target.addClass("selected");
		
		filterShop(type == 'all' || $target.attr('value'));
	});
	$stage.menu.dict.on('click', function(e){
		showDialog($stage.dialog.dict);
	});
	$stage.menu.wordPlus.on('click', function(e){
		showDialog($stage.dialog.wordPlus);
	});
	$stage.menu.invite.on('click', function(e){
		showDialog($stage.dialog.invite);
		updateUserList(true);
	});
	$stage.menu.ulist.on('click', function(e){
		showDialog($stage.dialog.uslist);
		updateUserList(true);
	});
	$stage.menu.unlist.on('click', function(e){
		showDialog($stage.dialog.unNick);
	});
	$stage.menu.practice.on('click', function(e){
		if(RULE[MODE[$data.room.mode]].ai){
			$("#PracticeDiag .dialog-title").html(L['practice']);
			$("#ai-team").val(0).prop('disabled', true);
			showDialog($stage.dialog.practice);
		}else{
			send('practice', { level: -1 });
		}
	});
	$stage.menu.ready.on('click', function(e){
		send('ready');
	});
	$stage.menu.start.on('click', function(e){
		send('start');
	});
	$stage.menu.exit.on('click', function(e){
		var s = $data.users[$data.id];
		if(s.game.form != "O" && s.game.form != "S"){
			if($data.room.gaming && !$data.room.opts.exitblock){
				/*if(mobile){
					if(!confirm(L['sureExit'])) return;
				}else{
					return pfConfirm(L['sureExit'], function(){ clearGame(); send('leave'); });
				}*/
				return pfConfirm(L['sureExit'], function(){ clearGame(); send('leave'); });
			}
			if($data.room.gaming && $data.room.opts.exitblock){
				alert(L['exitBlocked']);
				return;
			}
		}else{
			if($data.room.gaming){
				/*if(mobile){
					if(!confirm(L['sureExit'])) return;
				}else{
					return pfConfirm(L['sureExit'], function(){ clearGame(); send('leave'); });
				}*/
				return pfConfirm(L['sureExit'], function(){ clearGame(); send('leave'); });
			}
		}
		send('leave');
	});
	$stage.menu.replay.on('click', function(e){
		if($data._replay){
			replayStop();
		}
		showDialog($stage.dialog.replay);
		initReplayDialog();
		if($stage.dialog.replay.is(':visible')){
			$("#replay-file").trigger('change');
		}
	});
	$stage.menu.leaderboard.on('click', function(e){
		$data._lbpage = 0;
		if($stage.dialog.leaderboard.is(":visible")){
			$stage.dialog.leaderboard.hide();
		}else $.get("/ranking", function(res){
			drawLeaderboard(res);
			showDialog($stage.dialog.leaderboard);
		});
	});
	$stage.menu.myeongboard.on('click', function(e){
		$data._mbpage = 0;
		if($stage.dialog.myeongboard.is(":visible")){
			$stage.dialog.myeongboard.hide();
		}else $.get("/myeong", function(res){
			drawMyeongboard(res);
			showDialog($stage.dialog.myeongboard);
		});
	});
	$stage.menu.pingboard.on('click', function(e){
		$data._pbpage = 0;
		if($stage.dialog.pingboard.is(":visible")){
			$stage.dialog.pingboard.hide();
		}else $.get("/ping", function(res){
			drawPingboard(res);
			showDialog($stage.dialog.pingboard);
		});
	});
	$stage.dialog.lbPrev.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		var vall = $data._lbpage - 1;
		$.get("/ranking?p=" + ($data._lbpage - 1), function(res){
			drawLeaderboard(res, vall, 2);
		});
	});
	$stage.dialog.lbMe.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/ranking?id=" + $data.id, function(res){
			drawLeaderboard(res, $data.id, 1);
		});
	});
	$stage.dialog.lbNext.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		var vall = $data._lbpage + 1;
		$.get("/ranking?p=" + ($data._lbpage + 1), function(res){
			drawLeaderboard(res, vall, 2);
		});
	});
	$stage.dialog.mbMe.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/myeong?id=" + $data.id, function(res){
			drawMyeongboard(res, $data.id, 1);
		});
	});
	$stage.dialog.mbNext.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/myeong?p=" + ($data._mbpage + 1), function(res){
			drawMyeongboard(res, $data._mbpage + 1, 2);
		});
	});
	$stage.dialog.mbPrev.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/myeong?p=" + ($data._mbpage - 1), function(res){
			drawMyeongboard(res, $data._mbpage - 1, 2);
		});
	});
	$stage.dialog.pbPrev.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/ping?p=" + ($data._pbpage - 1), function(res){
			drawPingboard(res, $data._pbpage - 1, 2);
		});
	});
	$stage.dialog.pbNext.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/ping?p=" + ($data._pbpage + 1), function(res){
			drawPingboard(res, $data._pbpage + 1, 2);
		});
	});
	$stage.dialog.pbMe.on('click', function(e){
		$(e.currentTarget).attr('disabled', true);
		$.get("/ping?id=" + $data.id, function(res){
			drawPingboard(res, $data.id, 1);
		});
	});
	$stage.dialog.settingServer.on('click', function(e){
		location.href = "/";
	});
	$stage.dialog.settingOK.on('click', function(e){
		applyOptions({
			mb: $("#mute-bgm").is(":checked"),
			me: $("#mute-effect").is(":checked"),
			di: $("#deny-invite").is(":checked"),
			dw: $("#deny-whisper").is(":checked"),
			df: $("#deny-friend").is(":checked"),
			ar: $("#auto-ready").is(":checked"),
			su: $("#sort-user").is(":checked"),
			ow: $("#only-waiting").is(":checked"),
			ou: $("#only-unlock").is(":checked"),
			ml: $("#manlep-exp").is(":checked"),
			rq: $("#req-exp").is(":checked"),
			ms: $("#mis-sion").is(":checked"),
			bw: $("#yok-seol").is(":checked"),
			jm: $("#jang-moon").is(":checked"),
			mc: $("#deny-mention").is(":checked"),
			dz: $("#dizzy-off").is(":checked"),
			rv: $("#reverse-room").is(":checked"),
			bg: $("#pink-bgm").val(),
			th: $("#pink-theme").val(),
			kw: $("#deny-keyword").is(":checked"),
			wd: $("#ka-word").is(":checked"),
			dt: $("#dt-gs").is(":checked")
		});
		/*$.post("/cookie", { data: JSON.stringify($data.opts) }, function(res){
			if(res.error) console.log(res.error);
		});*/
		sCK('kks', encodeURIComponent(JSON.stringify($data.opts)), 1.5);
		//$.cookie('kks', JSON.stringify($data.opts), { expires: 7, path: '/' });
		$stage.dialog.setting.hide();
	});
	$stage.dialog.profileLevel.on('click', function(e){
		$("#PracticeDiag .dialog-title").html(L['robot']);
		$("#ai-team").prop('disabled', false);
		showDialog($stage.dialog.practice);
	});
	$stage.dialog.pAlertOK.on('click', function(e){
		$stage.dialog.pAlert.hide();
	});
	$stage.dialog.pJejeOK.on('click', function(e){
		$stage.dialog.pJeje.hide();
		$("#Jejed").animate({ 'opacity': 0 }, 1000);
		setTimeout(function(){ $("#Jejed").hide(); }, 1000);
	});
	$stage.dialog.practiceOK.on('click', function(e){
		var level = $("#practice-level").val();
		var team = $("#ai-team").val();
		
		$stage.dialog.practice.hide();
		if($("#PracticeDiag .dialog-title").html() == L['robot']){
			send('setAI', { target: $data._profiled, level: level, team: team });
		}else{
			send('practice', { level: level });
		}
	});
	$stage.dialog.roomOK.on('click', function(e){
		var i, k, opts = {
			injpick: $data._injpick
		};
		for(i in OPTIONS){
			k = OPTIONS[i].name.toLowerCase();
			opts[k] = $("#room-" + k).is(':checked');
		}
		send($data.typeRoom, {
			title: $("#room-title").val().trim() || $("#room-title").attr('placeholder').trim(),
			password: $("#room-pw").val(),
			limit: $("#room-limit").val(),
			mode: $("#room-mode").val(),
			round: $("#room-round").val(),
			time: $("#room-time").val(),
			opts: opts,
		});
		/*$.cookie('room_opts', JSON.stringify({
			title: $("#room-title").val().trim() || $("#room-title").attr('placeholder').trim(),
			limit: $("#room-limit").val(),
			mode: $("#room-mode").val(),
			round: $("#room-round").val(),
			time: $("#room-time").val(),
		}));
		$.cookie('options_r', JSON.stringify(opts));*/
			/*var rmin = {
			title: $("#room-title").val().trim() || $("#room-title").attr('placeholder').trim(),
			password: $("#room-pw").val(),
			limit: $("#room-limit").val(),
			mode: $("#room-mode").val(),
			round: $("#room-round").val(),
			time: $("#room-time").val(),
			opts: opts,
		};
		$.cookie('ropt', JSON.stringify(rmin));*/
		$stage.dialog.room.hide();
	});
	$stage.dialog.resultOK.on('click', function(e){
		if($data._resultPage == 1 && $data._resultRank){
			drawRanking($data._resultRank[$data.id]);
			return;
		}
		if($data.practicing){
			$data.room.gaming = true;
			send('leave');
		}
		$data.resulting = false;
		$stage.dialog.result.hide();
		delete $data._replay;
		delete $data._resultRank;
		$stage.box.room.height(360);
		playBGM($data.opts.bg);
		forkChat();
		updateUI();
	});
	$stage.dialog.resultSave.on('click', function(e){
		var date = new Date($rec.time);
		var blob = new Blob([ JSON.stringify($rec) ], { type: "text/plain" });
		var url = URL.createObjectURL(blob);
		var fileName = "KKuTu" + (
			date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " "
			+ date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds()
		) + ".kkt";
		var $a = $("<a>").attr({
			'download': fileName,
			'href': url
		}).on('click', function(e){
			$a.remove();
		});
		$("#Jungle").append($a);
		$a[0].click();
	});
	$stage.dialog.dictInjeong.on('click', function(e){
		var $target = $(e.currentTarget);
		
		if($target.is(':disabled')) return;
		if(!$("#dict-theme").val()) return;
		$target.prop('disabled', true);
		$("#dict-output").html(L['searching']);
		$.get("/injeong/" + $("#dict-input").val() + "?theme=" + $("#dict-theme").val(), function(res){
			addTimeout(function(){
				$target.prop('disabled', false);
			}, 2000);
			if(res.error) return $("#dict-output").html(res.error + ": " + L['wpFail_' + res.error]);
			
			$("#dict-output").html(L['wpSuccess'] + "(" + res.message + ")");
		});
	});
	$stage.dialog.dictSearch.on('click', function(e){
		var $target = $(e.currentTarget);
		
		if($target.is(':disabled')) return;
		$target.prop('disabled', true);
		$("#dict-output").html(L['searching']);
		tryDict($("#dict-input").val(), function(res){
			addTimeout(function(){
				$target.prop('disabled', false);
			}, 500);
			if(res.error) return $("#dict-output").html(res.error + ": " + L['wpFail_' + res.error]);
			
			$("#dict-output").html(processWord(res.word, res.mean, res.theme, res.type.split(',')));
		}, 1);
	}).hotkey($("#dict-input"), 13);
	$stage.dialog.wordPlusOK.on('click', function(e){
		var t;
		if($stage.dialog.wordPlusOK.hasClass("searching")) return;
		if(!(t = $("#wp-input").val())) return;
		t = t.replace(/[^a-z가-힣]/g, "");
		if(t.length < 2) return;
		
		$("#wp-input").val("");
		$(e.currentTarget).addClass("searching").html("<i class='fa fa-spin fa-spinner'></i>");
		send('wp', { value: t });
	}).hotkey($("#wp-input"), 13);
	$("#EXPEvtBtn").on('click', function(e){
		$.get("/evtstat", function(res){
			if(res.error) return fail(res.error);
			var gss = !!res.evtKey ? res.evtKey / 5050 * 100 : 0;
			if(gss > 100) gss = 100;
			gss = gss.toFixed(2);
			if(!res.evtKey){
				var su = 5050;
			}else if(res.evtKey >= 5050){
				rst = '<br><font color="blue">완료!</font>';
				var su = 5050;
			}else{
				rst = '';
				var su = res.evtKey;
			}
			pfAlert('<b>어린이날 코인 모으기!!</b>\n\n<b>2단계\n</b>' + commify(su) + ' / 5,050 [' + gss + '%]' + rst);
		});
	});
	$stage.dialog.inviteRobot.on('click', function(e){
		requestInvite("AI");
	});
	$stage.box.me.on('click', function(e){
		requestProfile($data.id);
	});
	$stage.dialog.roomInfoJoin.on('click', function(e){
		$stage.dialog.roomInfo.hide();
		tryJoin($data._roominfo);
	});
	$stage.dialog.profileHandover.on('click', function(e){
		//if(!confirm(L['sureHandover'])) return;
		pfConfirm(L['sureHandover'], function(){ send('handover', { target: $data._profiled }); });
	});
	$stage.dialog.profileKick.on('click', function(e){
		if($data.robots.hasOwnProperty($data._profiled)) return send('kick', { robot: $data.robots.hasOwnProperty($data._profiled), target: $data._profiled });
		//if(!confirm(L['sureKick'])) return;
		pfConfirm(L['sureKick'], function(){ send('kick', { robot: $data.robots.hasOwnProperty($data._profiled), target: $data._profiled }); });
	});
	$stage.dialog.profileShut.on('click', function(e){
		var o = $data.users[$data._profiled];
		
		if(!o) return;
		toggleShutBlock(o.nickname);
	});
	$stage.dialog.profileWhisper.on('click', function(e){
		var o = $data.users[$data._profiled];
		
		$stage.talk.val("/e " + (o.nickname).replace(/\s/g, "") + " ").focus();
	});
	//EXP
	$('#manlep-exp').change(function(){
		if(this.checked){
			if($('#req-exp').is(':checked')){
				$('#req-exp').attr('checked', false);
			}
		}
	});
	$('#req-exp').change(function(){
		if(this.checked){
			if($('#manlep-exp').is(':checked')){
				$('#manlep-exp').attr('checked', false);
			}
		}
	});
	//SU
	$('#sort-nick').change(function(){
		if(this.checked){
			if($('#sort-user').is(':checked')){
				$('#sort-user').attr('checked', false);
			}
		}else{
			$('#sort-user').prop('checked', true);
		}
	});
	$('#sort-user').change(function(){
		if(this.checked){
			if($('#sort-nick').is(':checked')){
				$('#sort-nick').attr('checked', false);
			}
		}else{
			$("#sort-nick").prop('checked', true);
		}
	});
	//KA
	$('#ka-word').change(function(){
		if(this.checked){
			if($('#ka-icld').is(':checked')){
				$('#ka-icld').attr('checked', false);
			}
		}else{
			$('#ka-word').prop('checked', true);
		}
	});
	$('#ka-icld').change(function(){
		if(this.checked){
			if($('#ka-word').is(':checked')){
				$('#ka-word').attr('checked', false);
			}
		}else{
			$("#ka-icld").prop('checked', true);
		}
	});
	//DT
	$('#dt-gs').change(function(){
		if(this.checked){
			if($('#dt-wb').is(':checked')){
				$('#dt-wb').attr('checked', false);
			}
		}else{
			$('#dt-gs').prop('checked', true);
		}
	});
	$('#dt-wb').change(function(){
		if(this.checked){
			if($('#dt-gs').is(':checked')){
				$('#dt-gs').attr('checked', false);
			}
		}else{
			$('#dt-wb').prop('checked', true);
		}
	});
	
	$stage.dialog.profileReport.on('click', function(e){
		if(!$data.guest){
			var o = $data.users[$data._profiled];
			$('#report-badwords').attr('checked', false);
			$('#report-else').attr('checked', false);
			$('#report-hacking').attr('checked', false);
			$('#report-saching').attr('checked', false);
			$('#report-badplay').attr('checked', false);
			$('#RWrite').val('');
			$('#ReportUser').val('');
			$('#RWrite').attr("readonly", true);
			$('#ReportUser').hide();
			showDialog($stage.dialog.report);
			$('#ReportUser').hide();
			$('#ReportUser').val('ID: ' + o.id + '  NICK: ' + o.nickname);
		}else{
			return fail(642);
		}
	});
	$('#report-badwords').change(function(){
		if(this.checked){
			if($('#report-else').is(':checked')){
				$('#report-else').attr('checked', false);
			}
			if($('#report-saching').is(':checked')){
				$('#report-saching').attr('checked', false);
			}
			if($('#report-hacking').is(':checked')){
				$('#report-hacking').attr('checked', false);
			}
			if($('#report-badplay').is(':checked')){
				$('#report-badplay').attr('checked', false);
			}
			$('#RWrite').attr("readonly", false);
		}
	});
	$('#report-hacking').change(function(){
		if(this.checked){
			if($('#report-else').is(':checked')){
				$('#report-else').attr('checked', false);
			}
			if($('#report-saching').is(':checked')){
				$('#report-saching').attr('checked', false);
			}
			if($('#report-badwords').is(':checked')){
				$('#report-badwords').attr('checked', false);
			}
			if($('#report-badplay').is(':checked')){
				$('#report-badplay').attr('checked', false);
			}
			$('#RWrite').attr("readonly", false);
		}
	});
	$('#report-saching').change(function(){
		if(this.checked){
			if($('#report-else').is(':checked')){
				$('#report-else').attr('checked', false);
			}
			if($('#report-badwords').is(':checked')){
				$('#report-badwords').attr('checked', false);
			}
			if($('#report-hacking').is(':checked')){
				$('#report-hacking').attr('checked', false);
			}
			if($('#report-badplay').is(':checked')){
				$('#report-badplay').attr('checked', false);
			}
			$('#RWrite').attr("readonly", false);
		}
	});
	$('#report-else').change(function(){
		if(this.checked){
			if($('#report-badwords').is(':checked')){
				$('#report-badwords').attr('checked', false);
			}
			if($('#report-saching').is(':checked')){
				$('#report-saching').attr('checked', false);
			}
			if($('#report-hacking').is(':checked')){
				$('#report-hacking').attr('checked', false);
			}
			if($('#report-badplay').is(':checked')){
				$('#report-badplay').attr('checked', false);
			}
		}
		$('#RWrite').attr("readonly", false);
	});
	$('#report-badplay').change(function(){
		if(this.checked){
			if($('#report-badwords').is(':checked')){
				$('#report-badwords').attr('checked', false);
			}
			if($('#report-saching').is(':checked')){
				$('#report-saching').attr('checked', false);
			}
			if($('#report-hacking').is(':checked')){
				$('#report-hacking').attr('checked', false);
			}
			if($('#report-else').is(':checked')){
				$('#report-else').attr('checked', false);
			}
		}
		$('#RWrite').attr("readonly", false);
	});
				
	/*$stage.dialog.profileTrade.on('click', function(e){
		var o = $data.users[$data._profiled];
		if(confirm(L['sureTrade'])) trade(o);
	});*/
	$stage.dialog.profileDress.on('click', function(e){
		// alert(L['error_555']);
		if($data.guest) return fail(421);
		if($data._gaming) return fail(438);
		if(showDialog($stage.dialog.dress)) $.get("/box", function(res){
			if(res.error) return fail(res.error);
			
			$data.box = res;
			drawMyDress();
		});
	});
	var jsk = function(){
		$.post("/reset", function(res){
			if(res.error) return fail(res.error);
			else{
				noPF = true;
				ws.close();
				pfAlert('계정이 초기화되었습니다.');
				location.reload();
			}
		});
	}
	var fico = function(){
		var kssv = $("#pinput-in").val();
		if(kssv != '초기화') return pfAlert('계정 초기화가 취소되었습니다.');
		pfConfirm('초기화 후 즉시 <b>서버와의 접속이 종료</b>되며,<br>오늘의 접속 보상은 <b>다시 받을 수 없습니다</b>.<br>또한, 현재 계정의 정보는 <b>복구할 수 없습니다</b>.<br><br><b>정말로 초기화하시겠습니까?</b>', jsk, function(){ pfAlert('계정 초기화가 취소되었습니다.'); });
	}
	var ksk = function(){
		pfInput('계정을 초기화하시려면 아래에<br><b>초기화</b> 라고 입력해주세요.', fico, function(){ pfAlert('계정 초기화가 취소되었습니다.'); });
	}
	$stage.dialog.acReset.on('click', function(e){
		pfConfirm('정말로 계정을 초기화하시겠습니까?', ksk, function(){ pfAlert('계정 초기화가 취소되었습니다.'); });
	});
	$stage.dialog.dressOK.on('click', function(e){
		var myn = $data.users[$data.id].nickname || "";
		var tnick = $("#dress-nickname").val();
		var jnick = $("#dress-nickname").val();
		jnick = jnick.trim();
		var trxp = /[^a-zA-Z가-힣0-9\s\-\_]/g
		var badn = trxp.test(tnick);
		if(badn) return pfAlert(L['profileWrong']);
		var j = $data.users[$data.id];
		if(tnick.substr(0, 1) == " ") return pfAlert(L['profileWrong']);
		var prq = tnick.replace(/\s/g, "");
		if(prq == "" || tnick.length > 12) return pfAlert(L['profileWrong']);
		$(e.currentTarget).attr('disabled', true);
		$.post("/exordial", { data: $("#dress-exordial").val() }, function(res){
			$stage.dialog.dressOK.attr('disabled', false);
			if(res.error) return fail(res.error);
			
			$stage.dialog.dress.hide();
			send('exordialc');
			$data.users[$data.id].exordial = $("#dress-exordial").val();
		});//수정닉*원래닉 수 = arr[0] 원 = arr[1] 점 = arr[2]
		//var postnick = $("#dress-nickname").val() + "*" + j.nickname + "*" + j.data.score;
		if(!!$data.place){
			pfAlert('방 안에서는 닉네임을 수정할 수 없습니다.<br>소개 한마디만 수정됩니다.');
		}else if(myn != jnick){
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
		}else pfAlert(L['profileChanged']);
		requestProfile($data.id);
	});
	$("#DressDiag .dress-type").on('click', function(e){
		var $target = $(e.currentTarget);
		var type = $target.attr('id').slice(11);
		
		$(".dress-type.selected").removeClass("selected");
		$target.addClass("selected");
		
		drawMyGoods(type == 'all' || $target.attr('value'));
	});
	$("#dress-cf").on('click', function(e){
		if($data._gaming) return fail(438);
		if(showDialog($stage.dialog.charFactory)) drawCharFactory();
	});
	$stage.dialog.cfCompose.on('click', function(e){
		if(!$stage.dialog.cfCompose.hasClass("cf-composable")) return fail(436);
		//if(!confirm(L['cfSureCompose'])) return;
		pfConfirm(L['cfSureCompose'], function(){
			$.post("/cf", { tray: $data._tray.join('|') }, function(res){
				var i;
				
				if(res.error) return fail(res.error);
				send('refresh');
				pfAlert(L['cfComposed']);
				$data.users[$data.id].money = res.money;
				$data.box = res.box;
				for(i in res.gain) queueObtain(res.gain[i]);
				
				drawMyDress($data._avGroup);
				updateMe();
				drawCharFactory();
			});
		}, function(){});
	});

	
	$("#room-injeong-pick").on('click', function(e){
		var rule = RULE[MODE[$("#room-mode").val()]];
		var i;
		
		$("#injpick-list>div").hide();
		if(rule.lang == "ko"){
			$data._ijkey = "#ko-pick-";
			$("#ko-pick-list").show();
		}else if(rule.lang == "en"){
			$data._ijkey = "#en-pick-";
			$("#en-pick-list").show();
		}
		$stage.dialog.injPickNo.trigger('click');
		for(i in $data._injpick){
			$($data._ijkey + $data._injpick[i]).prop('checked', true);
		}
		showDialog($stage.dialog.injPick);
	});
	$stage.dialog.injPickAll.on('click', function(e){
		$("#injpick-list input").prop('checked', true);
	});
	$stage.dialog.injPickNo.on('click', function(e){
		$("#injpick-list input").prop('checked', false);
	});
	$stage.dialog.injPickOK.on('click', function(e){
		var $target = $($data._ijkey + "list");
		var list = [];
		
		$data._injpick = $target.find("input").each(function(i, o){
			var $o = $(o);
			var id = $o.attr('id').slice(8);
			
			if($o.is(':checked')) list.push(id);
		});
		$data._injpick = list;
		$stage.dialog.injPick.hide();
	});
	$stage.dialog.kickVoteY.on('click', function(e){
		send('kickVote', { agree: true });
		clearTimeout($data._kickTimer);
		$stage.dialog.kickVote.hide();
	});
	$stage.dialog.kickVoteN.on('click', function(e){
		send('kickVote', { agree: false });
		clearTimeout($data._kickTimer);
		$stage.dialog.kickVote.hide();
	});
	$stage.dialog.purchaseOK.on('click', function(e){
		$.post("/buy/" + $data._sgood, function(res){
			var my = $data.users[$data.id];
			
			if(res.error) return fail(res.error);
			pfAlert(L['purchased'].replace(/\n/g, '<br>'));
			my.money = res.money;
			my.box = res.box;
			updateMe();
		});
		$stage.dialog.purchase.hide();
	});
	$stage.dialog.evtOK.on('click', function(e){
		$.post("/evt/" + $data._sgood, function(res){
			var my = $data.users[$data.id];
			
			if(res.error) return fail(res.error);
			pfAlert(L['purchased'].replace(/\n/g, '<br>'));
			my.money = res.money;
			my.box = res.box;
			updateMe();
		});
		$stage.dialog.purchase.hide();
	});
	$stage.dialog.purchaseNO.on('click', function(e){
		$stage.dialog.purchase.hide();
	});
	$stage.dialog.obtainOK.on('click', function(e){
		var obj = $data._obtain.shift();
		
		if(obj) drawObtain(obj);
		else $stage.dialog.obtain.hide();
	});
	for(i=0; i<5; i++) $("#team-" + i).on('click', onTeam);
	function onTeam(e){
		if($(".team-selector").hasClass("team-unable")) return;
		
		send('team', { value: $(e.currentTarget).attr('id').slice(5) });
	}
// 리플레이
	function initReplayDialog(){
		$stage.dialog.replayView.attr('disabled', true);
	}
	$("#replay-file").on('change', function(e){
		var file = e.target.files[0];
		var reader = new FileReader();
		var $date = $("#replay-date").html("-");
		var $version = $("#replay-version").html("-");
		var $players = $("#replay-players").html("-");
	
		$rec = false;
		$stage.dialog.replayView.attr('disabled', true);
		if(!file) return;
		reader.readAsText(file);
		reader.onload = function(e){
			var i, data;
			
			try{
				data = JSON.parse(e.target.result);
				$date.html((new Date(data.time)).toLocaleString());
				$version.html(data.version);
				$players.empty();
				for(i in data.players){
					var u = data.players[i];
					var $p;
					
					$players.append($p = $("<div>").addClass("replay-player-bar ellipse")
						.html(u.title)
						.prepend(getLevelImage(u.data.score, u.equip).addClass("users-level"))
					);
					if(u.id == data.me) $p.css('font-weight', "bold");
				}
				$rec = data;
				$stage.dialog.replayView.attr('disabled', false);
			}catch(ex){
				console.warn(ex);
				return pfAlert(L['replayError']);
			}
		};
	});
	$stage.dialog.replayView.on('click', function(e){
		replayReady();
	});
	
// 스팸
	addInterval(function(){
		if(spamCount > 0 && !$data.place) spamCount = 0;
		else if(spamCount > 0 && $data.place){
			if(spamCount > 12) spamCount = 12;
			else if(spamCount < 5) spamCount = 0;
			else spamCount -= 5;
		}else if(spamWarning > 0) spamWarning -= 0.03;
	}, 1000);

// 웹소켓 연결
	function connect(){
		ws = new _WebSocket($data.URL);
		ws.onopen = function(e){
			loading();
			/*if($data.PUBLIC && mobile) $("#ad").append($("<ins>").addClass("daum_ddn_area")
				.css({ 'display': "none", 'margin-top': "10px", 'width': "100%" })
				.attr({
					'data-ad-unit': "DAN-1ib8r0w35a0qb",
					'data-ad-media': "4I8",
					'data-ad-pubuser': "3iI",
					'data-ad-type': "A",
					'data-ad-width': "320",
					'data-ad-height': "100"
				})
			).append($("<script>")
				.attr({
					'type': "text/javascript",
					'src': "//t1.daumcdn.net/adfit/static/ad.min.js"
				})
			);*/
		};
		ws.onmessage = _onMessage = function(e){
			onMessage(JSON.parse(e.data));
		};
		ws.onclose = function(e){
			var ct = L['closed'] + " (#" + e.code + ")";
			
			if(rws) rws.close();
			stopAllSounds();
			if(!noPF) pfAlert(ct);
			$.get("/kkutu_notice.html", function(res){
				loading(res);
			});
		};
		ws.onerror = function(e){
			console.warn(L['error'], e);
		};
	}
});

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

$lib.Classic.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html(getCharText(data.char, data.subChar));
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	if(MODE[$data.room.mode] == "KAP" || MODE[$data.room.mode] == "EAP"){
		$(".jjoDisplayBar .graph-bar").css({ 'float': "right", 'text-align': "left" });
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.Classic.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	if(!($data._tid = $data.room.game.seq[data.turn])) return;
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char = getCharText(data.char, data.subChar, data.wordLength));
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.Classic.turnGoing = function(){
	if(!$data.room) clearInterval($data._tTime);
	$data._turnTime -= TICK;
	if(!$data.room.opts.inftime) $data._roundTime -= TICK;
	
	if(!$data.room.opts.inftime){
		$stage.game.turnBar
			.width($data._timePercent())
			.html(($data._turnTime*0.001).toFixed(1) + L['SECOND']);
		$stage.game.roundBar
			.width($data._roundTime/$data.room.time*0.1 + "%")
			.html(($data._roundTime*0.001).toFixed(1) + L['SECOND']);
	}else{
		$stage.game.turnBar
			.width($data._timePercent())
			.html(($data._turnTime*0.001).toFixed(1) + L['SECOND']);
		$stage.game.roundBar
			.width("100%")
			.html('');
	}
	
	if(!$stage.game.roundBar.hasClass("round-extreme")) if($data._roundTime <= 5000) $stage.game.roundBar.addClass("round-extreme");
};
$lib.Classic.turnEnd = function(id, data){
	if(mobile) $('.deltaScore').hide();
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	var $uc = $(".game-user-current");
	var hi;
	
	if($data._turnSound) $data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		checkFailCombo();
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		checkFailCombo(id);
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		if(MODE[$data.room.mode] == "KAP" || MODE[$data.room.mode] == "EAP") $stage.game.display.empty()
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(0, hi)))
			.append($("<label>").html(data.hint.slice(hi)));
		else $stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};

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

$lib.Jaqwi.roundReady = function(data){
	var tv = L['jqTheme'] + ": " + L['theme_' + data.theme];
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 10000;
	$stage.game.display.html(tv);
	$stage.game.items.hide();
	$stage.game.hints.show();
	$(".jjo-turn-time .graph-bar")
		.width("100%")
		.html(tv)
		.css('text-align', "center");
	drawRound(data.round);
	playSound('round_start');
	clearInterval($data._tTime);
};
$lib.Jaqwi.turnStart = function(data){
	$(".game-user-current").removeClass("game-user-current");
	$(".game-user-bomb").removeClass("game-user-bomb");
	if($data.room.game.seq.indexOf($data.id) >= 0) $stage.game.here.show();
	$stage.game.display.html($data._char = data.char);
	clearInterval($data._tTime);
	$data._tTime = addInterval(turnGoing, TICK);
	playBGM('jaqwi');
};
$lib.Jaqwi.turnGoing = function(){
	var $rtb = $stage.game.roundBar;
	var bRate;
	var tt;
	
	if(!$data.room) clearInterval($data._tTime);
	$data._roundTime -= TICK;
	
	tt = $data._spectate ? L['stat_spectate'] : ($data._roundTime*0.001).toFixed(1) + L['SECOND'];
	$rtb
		.width($data._roundTime/$data.room.time*0.1 + "%")
		.html(tt);
		
	if(!$rtb.hasClass("round-extreme")) if($data._roundTime <= $data._fastTime){
		bRate = $data.bgm.currentTime / $data.bgm.duration;
		if($data.bgm.paused) stopBGM();
		else playBGM('jaqwiF');
		$data.bgm.currentTime = $data.bgm.duration * bRate;
		$rtb.addClass("round-extreme");
	}
};
$lib.Jaqwi.turnHint = function(data){
	playSound('mission');
	pushHint(data.hint);
};
$lib.Jaqwi.turnEnd = function(id, data){
	var $sc = $("<div>").addClass("deltaScore").html("+" + data.score);
	var $uc = $("#game-user-" + id);

	if(data.giveup){
		$uc.addClass("game-user-bomb");
	}else if(data.answer){
		$stage.game.here.hide();
		$stage.game.display.html($("<label>").css('color', "#FFFF44").html(data.answer));
		stopBGM();
		playSound('horr');
	}else{
		// if(data.mean) turnHint(data);
		if(id == $data.id) $stage.game.here.hide();
		addScore(id, data.score);
		if($data._roundTime > 10000) $data._roundTime = 10000;
		drawObtainedScore($uc, $sc);
		updateScore(id, getScore(id)).addClass("game-user-current");
		playSound('success');
	}
};

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

$lib.Crossword.roundReady = function(data, spec){
	var turn = data.seq ? data.seq.indexOf($data.id) : -1;
	
	clearBoard();
	$(".jjoriping,.rounds,.game-body").addClass("cw");
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 30000;
	$data.selectedRound = (turn == -1) ? 1 : (turn % $data.room.round + 1);
	$stage.game.items.hide();
	$stage.game.cwcmd.show().css('opacity', 0);
	drawRound($data.selectedRound);
	if(!spec) playSound('round_start');
	clearInterval($data._tTime);
};
$lib.Crossword.turnEnd = function(id, data){
	var $sc = $("<div>").addClass("deltaScore").html("+" + data.score);
	var $uc = $("#game-user-" + id);
	var $cr;
	var key;
	
	if(data.score){
		key = data.pos.join(',');
		if(id == $data.id){
			$stage.game.cwcmd.css('opacity', 0);
			playSound('success');
		}else{
			if($data._sel) if(data.pos.join(',') == $data._sel.join(',')) $stage.game.cwcmd.css('opacity', 0);
			playSound('mission');
		}
		$data._bdb[key][4] = data.value;
		$data._bdb[key][5] = id;
		if(data.pos[0] == $data.selectedRound - 1) $lib.Crossword.drawDisplay();
		else{
			$cr = $($stage.game.round.children("label").get(data.pos[0])).addClass("round-effect");
			addTimeout(function(){ $cr.removeClass("round-effect"); }, 800);
		}
		addScore(id, data.score);
		updateScore(id, getScore(id));
		drawObtainedScore($uc, $sc);
	}else{
		stopBGM();
		$stage.game.round.empty();
		playSound('horr');
	}
};
$lib.Crossword.drawDisplay = function(){
	var CELL = 100 / 8;
	var board = $data._boards[$data.selectedRound - 1];
	var $pane = $stage.game.display.empty();
	var $bar;
	var i, j, x, y, vert, len, word, key;
	var $w = {};
	
	for(i in board){
		x = Number(board[i][0]);
		y = Number(board[i][1]);
		vert = board[i][2] == "1";
		len = Number(board[i][3]);
		word = board[i][4];
		$pane.append($bar = $("<div>").addClass("cw-bar")
			.attr('id', "cw-" + x + "-" + y + "-" + board[i][2])
			.css({
				top: y * CELL + "%", left: x * CELL + "%",
				width: (vert ? 1 : len) * CELL + "%",
				height: (vert ? len : 1) * CELL + "%"
			})
		);
		if(word) $bar.addClass("cw-open");
		if(board[i][5] == $data.id) $bar.addClass("cw-my-open");
		else $bar.on('click', $lib.Crossword.onBar).on('mouseleave', $lib.Crossword.onSwap);
		for(j=0; j<len; j++){
			key = x + "-" + y;
			
			if(word) $w[key] = word.charAt(j);
			$bar.append($("<div>").addClass("cw-cell")
				.attr('id', "cwc-" + key)
				.html($w[key] || "")
			);
			if(vert) y++; else x++;
		}
	}
};
$lib.Crossword.onSwap = function(e){
	$stage.game.display.prepend($(e.currentTarget));
};
$lib.Crossword.onRound = function(e){
	var round = $(e.currentTarget).html().charCodeAt(0) - 9311;
	
	drawRound($data.selectedRound = round);
	$(".rounds label").on('click', $lib.Crossword.onRound);
	$lib.Crossword.drawDisplay();
};
$lib.Crossword.onBar = function(e){
	var $bar = $(e.currentTarget);
	var pos = $bar.attr('id').slice(3).split('-');
	var data = $data._means[$data.selectedRound - 1][pos.join(',')];
	var vert = data.dir == "1";
	
	$stage.game.cwcmd.css('opacity', 1);
	$data._sel = [ $data.selectedRound - 1, pos[0], pos[1], pos[2] ];
	$(".cw-q-head").html(L[vert ? 'cwVert' : 'cwHorz'] + data.len + L['cwL']);
	$("#cw-q-input").val("").focus();
	$(".cw-q-body").html(processWord("★", data.mean, data.theme, data.type.split(',')));
};
$lib.Crossword.turnStart = function(data, spec){
	var i, j;
	
	$data._bdb = {};
	$data._boards = data.boards;
	$data._means = data.means;
	for(i in data.boards){
		for(j in data.boards[i]){
			$data._bdb[[ i, data.boards[i][j][0], data.boards[i][j][1], data.boards[i][j][2] ].join(',')] = data.boards[i][j];
		}
	}
	$(".rounds label").on('click', $lib.Crossword.onRound);
	$lib.Crossword.drawDisplay();
	clearInterval($data._tTime);
	$data._tTime = addInterval(turnGoing, TICK);
	playBGM('jaqwi');
};
$lib.Crossword.turnGoing = $lib.Jaqwi.turnGoing;
$lib.Crossword.turnHint = function(data){
	playSound('fail');
};

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

﻿$lib.Typing.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	$data._chatter = mobile ? $stage.game.hereText : $stage.talk;
	clearBoard();
	$data._round = data.round;
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 10000;
	$data._list = data.list.concat(data.list);
	$data.chain = 0;
	drawList();
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
function onSpace(e){
	if(e.keyCode == 32){
		$stage.chatBtn.trigger('click');
		e.preventDefault();
	}
}
function drawList(){
	var wl = $data._list.slice($data.chain);
	var lv = $data.room.opts.proverb ? 1 : 5;
	var pts = "";
	var w0l = wl[0].length;
	
	if(w0l >= 20) pts = "18px";
	if(w0l >= 50) pts = "15px";
	$stage.game.display.css('font-size', pts);
	wl[0] = "<label style='color: #FFFF44;'>" + wl[0] + "</label>";
	$stage.game.display.html(wl.slice(0, lv).join(' '));
	$stage.game.chain.show().html($data.chain);
	$(".jjo-turn-time .graph-bar")
		.width("100%")
		.html(wl.slice(lv, 2 * lv).join(' '))
		.css({ 'text-align': "center", 'background-color': "#70712D" });
}
$lib.Typing.spaceOn = function(){
	if($data.room.opts.proverb) return;
	$data._spaced = true;
	$("body").on('keydown', "#" + $data._chatter.attr('id'), onSpace);
};
$lib.Typing.spaceOff = function(){
	delete $data._spaced;
	$("body").off('keydown', "#" + $data._chatter.attr('id'), onSpace);
};
$lib.Typing.turnStart = function(data){
	if(!$data._spectate){
		$stage.game.here.show();
		if(mobile) $stage.game.hereText.val("").focus();
		else $stage.talk.val("").focus();
		$lib.Typing.spaceOn();
	}
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._tTime = addInterval(turnGoing, TICK);
	$data._roundTime = data.roundTime;
	playBGM('jaqwi');
	recordEvent('turnStart', {
		data: data
	});
};
$lib.Typing.turnGoing = $lib.Jaqwi.turnGoing;
$lib.Typing.turnEnd = function(id, data){
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html("+" + data.score);
	var $uc = $("#game-user-" + id);
	
	if(data.error){
		$data.chain++;
		drawList();
		playSound('fail');
	}else if(data.ok){
		if($data.id == id){
			$data.chain++;
			drawList();
			playSound('mission');
			pushHistory(data.value, "");
		}else if($data._spectate){
			playSound('mission');
		}
		addScore(id, data.score);
		drawObtainedScore($uc, $sc);
		updateScore(id, getScore(id));
	}else{
		clearInterval($data._tTime);
		$lib.Typing.spaceOff();
		$stage.game.here.hide();
		stopBGM();
		playSound('horr');
		addTimeout(drawSpeed, 1000, data.speed);
		if($data._round < $data.room.round) restGoing(10);
	}
};
function restGoing(rest){
	$(".jjo-turn-time .graph-bar")
		.html(rest + L['afterRun']);
	if(rest > 0) addTimeout(restGoing, 1000, rest - 1);
}
function drawSpeed(table){
	var i;
	
	for(i in table){
		$("#game-user-" + i + " .game-user-score").empty()
			.append($("<div>").css({ 'float': "none", 'color': "#4444FF", 'text-align': "center" }).html(table[i] + "<label style='font-size: 11px;'>" + L['kpm'] + "</label>"));
	}
}

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

$lib.Hunmin.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html($data._char = "&lt;" + data.theme + "&gt;");
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.Hunmin.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	$data._tid = $data.room.game.seq[data.turn];
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char);
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.Hunmin.turnGoing = $lib.Classic.turnGoing;
$lib.Hunmin.turnEnd = function(id, data){
	if(mobile) $('.deltaScore').hide();
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	var $uc = $(".game-user-current");
	var hi;
	
	$data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		$stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};

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

$lib.Daneo.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html($data._char = "&lt;" + (L['theme_' + data.theme]) + "&gt;");
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.Daneo.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	$data._tid = $data.room.game.seq[data.turn];
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char);
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.Daneo.turnGoing = $lib.Classic.turnGoing;
$lib.Daneo.turnEnd = function(id, data){
	if(mobile) $('.deltaScore').hide();
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	var $uc = $(".game-user-current");
	var hi;
	
	$data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		$stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};

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

$lib.Drawing.roundReady = function (data, spec) {
  var tv = L['jqTheme'] + ': ' + L['theme_' + data.theme]

  clearBoard()
  $('.jjoriping,.rounds,.game-body').addClass('cw')
  $('.jjoriping,.rounds').addClass('dg')
  $('.game-user-drawing').removeClass('game-user-drawing')
  $stage.game.tools.hide()
  $data._relay = false
  $data._roundTime = $data.room.time * 1000
  $data._fastTime = 10000
  $stage.game.items.hide()
  $stage.game.hints.show()
  $stage.game.cwcmd.show().css('opacity', 0)
  if ($data.id === data.painter) {
    console.log('i\'m painter!')
    $data._isPainter = true
  } else {
    $data._isPainter = false
  }
  $('#game-user-' + data.painter).addClass('game-user-drawing')
  drawRound(data.round)
  playSound('round_start')
  clearInterval($data._tTime)
}
$lib.Drawing.turnStart = function (data, spec) {
  $('.game-user-current').removeClass('game-user-current')
  $('.game-user-bomb').removeClass('game-user-bomb')
  if ($data.room.game.seq.indexOf($data.id) >= 0) {
    if (!$data._isPainter) {
      $stage.game.hints.show()
      $stage.game.tools.hide()

      $data._relay = true
    } else {
      $('#drawing-line-width').change(function () {
        console.log(this.value)
        $stage.game.canvas.freeDrawingBrush.width = this.value
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('#drawing-color').change(function () {
        console.log(this.value)
        $stage.game.canvas.freeDrawingBrush.color = this.value
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('#drawing-clear').click(function () {
        console.log('clear')
        $stage.game.canvas.clear()
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('.button-color#color-red').click(function() {
        console.log('change red')
        $stage.game.canvas.freeDrawingBrush.color = '#FF0000'
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('.button-color#color-orange').click(function() {
        console.log('change orange')
        $stage.game.canvas.freeDrawingBrush.color = '#FFA500'
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('.button-color#color-yellow').click(function() {
        console.log('change yellow')
        $stage.game.canvas.freeDrawingBrush.color = '#FFFF00'
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('.button-color#color-green').click(function() {
        console.log('change green')
        $stage.game.canvas.freeDrawingBrush.color = '#008000'
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('.button-color#color-blue').click(function() {
        console.log('change blue')
        $stage.game.canvas.freeDrawingBrush.color = '#0000FF'
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('.button-color#color-indigo').click(function() {
        console.log('change indigo')
        $stage.game.canvas.freeDrawingBrush.color = '#4B0082'
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('.button-color#color-violet').click(function() {
        console.log('change red')
        $stage.game.canvas.freeDrawingBrush.color = '#9400D3'
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('.button-color#color-black').click(function() {
        console.log('change black')
        $stage.game.canvas.freeDrawingBrush.color = '#000000'
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })
      $('.button-color#color-white').click(function() {
        console.log('change white')
        $stage.game.canvas.freeDrawingBrush.color = '#FFFFFF'
        var canvasStr = JSON.stringify($stage.game.canvas)
        send('drawingCanvas', {data: canvasStr}, false)
      })

      $stage.game.drawingTitle.text(data.word)
      $stage.game.themeisTitle.text(L['theme_' + data.theme])

      $stage.game.hints.hide()
      $stage.game.tools.show()

      $('.rounds').removeClass('dg')
      $('.rounds').addClass('painter')
    }
  }
  $lib.Drawing.drawDisplay()
  clearInterval($data._tTime)
  $data._tTime = addInterval(turnGoing, TICK)
  playBGM('jaqwi')
}
$lib.Drawing.turnHint = function (data) {
  var hint
  if (Array.isArray(data.hint)) {
    hint = L['theme_' + data.hint[0]]
  } else {
    hint = data.hint
  }
  playSound('mission')
  pushHint(hint)
}
$lib.Drawing.turnEnd = function (id, data) {
  var $sc = $('<div>').addClass('deltaScore').html('+' + data.score)
  var $uc = $('#game-user-' + id)

  if (data.giveup) {
    $uc.addClass('game-user-bomb')
    $data._relay = false
  } else if (data.answer) {
    $stage.game.here.hide()
    $stage.game.display.html($('<label>').css('color', '#FFFF44').html(data.answer))
    stopBGM()
    playSound('horr')
    $data._relay = false
  } else {
    // if(data.mean) turnHint(data);
    if (id == $data.id) $stage.game.here.hide()
    addScore(id, data.score)
    if ($data._roundTime > 10000) $data._roundTime = 10000
    drawObtainedScore($uc, $sc)
    updateScore(id, getScore(id)).addClass('game-user-current')
    playSound('success')
  }
}
$lib.Drawing.drawDisplay = function () {
  var $pane = $stage.game.display.empty()

  $pane.append($('<canvas>')
    .attr('id', 'canvas')
    .css({
      width: '300',
      height: '300',
      left: 0,
      top: 0
    })
    .addClass('canvas')
  )

  var canvas = window._canvas = new fabric.Canvas('canvas')
  canvas.backgroundColor = '#ffffff'
  canvas.isDrawingMode = $data._isPainter
  canvas.setHeight(300)
  canvas.setWidth(300)
  canvas.selection = false

  $('#drawing-line-width').val(20)
  $('#drawing-color').val('#000000')

  if ($data._isPainter) {
    canvas.on('mouse:up', function (e) {
      var canvasStr = JSON.stringify(canvas)
      send('drawingCanvas', {data: canvasStr}, false)
    })
  }
  canvas.renderAll()
  $stage.game.canvas = canvas
}
$lib.Drawing.turnGoing = function () {
  var $rtb = $stage.game.roundBar
  var bRate
  var tt

  if (!$data.room) clearInterval($data._tTime)
  $data._roundTime -= TICK

  tt = $data._spectate ? L['stat_spectate'] : ($data._roundTime * 0.001).toFixed(1) + L['SECOND']
  $rtb
    .width($data._roundTime / $data.room.time * 0.1 + '%')
    .html(tt)

  if (!$rtb.hasClass('round-extreme')) {
    if ($data._roundTime <= $data._fastTime) {
      bRate = $data.bgm.currentTime / $data.bgm.duration
      if ($data.bgm.paused) stopBGM()
      else playBGM('jaqwiF')
      $data.bgm.currentTime = $data.bgm.duration * bRate
      $rtb.addClass('round-extreme')
    }
  }
}
$lib.Drawing.drawCanvas = function (msg) {
  if (!$data._isPainter) {
    $stage.game.canvas.clear()
    $stage.game.canvas.loadFromJSON(msg.data, $stage.game.canvas.renderAll.bind($stage.game.canvas))
  }
}

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

$lib.allDaneo.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html($data._char = "&lt;단어 전체&gt;");
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.allDaneo.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	$data._tid = $data.room.game.seq[data.turn];
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char);
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.allDaneo.turnGoing = $lib.Classic.turnGoing;
$lib.allDaneo.turnEnd = function(id, data){
	if(mobile) $('.deltaScore').hide();
	if(!$data.room.opts.declag){
		var $sc = $("<div>")
			.addClass("deltaScore")
			.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	}
	var $uc = $(".game-user-current");
	var hi;
	
	$data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		if($data.room.opts.declag){
			var $sc = $("<div>")
				.addClass("deltaScore")
				.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
		}
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		$stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus && !$data.room.opts.declag){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	if(!$data.room.opts.declag || !data.ok) drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};

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

$lib.keAll.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html($data._char = "&lt;단어 전체&gt;");
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.keAll.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	$data._tid = $data.room.game.seq[data.turn];
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char);
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.keAll.turnGoing = $lib.Classic.turnGoing;
$lib.keAll.turnEnd = function(id, data){
	if(mobile) $('.deltaScore').hide();
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	var $uc = $(".game-user-current");
	var hi;
	
	$data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		$stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};

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

$lib.Sock.roundReady = function(data, spec){
	var turn = data.seq ? data.seq.indexOf($data.id) : -1;
	
	clearBoard();
	$data._relay = true;
	$(".jjoriping,.rounds,.game-body").addClass("cw");
	$data._va = [];
	$data._lang = RULE[MODE[$data.room.mode]].lang;
	$data._board = data.board;
	$data._maps = [];
	$data._roundTime = $data.room.time * 1000;
	$data._fastTime = 10000;
	$stage.game.items.hide();
	$stage.game.bb.show();
	$lib.Sock.drawDisplay();
	drawRound(data.round);
	if(!spec) playSound('round_start');
	clearInterval($data._tTime);
};
$lib.Sock.turnEnd = function(id, data){
	var $sc = $("<div>").addClass("deltaScore").html("+" + data.score);
	var $uc = $("#game-user-" + id);
	var key;
	var i, j, l;
	
	if(data.score){
		key = data.value;
		l = key.length;
		$data._maps.push(key);
		for(i=0; i<l; i++){
			$data._board = $data._board.replace(key.charAt(i), "　");
		}
		if(id == $data.id){
			playSound('success');
		}else{
			playSound('mission');
		}
		$lib.Sock.drawDisplay();
		addScore(id, data.score);
		updateScore(id, getScore(id));
		drawObtainedScore($uc, $sc);
	}else{
		stopBGM();
		$data._relay = false;
		playSound('horr');
	}
};
$lib.Sock.drawMaps = function(){
	var i;
	
	$stage.game.bb.empty();
	$data._maps.sort(function(a, b){ return b.length - a.length; }).forEach(function(item){
		$stage.game.bb.append($word(item));
	});
	function $word(text){
		var $R = $("<div>").addClass("bb-word");
		var i, len = text.length;
		var $c;
		
		for(i=0; i<len; i++){
			$R.append($c = $("<div>").addClass("bb-char").html(text.charAt(i)));
			// if(text.charAt(i) != "？") $c.css('color', "#EEEEEE");
		}
		return $R;
	}
};
$lib.Sock.drawDisplay = function(){
	var $a = $("<div>").css('height', "100%"), $c;
	var va = $data._board.split("");
	var size = ($data._lang == "ko") ? "12.5%" : "10%";
	
	va.forEach(function(item, index){
		$a.append($c = $("<div>").addClass("sock-char sock-" + item).css({ width: size, height: size }).html(item));
		if($data._va[index] && $data._va[index] != item){
			$c.html($data._va[index]).addClass("sock-picked").animate({ 'opacity': 0 }, 500);
		}
	});
	$data._va = va;
	$stage.game.display.empty().append($a);
	$lib.Sock.drawMaps();
};
$lib.Sock.turnStart = function(data, spec){
	var i, j;
	
	clearInterval($data._tTime);
	$data._tTime = addInterval(turnGoing, TICK);
	playBGM('jaqwi');
};
$lib.Sock.turnGoing = $lib.Jaqwi.turnGoing;
$lib.Sock.turnHint = function(data){
	playSound('fail');
};

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

$lib.All.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html($data._char = "&lt;자유&gt;");
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.All.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	$data._tid = $data.room.game.seq[data.turn];
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char);
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.All.turnGoing = $lib.Classic.turnGoing;
$lib.All.turnEnd = function(id, data){
	if(mobile) $('.deltaScore').hide();
	if(!$data.room.opts.declag){
		var $sc = $("<div>")
			.addClass("deltaScore")
			.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	}
	var $uc = $(".game-user-current");
	var hi;
	
	$data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		if($data.room.opts.declag){
			var $sc = $("<div>")
				.addClass("deltaScore")
				.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
		}
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		$stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus && !$data.room.opts.declag){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	if(!$data.room.opts.declag || !data.ok) drawObtainedScore($uc, $sc).removeClass("game-user-current");
	try{
		drawObtainedScore($uc, $sc).removeClass("game-user-current");
	}catch(e){
		drawObtainedScore($sc).removeClass("game-user-current");
	}
	updateScore(id, getScore(id));
};

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

$lib.Jycls.roundReady = function(data){
	var i, len = $data.room.game.title.length;
	var $l;
	
	clearBoard();
	$data._roundTime = $data.room.time * 1000;
	$stage.game.display.html(getCharText(data.char, data.subChar));
	$stage.game.chain.show().html($data.chain = 0);
	if($data.room.opts.mission){
		$stage.game.items.show().css('opacity', 1).html($data.mission = data.mission);
	}
	if(MODE[$data.room.mode] == "KAP" || MODE[$data.room.mode] == "EAP"){
		$(".jjoDisplayBar .graph-bar").css({ 'float': "right", 'text-align': "left" });
	}
	drawRound(data.round);
	playSound('round_start');
	recordEvent('roundReady', { data: data });
};
$lib.Jycls.turnStart = function(data){
	$data.room.game.turn = data.turn;
	if(data.seq) $data.room.game.seq = data.seq;
	if(!($data._tid = $data.room.game.seq[data.turn])) return;
	if($data._tid.robot) $data._tid = $data._tid.id;
	data.id = $data._tid;
	
	$stage.game.display.html($data._char = getCharText(data.char, data.subChar, data.wordLength));
	$("#game-user-"+data.id).addClass("game-user-current");
	if(!$data._replay){
		$stage.game.here.css('display', (data.id == $data.id) ? "block" : "none");
		if(data.id == $data.id){
			if(mobile) $stage.game.hereText.val("").focus();
			else $stage.talk.focus();
		}
	}
	$stage.game.items.html($data.mission = data.mission);
	
	ws.onmessage = _onMessage;
	clearInterval($data._tTime);
	clearTrespasses();
	$data._chars = [ data.char, data.subChar ];
	$data._speed = data.speed;
	$data._tTime = addInterval(turnGoing, TICK);
	$data.turnTime = data.turnTime;
	$data._turnTime = data.turnTime;
	$data._roundTime = data.roundTime;
	$data._turnSound = playSound("T"+data.speed);
	recordEvent('turnStart', {
		data: data
	});
};
$lib.Jycls.turnGoing = function(){
	if(!$data.room) clearInterval($data._tTime);
	$data._turnTime -= TICK;
	if(!$data.room.opts.inftime) $data._roundTime -= TICK;
	
	if(!$data.room.opts.inftime){
		$stage.game.turnBar
			.width($data._timePercent())
			.html(($data._turnTime*0.001).toFixed(1) + L['SECOND']);
		$stage.game.roundBar
			.width($data._roundTime/$data.room.time*0.1 + "%")
			.html(($data._roundTime*0.001).toFixed(1) + L['SECOND']);
	}else{
		$stage.game.turnBar
			.width($data._timePercent())
			.html(($data._turnTime*0.001).toFixed(1) + L['SECOND']);
		$stage.game.roundBar
			.width("100%")
			.html('');
	}
	
	if(!$stage.game.roundBar.hasClass("round-extreme")) if($data._roundTime <= 5000) $stage.game.roundBar.addClass("round-extreme");
};
$lib.Jycls.turnEnd = function(id, data){
	if(mobile) $('.deltaScore').hide();
	var $sc = $("<div>")
		.addClass("deltaScore")
		.html((data.score > 0) ? ("+" + (data.score - data.bonus)) : data.score);
	var $uc = $(".game-user-current");
	var hi;
	
	if($data._turnSound) $data._turnSound.stop();
	addScore(id, data.score);
	clearInterval($data._tTime);
	if(data.ok){
		checkFailCombo();
		clearTimeout($data._fail);
		$stage.game.here.hide();
		$stage.game.chain.html(++$data.chain);
		pushDisplay(data.value, data.mean, data.theme, data.wc);
	}else{
		checkFailCombo(id);
		$sc.addClass("lost");
		$(".game-user-current").addClass("game-user-bomb");
		$stage.game.here.hide();
		playSound('timeout');
	}
	if(data.hint){
		data.hint = data.hint._id;
		hi = data.hint.indexOf($data._chars[0]);
		if(hi == -1) hi = data.hint.indexOf($data._chars[1]);
		
		if(MODE[$data.room.mode] == "KAP" || MODE[$data.room.mode] == "EAP") $stage.game.display.empty()
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(0, hi)))
			.append($("<label>").html(data.hint.slice(hi)));
		else $stage.game.display.empty()
			.append($("<label>").html(data.hint.slice(0, hi + 1)))
			.append($("<label>").css('color', "#AAAAAA").html(data.hint.slice(hi + 1)));
	}
	if(data.bonus){
		mobile ? $sc.html("+" + (b.score - b.bonus) + "+" + b.bonus) : addTimeout(function(){
			var $bc = $("<div>")
				.addClass("deltaScore bonus")
				.html("+" + data.bonus);
			
			drawObtainedScore($uc, $bc);
		}, 500);
	}
	drawObtainedScore($uc, $sc).removeClass("game-user-current");
	updateScore(id, getScore(id));
};

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
if(L == undefined) var L = {"GPL":"<div style='color: #666;'>글자로 놀자! 끄투 온라인 Copyright (C) 2020 pink-flower(pinkflower2503@gmail.com)<br>이 프로그램은 제품에 대한 어떠한 형태의 보증도 제공되지 않습니다.<br>이 프로그램은 자유 소프트웨어이며 배포 규정을 만족시키는 조건 아래 자유롭게 재배포할 수 있습니다.<br>이에 대한 자세한 사항은 본 프로그램의 구현을 담은 다음 레포지토리에서 확인하십시오: <a target='_blank' href='https://github.com/pink-flower/KKuTu'>https://github.com/pink-flower/KKuTu</a></div>","CCL":"한국어 단어 정보 제공: <a href='https://stdict.korean.go.kr/' target='_blank'>표준국어대사전 by 국립국어원</a> / <a href='https://creativecommons.org/licenses/by-sa/2.0/kr' target='_blank'>CC BY-SA 2.0 KR</a><br>이 페이지에는 메이플스토리가 제공한 메이플스토리 서체가 적용되어 있습니다.","CREATOR":"개발자 블로그","DISCORD":"분홍꽃 디스코드","HOME":"FA{home}","GAMES":"게임","GAMES_KKUTU":"끄투","GAMES_FATES":"카드 뽑기","GALLERY":"갤러리","LEBS":"LEBS","ETC":"???","ETC_ABOUT":"쪼롤이 뭐지","SETTING":"설정","GLOBAL_NOTICE":"클릭하여 닫기","VERSION":"버전","LEVEL":"레벨","WIN":"승리","LOSE":"패배","P":"전","W":"승","L":"패","WR":"승률","S":"","PTS":"점","MN":"명","GAE":"개","PJ":"평점","PERFECT":"완벽","IB":"인분","RUNE":"룬","MASTERY":"특성","NONE":"(없음)","DELETED":"(없는 항목)","JUST_AGO":"방금 전","MIN_AGO":"{V1}분 전","HOUR_AGO":"{V1}시간 전","DAY_AGO":"{V1}일 전","MONTH_AGO":"{V1}개월 전","YEAR_AGO":"{V1}년 전","YEAR":"년","MONTH":"월","DATE":"일","HOUR":"시","HOURS":"시간","MINUTE":"분","SECOND":"초","AM":"오전","PM":"오후","AD":"광고","LOADING":"불러오는 중","TEAM_100":"파랑 팀","TEAM_200":"빨강 팀","SEARCH":"검색","TOTAL":"총","QUICK_HOLDER":"빠른 소환사 검색","QUICK_BTN":"FA{search}","LOGIN":"로그인","ASK_LOGOUT":"로그아웃 합니까?","AS_PC":"PC 버전","AS_MOBILE":"모바일 버전","AGREEMENT":"서비스 이용 약관","PRIVACY":"개인정보 취급 방침","OK":"확인","NO":"취소","ITEM_FROM":"재료 아이템","PRE_SEASON":"전 시즌","ITEM_TERM":"기간제 항목","ITEM_TERMED":"까지 사용 가능","OPTS_gEXP":"획득 경험치","OPTS_hEXP":"분당 추가 경험치","OPTS_gMNY":"획득 핑","OPTS_hMNY":"분당 추가 핑","GROUP_PIX":"글자 조각","GROUP_CNS":"소모품","GROUP_EVT":"이벤트 재화","GROUP_CHT":"채팅 색","GROUP_NIK":"이름 스킨","GROUP_BDG1":"보물 휘장","GROUP_BDG2":"희귀 휘장","GROUP_BDG3":"고급 휘장","GROUP_BDG4":"일반 휘장","GROUP_Mskin":"모레미 스킨","GROUP_Mhead":"모레미 머리","GROUP_Meye":"모레미 눈","GROUP_Meyeacc":"모레미 눈장식","GROUP_STY":"칭호","GROUP_Mfacc":"모레미 얼굴장식","GROUP_Mmouth":"모레미 입","GROUP_Mhand":"모레미 손","GROUP_Mclothes":"모레미 옷","GROUP_Mshoes":"모레미 발","GROUP_Mback":"모레미 배경","GROUP_Mfront":"모레미 전경","sky_gif":["뭉게뭉게 구름배경","파아란 하늘에 구름이 뭉게뭉게 있는 배경입니다."],"rainbow_chat":["무지개 채팅색","채팅을 <label class='x-rainbow_name'>무지개</label>로 칠합니다."],"b1_uny":["운영자의 휘장","일해라 운영자!"],"cat_mouth":["고양이 입","갈매기같이 생긴 이 입으로 모레미의 귀여움은 더욱 증폭될 겁니다!"],"green_name":["초록빛 이름","이름을 <label class='x-green_name'>산뜻한 초록색</label>으로 칠합니다."],"taengja":["탱자 벽지","상큼한 탱자 향기가 느껴지는 벽지입니다."],"pinkcandy":["딸기 막대 사탕","새콤 달콤 커다란 딸기 맛 막대 사탕입니다."],"ketchup":["케첩","누가 내 머리에 캐첩뿌렸어!"],"redbere":["붉은 베레모","붉은 베레모입니다. 조금 파격적인 디자인을 만들 수 있을 것 같습니다."],"pants_japan":["일본일본 바지","일본 국기를 본따 만들어진 바지입니다."],"blue_name":["푸른 이름","이름을 <label class='x-blue_name'>시원한 푸른색</label>으로 칠합니다."],"blue_vest":["파란 조끼","푸릇푸릇한 사다리꼴 조끼입니다. 모레미는 2D라 사다리꼴을 입을 수 있습니다."],"black_shoes":["검은콩 신발","콩알만큼 작은 검정 신발입니다."],"CDCoin":["어린이날 기념 코인","여러 개를 모아 경험치 / 핑 등으로 교환할 수 있습니다.<del>디자인 잘 못해서 죄송합니다 ㅠㅠ</del> <br><br>즐거운 어린이날 되세요!<br><br><font color=\"orange\">2020.05.05 이후 삭제"],"black_oxford":["검정 옥스포드화","옥스포드 대학생이 신는다고 하는 정갈한 검정 단화입니다. 옥스포드 대학생의 지혜가 느껴집니다."],"purple_ice":["보라 아이스","더위를 날려 줄 시원한 보라색 맛 아이스크림입니다."],"brave_eyes":["용감한 눈매","무언가 알 수 없는 용기가 느껴지는 눈매입니다."],"blackpink":["블랙핑크 배경","단순하지만 느낌있는 배경입니다."],"beardoll":["곰인형 입","귀여운 곰인형을 쏙 빼닮은 입입니다."],"open_close":["감았다 떴다","꿈뻑꿈뻑..."],"pinkpants":["분홍색 옷","모레미에게 잘 어울리는 분홍색 옷 입니다."],"brownbere":["갈색 베레모","중후한 느낌의 갈색 베레모입니다."],"appleremi":["사과레미","맛있는 사과로 변신한 모레미입니다."],"appletop":["저화질 사과꼭지","모레미 머리가 사과가 되었다?!"],"blue_lens":["파란색 렌즈","파란색 렌즈를 낀 모레미입니다."],"rollb":["롤러스케이트","롤러스케이트를 탄 모레미입니다."],"bluepants":["하늘색 옷","모레미에게 잘 어울리는 하늘색 옷 입니다."],"blue_hrt":["하늘색 하트 장식","모레미에게 하트 장식을 달아줍니다."],"frek_l":["주근깨","주근깨가 생긴 모레미입니다."],"b2_metal":["강철같이 굳건한 휘장","어떤 어려움에도 굴하지 않고 꿋꿋이 버티는 모습을 본따 만들어진 보기 드문 휘장입니다."],"b1_lv100":["100레벨의 휘장","이대로 만렙까지 달려가요!"],"oh":["오! 입","무언가에 감탄을 금치 못하는 모레미를 만들어 보세요."],"b1_lv600":["600레벨의 휘장","이제 곧 만렙이에요! 조금만 더 달려봐요!"],"blue_headphone":["파란 헤드폰","프로게이머 모레미의 필수 아이템입니다. 이 헤드폰을 장착하고 뉴비들을 터뜨려 보세요."],"hamster_O":["주황 햄스터 머리","ㅇㅅㅇ뀨?"],"spanner":["스패너","끄투를 열심히 테스트해 주신 특별한 분들을 위한 선물입니다. 앞으로도 많이 이용해 주세요!"],"merong":["메롱 입","혀를 삐쭉 내밀고 있는 모레미를 만들어 보세요."],"purple_name":["보라 이름","이름을 <label class='x-purple_name'>몽롱한 보랏빛</label>으로 칠합니다."],"haksamo":["학사모","끄투로 영어 공부하고 토익 만점을 노리세요!"],"b1_um":["관리자의 휘장","일해라 관리자!"],"indigo_name":["남색 이름","이름을 <label class='x-indigo_name'>냉랭한 남색</label>으로 칠합니다."],"b3_pok":["폭풍의 ㅍ 휘장","매서운 눈빛으로 폭풍같이 질주하는 모습을 본따 만들어진 멋진 휘장입니다."],"stars":["밤하늘의 별","밤하늘을 수놓는 별들이 당신에게 응원의 빛을 전하고 있습니다."],"pants_china":["중국중국 바지","중국 국기를 본따 만들어진 바지입니다."],"cwd":["청와대","이렇게 된 이상……!"],"$WPB":["고급 글자 조각","당신의 끄투 플레이에 이끌려 다가온 신비한 글자 조각입니다. 글자 조합소에서 이 조각의 기운을 이용해 보세요."],"cuspidal":["송곳니 장식","송곳니 모양의 눈 장식으로 카리스마 있는 눈초리를 만들어 보세요."],"sunglasses":["선글라스","따가운 햇빛을 피할 수 있는 고급 선글라스입니다."],"b1_ds":["디자인부의 휘장","일해라 디자인부!"],"31jeol":["3.1절 태극기","대한독립 만세!"],"dizzy_rainbow":["어질어질 무지개","어지러운 무지개 배경입니다."],"glasses_acc":["안경","모레미에게 잘 어울리는 안경입니다.<br><del>운영자가 만든 건 안비밀!</del>"],"pink_name":["분홍 이름","이름을 <label class='x-pink_name'>예쁜 분홍색</label>으로 칠합니다."],"boxB3":["고급 휘장 상자","고급 휘장 3종 중 하나가 담긴 상자입니다. 안에는 무엇이 들어 있을까요?"],"black_mask":["검은 복면","거멓고 음침한 분위기의 복면입니다. 이 복면을 장착하면 누구도 당신을 막을 순 없을 겁니다."],"close_eye":["감은 눈","눈이 편안해 집니다."],"lazy_eye":["게으른 눈","만사가 귀찮은 모레미가 됩니다."],"bigeye":["서클렌즈","모레미의 눈 반지름을 약 3픽셀 올려주는 서클렌즈입니다."],"tile":["타일","네모 타일로 이루어진 벽입니다."],"melon_ice":["멜론 아이스","더위를 날려 줄 상큼한 멜론 맛 아이스크림입니다."],"red_name":["붉은 이름","이름을 <label class='x-red_name'>정열의 붉은색</label>으로 칠합니다."],"transparent":["투명 배경","초보자들의 필수품! 투명 배경입니다."],"t_pink":["분홍색 휘장","모레미를 꾸며 주는 <font color=\"pink\">분홍색</font> 휘장입니다."],"t_orange":["주황색 휘장","모레미를 꾸며 주는 <font color=\"orange\">주황색</font> 휘장입니다."],"exp_cr":["최고급 경험치 물약","사용하면 경험치 14000을 얻을 수 있습니다."],"pants_pkt":["분홍끄투 바지","언제나 즐거운 분홍끄투!"],"sglass_acc":["선글라스","따가운 햇빛을 피할 수 있는 고급 선글라스입니다."],"double_brows":["눈썹 두 가닥","눈썹이 하나 늘었다! 예쁜 눈썹 두 가닥으로 예쁜 모레미를 만들어 보세요."],"100up":["초보용 레벨업 물약","사용하면 바로 150레벨이 되는 물약입니다.<br><font color=\"orange\">150레벨 이상일 경우 아무런 효과를 받을 수 없습니다.</font>"],"orange_headphone":["주황 헤드폰","잘나가는 인기 모레미의 필수 아이템입니다. 이 헤드폰을 장착하고 진지 모드에 돌입해 보세요."],"bg_mountain":["산 배경","푸른 하늘 아래 있는 산 배경입니다."],"boxB2":["희귀 휘장 상자","희귀한 휘장 2종 중 하나가 담긴 상자입니다. 안에는 무엇이 들어 있을까요?"],"laugh":["웃으며 말해요","웃음을 깨뜨리는 녀석들이 있어도 끄투에서는 서로 웃으며 말해요!"],"rainbow_name":["무지개 이름","이름을 <label class='x-rainbow_name'>무지개</label>로 칠합니다. "],"b2_fire":["불꽃같이 날아오르는 휘장","화염에 휩싸여 하늘 저편으로 자유롭게 날아오르는 모습을 본따 만들어진 보기 드문 휘장입니다."],"muremi":["무레미","무로 변신한 모레미입니다."],"t_rainbow":["무지개색 휘장","모레미를 꾸며 주는 <font color=\"red\">무</font><font color=\"orange\">지</font><font color=\"#50BCDF\">개</font>색 휘장입니다."],"water":["물옷","편안하게 목욕을 즐기기 위해 물 속으로 들어간 모레미입니다."],"blackbere":["검은 베레모","정말 검은 베레모입니다. 특정 계층이 많이 찾는다고 합니다."],"inverteye":["반전 눈","모레미의 눈 색깔이 바뀌면 어떻게 될까요? 바로 이렇게 됩니다."],"happy_eye":["웃는 눈","우리 모두 즐겁게 끄투해요!"],"b4_hongsi":["귤색 띠 휘장","정열의 주황빛 띠 모양의 휘장입니다."],"bluecandy":["포도 막대 사탕","시컴 달달 커다란 포도 맛 막대 사탕입니다."],"b4_bb":["블루베리 띠 휘장","부를 가져오는 푸른빛 띠 모양의 휘장입니다."],"nemoremi":["네모레미","모레미가 네모가 되었다!"],"exp_r":["고급 경험치 물약","사용하면 경험치 6000을 얻을 수 있습니다."],"pink_vest":["분홍 조끼","매력적인 사다리꼴 조끼입니다. 모레미는 2D라 사다리꼴을 입을 수 있습니다."],"exp_n":["일반 경험치 물약","사용하면 경험치 200을 얻을 수 있습니다."],"glasses":["안경 (되팔기)","되팔기를 하고 \"눈 장식\" 카테고리의 안경을 구입해주세요."],"b4_mint":["민트 띠 휘장","조화로운 초록빛 띠 모양의 휘장입니다."],"brown_oxford":["갈색 옥스포드화","옥스포드 대학생이 신는다고 하는 정갈한 갈색 단화입니다. 옥스포드 대학생의 부가 느껴집니다."],"b1_lv500":["500레벨의 휘장","500레벨이다!"],"t_blue":["하늘색 휘장","모레미를 꾸며 주는 <font color=\"blue\">하늘색</font> 휘장입니다."],"exp_l":["전설 경험치 물약","사용하면 경험치 200000을 얻을 수 있습니다."],"twoeight":["2:8 가르마","고상한 멋이 느껴집니다. 왠지 잘난 척 잘할 것 같이 생겼습니다."],"white_mask":["하얀 복면","하얗고도 음침한 분위기의 복면입니다. 이 복면을 장착하고 점수를 다 쓸어담아 보세요."],"b3_do":["도전의 ㄷ 휘장","어휘력 탑을 향해 도전하는 열정을 본따 만들어진 멋진 휘장입니다."],"t_red":["빨간색 휘장","모레미를 꾸며 주는 <font color=\"red\">빨간색</font> 휘장입니다."],"loosesocks":["루즈삭스","모레미는 다리가 짧아서 어떤 양말이든 루즈삭스가 됩니다."],"lemoncandy":["레몬 막대 사탕","상큼 발랄 커다란 레몬 맛 막대 사탕입니다."],"blackrobe":["검은 로브","큭큭… 나에게 어둠이 찾아왔도다……."],"orange_vest":["귤색 조끼","상큼한 사다리꼴 조끼입니다. 모레미는 2D라 사다리꼴을 입을 수 있습니다."],"t_green":["연두색 휘장","모레미를 꾸며 주는 <font color=\"green\">연두색</font> 휘장입니다."],"robotskin":["끄투 봇","끄투 봇과의 대결도 자신있어지는 스킨입니다."],"medal":["금메달","1등의 증표 금메달입니다. 과연 무엇의 1등일까요?"],"scouter":["스카우터","상대의 끄투 실력을 확인할 수 있을 것만 같은 장치입니다."],"rio_seonghwa":["리우 성화","2016 리우데자네이루 올림픽을 기념하는 성화입니다. 성화의 묘한 기운이 당신을 응원합니다."],"mustache":["콧수염","신사적인 플레이를 느껴보고 싶다면 중후한 매력이 넘치는 콧수염을 길러 보세요."],"b1_lv360":["360레벨의 휘장","(전) 만렙 달성 축하드려요~"],"circleremi":["동그레미","모레미가 동그래졌다!"],"b1_lv750":["750레벨의 휘장","만렙이 되는 그날까지!"],"miljip":["밀짚모자","누가 뭐래도 난 끄투 왕이 될 거야! 그의 기운이 느껴지는 모자입니다."],"box_ping":["핑 상자","사용 시 랜덤으로 핑을 획득합니다.<br><font color=\"orange\">10만~20만 사이의 핑을 획득하실 수 있습니다.</font>"],"exp_n3":["일반 경험치 물약 x3 (60%)","사용하면 60% 확률로 300 경험치를 얻을 수 있습니다."],"$WPC":["글자 조각","당신의 끄투 플레이에 이끌려 다가온 신비한 글자 조각입니다. 글자 조합소에서 이 조각의 기운을 이용해 보세요."],"$WPA":["희귀 글자 조각","당신의 끄투 플레이에 이끌려 다가온 신비한 글자 조각입니다. 글자 조합소에서 이 조각의 기운을 이용해 보세요."],"b3_hwa":["조화의 ㅎ 휘장","힘을 조리있게 사용하는 조화로움을 본따 만들어진 멋진 휘장입니다."],"choco_ice":["초코 아이스","더위를 날려 줄 달콤한 초콜릿 맛 아이스크림입니다."],"hongjo_s":["홍조","발그레한 모레미의 홍조입니다."],"b1_master":["마스터의 휘장","만렙 축하드려요!"],"hamster_G":["잿빛 햄스터 머리","ㅇㅅㅇ뀨!"],"orange_name":["주황 이름","이름을 <label class='x-orange_name'>상큼한 주황색</label>으로 칠합니다."],"t_yellow":["노란색 휘장","모레미를 꾸며 주는 <font color=\"yellow\">노란색</font> 휘장입니다."],"nekomimi":["고양이 귀","모레미도 귀가 있다면 분명 이렇게 생겼을 겁니다. 핑을 부르는 앙증맞은 모레미를 만들어 보세요."],"pants_korea":["한국한국 바지","대한민국 국기를 본따 만들어진 바지입니다."],"lever":["레버","딸깍... 딸깍..."],"darkblack":["어둠의 다크니스","그야말로 암흑의 벽지입니다."],"b1_wd":["단어부의 휘장","일해라 단어부!"],"bokjori":["복조리","2017 설날을 기념하는 복조리입니다. 새해 복 많이 받으세요!"],"b1_gm":["운영자의 칭호","일해라 운영자!"],"boxB4":["일반 휘장 상자","일반 휘장 3종 중 하나가 담긴 상자입니다. 안에는 무엇이 들어 있을까요?"],"dictPage":["백과사전 낱장","백과사전에서 떨어져 나온 종이 한 장입니다. 사용하면 약간의 경험치를 획득합니다."],"exp_e":["희귀 경험치 물약","사용하면 경험치 80000을 얻을 수 있습니다."],"pink3dan":["분홍색 배경","분홍분홍한 분홍색 배경입니다."],"decayed_mouth":["썩은 미소","이 미소를 지으면서 '훗, 나는 너보다 끄투를 잘 하지.'와 같은 대사를 날려 보세요."],"sqpants":["네모 바지","글자 친구 모레미에게 멋진 네모 바지를 입혀 보세요."],"b1_lv200":["200레벨의 휘장","분홍끄투와 계속 함께해요!"],"b1_manlep":["450레벨의 휘장","만렙이 얼마 남지 않았어요!"],"exp_up":["레벨업 물약","사용하면 바로 레벨업합니다.<br><font color=\"orange\">단, 만렙 / 전설★의 경우 100만 경험치를 획득합니다.</font><br><br><b>계정당 1회 구입가능</b>"],"title":"언제나 즐거운 분홍끄투!","version":"2.5.3","meta_desc":"온라인 끝말잇기, 앞말잇기, 자음퀴즈, 십자말풀이, 타자 대결까지! 끄투에서 어휘력의 제왕이 되어 보세요.","meta_keys":"끄투,kkutu,끝말잇기,온라인,웹,쿵쿵따,영어끝말잇기,영어쿵쿵따,시리토리,끝말잇기사이트,자음퀴즈,초성퀴즈,자퀴,십자말풀이,가로세로,타자,타자연습,앞말잇기","gameStart":"게임 시작!","serverList":"서버 목록","serverRefresh":"서버 목록을 다시 불러옵니다.","serverWait":"잠시 기다려 주세요.","server_0":"분홍","server_1":"꽃","server_2":"새싹","server_3":"레몬","server_4":"망고","server_5":"보리","server_6":"상추","server_7":"아욱","server_8":"자두","server_9":"참외","server_10":"커피","server_11":"토란","server_12":"포도","server_13":"호박","server_14":"꽈리","server_15":"딸기","server_16":"뽕잎","server_17":"쑥갓","server_18":"찔레","server_19":"고구마","serverEnter":"접속","websocketUnsupport":"본 게임은 Internet Explorer(10), 크롬(16), 파이어폭스(11), 오페라(12.1), 사파리(6) 이상의 버전에서 지원합니다!<br>브라우저를 업데이트해 주세요.","dictionarySupport":"사전 정보 제공:<a href='http://wordnet.princeton.edu' target='_blank'>WordNet</a><br><label style='color: #777777;'>WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved.</label>","sandbox":"샌드박스 :: SDBX","youtube":"분홍꽃 유튜브","youtubs":"분홍꽃 유튜브","etcSupport":"도움:<a href='http://cafe.naver.com/sdbx' target='_blank'>샌드박스 :: SDBX</a>","nickSet":"분홍끄투에 오신 것을 환영합니다!<br>서버에 접속하기 전, 닉네임을 설정해 주세요!<br>(1~12글자, 특수문자 등 사용 불가)","nickLong":"닉네임은 12글자 이하로 설정해 주세요.","nickWrong":"닉네임 설정이 잘못되었습니다.<br>닉네임을 다시 설정해 주세요!","nickDone":"닉네임 설정이 완료되었습니다!","welcome":"환영합니다.","welcomeTestServer":"테스트 서버에 접속했습니다. 본 서버는 특별한 공지 없이 폭발하거나 닫힐 수 있습니다.","loadRemain":"불러오는 중... 앞으로 ","closed":"서버와의 연결이 종료되었습니다.","error":"연결 중 문제가 발생했습니다!","error_full":"서버 제한 인원을 초과했습니다... 잠시 후 접속해 주세요!!!","error_400":"잘못된 접근입니다.","error_401":"손님 계정은 게임 관전만 가능합니다.\n우측 상단의 로그인 단추를 눌러 로그인해 보세요!","error_402":"손님 계정은 한 채널당 최대 5명만 접속 가능합니다.\n우측 상단의 로그인 단추를 눌러 로그인해 보세요!","error_403":"비밀번호가 틀렸습니다.","error_404":"입장 가능한 방을 찾을 수 없습니다. 새 방을 생성합니까?","error_405":"해당 사용자를 찾을 수 없습니다.","error_406":"강제 퇴장된 방에 다시 입장할 수 없습니다.","error_407":"핑이 부족합니다.","error_408":"다른 곳에서 해당 계정으로 접속하여 이 곳의 연결이 종료되었습니다.","error_409":"해당 계정은 이미 접속 중에 있습니다.","error_410":"관리자에 의해 게임에서 제외되었습니다.","error_411":"혼자서는 게임을 시작할 수 없습니다.\n혼자 게임을 즐기고 싶으시다면 [연습]을 클릭하거나 [초대]의 [AI 초대] 기능을 이용해 주세요.","error_412":"모든 플레이어가 준비 상태여야 합니다.","error_413":"적어도 하나의 주제를 선택해야 합니다.","error_414":"부적절한 주제가 감지되었습니다. 주제를 다시 선택해 주세요.","error_415":"이 게임 유형은 끄투 봇이 참여할 수 없습니다.","error_416":"해당 방은 이미 게임 중입니다.\n방에 입장하여 게임을 관전할까요?","error_417":"해당 계정이 로비에 존재하지 않습니다.","error_418":"팀 구성이 잘못되었습니다.","error_419":"해당 사용자가 이미 초대 요청을 받았습니다.","error_421":"프로필 관리는 로그인 후 이용하실 수 있습니다.\n우측 상단의 로그인 단추를 눌러 로그인해 보세요!","error_422":"손님 계정은 초대할 수 없습니다.","error_423":"상점은 로그인 후 이용하실 수 있습니다.\n우측 상단의 로그인 단추를 눌러 로그인해 보세요!","error_424":"해당 사용자가 끄투에 접속하지 않았거나\n이 서버에 접속해 있지 않습니다.\n(이름에 공백이 있다면 공백을 빼고 입력해 주세요.)\n\n사용자: ","error_425":"답장할 상대가 없습니다.","error_426":"장착 중인 항목은 되팔 수 없습니다.","error_427":"항목의 사용 기한이 지났습니다.","error_428":"옵저버는 게임이 끝나면 자동으로 방에서 퇴장합니다.","error_429":"해당 방이 꽉 찼습니다.","error_430":"존재하지 않는 항목입니다.","error_431":"방 구성이 잘못되었습니다.","error_432":"방 구성이 잘못되었습니다. 플레이어 수를 다시 설정해 주세요.","error_433":"방 구성이 잘못되었습니다. 라운드 수를 다시 설정해 주세요.","error_434":"더 이상 사용할 수 없습니다.","error_435":"글자 조각은 한번에 최대 7개까지 조합할 수 있습니다.","error_436":"사전에 등재된 단어로만 조합할 수 있습니다.","error_437":"3 라운드 연속으로 턴을 넘기지 않아 방에서 퇴장되었습니다.","error_438":"게임 중에는 이용할 수 없습니다.","error_440":"손님, 본인 확인이 되지 않은 회원 및 만 16세 미만의 청소년은 오전 0시부터 오전 6시까지 게임 이용이 제한됩니다.","error_441":"회원님의 생년월일 정보를 읽을 수 없습니다. 로그인된 계정의 생년월일 정보가 공개되어 있는지 확인하신 뒤 끄투에서 다시 로그인해 보세요. 본인 확인이 끝나면 생년월일 정보를 숨겨도 됩니다.","error_442":"5분 이상 응답이 없어 서버와의 연결이 종료되었습니다.","error_443":"관리자에 의해 해당 계정으로의 채팅 이용이 제한되었습니다.","error_444":"관리자에 의해 해당 계정으로의 게임 이용이 제한되었습니다.\n제한 사유: ","error_445":"본인 확인에 성공했습니다. 끄투를 이용해 주셔서 감사합니다.","error_450":"해당 사용자가 끄투에 접속하지 않았거나\n이 서버에 접속해 있지 않습니다.","error_451":"커뮤니티 기능은 로그인 후 이용하실 수 있습니다.\n우측 상단의 로그인 단추를 눌러 로그인해 보세요!","error_452":"더 이상 친구를 추가할 수 없습니다.","error_453":"손님 계정을 친구로 추가할 수 없습니다.","error_454":"친구 추가 요청에 대한 응답을 기다리고 있습니다.","error_455":"접속해 있지 않은 친구만 삭제할 수 있습니다.","error_500":"서버 점검 혹은 업데이트가 진행 중입니다.","error_555":"공사 중입니다! ㅠㅠ","error_581":"이미 있는 닉네임입니다.","error_642":"신고는 로그인 후 가능합니다.\n우측 상단의 로그인 단추를 눌러 로그인해 보세요!","error_665":"접속 보상으로 5,000 경험치가 지급되었습니다.","error_666":"접속 보상으로 50,000 경험치가 지급되었습니다. 축하해요!","error_667":"접속 보상으로 500핑이 지급되었습니다.","error_668":"접속 보상으로 2,000핑이 지급되었습니다.","error_669":"접속 보상으로 10,000핑이 지급되었습니다.","error_670":"접속 보상으로 25,000핑이 지급되었습니다. 축하해요!","error_671":"접속 보상으로 50,000핑이 지급되었습니다. 축하합니다!!","error_672":"접속 보상으로 100,000핑이 지급되었습니다. 축하합니다!!","error_673":"접속 보상으로 <del>500</del> → 1,000핑이 지급되었습니다.","error_674":"접속 보상으로 <del>2,000</del> → 4,000핑이 지급되었습니다.","error_675":"접속 보상으로 <del>10,000</del> → 20,000핑이 지급되었습니다.","error_676":"접속 보상으로 <del>25,000</del> → 50,000핑이 지급되었습니다. 축하해요!","error_677":"접속 보상으로 <del>50,000</del> → 100,000핑이 지급되었습니다. 축하합니다!!","error_678":"접속 보상으로 <del>100,000</del> → 200,000핑이 지급되었습니다. 축하합니다!!","error_679":"접속 보상으로 1,000경험치가 지급되었습니다.","error_680":"접속 보상으로 5,000경험치가 지급되었습니다.","error_681":"접속 보상으로 10,000경험치가 지급되었습니다.","error_682":"접속 보상으로 50,000경험치가 지급되었습니다. 축하해요!","error_683":"접속 보상으로 100,000경험치가 지급되었습니다. 축하합니다!!","error_684":"접속 보상으로 300,000경험치가 지급되었습니다. 축하합니다!!","error_685":"접속 보상으로 <del>1,000</del> → 2,000경험치가 지급되었습니다.","error_686":"접속 보상으로 <del>5,000</del> → 10,000경험치가 지급되었습니다.","error_687":"접속 보상으로 <del>10,000</del> → 20,000경험치가 지급되었습니다.","error_688":"접속 보상으로 <del>50,000</del> → 100,000경험치가 지급되었습니다. 축하해요!","error_689":"접속 보상으로 <del>100,000</del> → 200,000경험치가 지급되었습니다. 축하합니다!!","error_690":"접속 보상으로 <del>300,000</del> → 600,000경험치가 지급되었습니다. 축하합니다!!","error_695":"주말에는 접속 보상 x4!","error_705":"디자인/단어부 보상으로 500핑이 지급되었습니다.","error_706":"디자인/단어부 보상으로 1000경험치가 지급되었습니다.","error_754":"분홍끄투를 이용해주셔서 감사합니다! 접속보상 x2!","error_868":"처리가 불가능한 문자가 포함되어 있습니다.","error_878":"계정당 1회만 구입 가능한 상품입니다.","error_985":"관리자에 의해 로비 채팅이 비활성화 되었습니다.","error_987":"운영정책 위반으로 서버와의 접속이 종료되었습니다.","turnError_402":"첫 턴 한방 금지","turnError_403":"한방 단어","turnError_405":"외래어","turnError_406":"깐깐!","turnError_407":"다른 주제","turnError_409":"이미 쓰인 단어","turnError_410":"금지된 문자가 있음!","turnError_413":"배려!","turnError_456":"한방 / 공격 단어!","checkAgeAsk":"끄투에서는 본인 확인을 위해 생년월일을 입력받고 있습니다. 입력된 생년월일은 본인 확인 및 내부 정보 처리에만 이용되며 제3자에게 공개되지 않습니다.\n본인 확인을 진행합니까?","checkAgeNo":"입력 값이 올바르지 않습니다. 다시 확인해 주세요.","checkAgeInput1":"생년월일 중 연도를 입력해 주세요. (4자리)","checkAgeInput2":"생년월일 중 월을 입력해 주세요. (1~12 중)","checkAgeInput3":"생년월일 중 일을 입력해 주세요. (1~31 중)","checkAgeSure":"아래 입력한 생년월일이 맞습니까? 입력된 생년월일은 본인 확인 및 내부 정보 처리에만 이용되며 제3자에게 공개되지 않습니다.","CharCheck":"처리가 불가능한 문자가 포함되어 있습니다.","checkAgeCancel":"본인 확인을 취소하고 미루겠습니까?","UserList":"FA{users}접속자 목록","RoomList":"FA{bars}방 목록","JyeongR":"FA{list-ul}정렬","Shop":"FA{shopping-bag}상점","Chat":"FA{comment}채팅","Jyrl":"FA{bars} 정렬","Room":"방","Game":"게임","Me":"FA{user}내 정보","globalWin":"통산","whisper":"귓속말","handover":"방장 인계","sureHandover":"정말 방장을 인계합니까?","connectToRoom":"방과 연결하는 중...","ctrCancel":"연결 취소","linkWarning":"링크를 클릭하셨습니다. 해당 링크로 이동하는 것으로 발생하는 피해는 본 서비스에서 책임지지 않습니다. 계속합니까?","trollWarning":"두 번 연속 턴을 넘기지 못했습니다. 세 번째로 턴을 넘기지 못하는 경우 방에서 퇴장하게 됩니다.","changeServer":"서버 이동","friend":"친구","fstat_on":"님이 접속했습니다.","fstat_off":"님이 접속을 종료했습니다.","tip_1":"리턴을 넣으면 경험치, 핑 배율이 대폭 감소합니다.","tip_2":"시간 무제한을 넣으면 착용 아이템의 분당 경험치, 핑을 제외한 경험치, 핑을 획득할 수 없습니다.","tip_3":"분홍끄투는 2020.1.11에 오픈되었습니다.","tip_4":"특수규칙 \"핵\"을 넣으면 핵이나 매크로 프로그램을 사용할 수 있습니다.","teamSolo":"개인","guest":"회원","roomTitle":"방 제목","roomDefault":"님의 방","password":"비밀번호","userLimit":"플레이어 수","gameMode":"게임 유형","mcKorean":"한국어","mcEnglish":"영어","mcOthers":"기타","modeEKT":"영어 끄투","modeESH":"영어 끝말잇기","modeKKT":"한국어 쿵쿵따","modeKMT":"한국어 끄투","modeKSH":"한국어 끝말잇기","modeCSQ":"자음퀴즈","modeKAW":"한국어 자유","modeKCW":"한국어 십자말풀이","modeKTY":"한국어 타자 대결","modeETY":"영어 타자 대결","modeKAP":"한국어 앞말잇기","modeHUN":"훈민정음","modeKDA":"한국어 단어 대결","modeEDA":"영어 단어 대결","modeKSS":"한국어 솎솎","modeESS":"영어 솎솎","modeKAD":"한국어 단어 전체","modeEAD":"영어 단어 전체","modeEAW":"영어 자유","modeKEA":"단어 전체","modeEKD":"영어 쿵쿵따","modeKDG":"한국어 그림 퀴즈","modeEDG":"영어 그림 퀴즈","modeEAP":"영어 앞말잇기","modeEJH":"영어 자유 끝말잇기","modeKJH":"한국어 자유 끝말잇기","modeKGT":"한국어 가운뎃말잇기","modeEGT":"영어 가운뎃말잇기","modeSYG":"369 게임","modex0":"끝 두/세 자리로 시작하는 영어 어휘로 잇습니다.<br>ap<u>ple</u> → <u>ple</u>a<u>se</u> → <u>se</u>cret","modex1":"끝 한 자리로 시작하는 영어 어휘로 잇습니다.<br>appl<u>e</u> → <u>e</u>lephan<u>t</u> → <u>t</u>ime","modex2":"끝 한 자리로 시작하는 세 글자의 한국어 어휘로 잇습니다.<br>강아<u>지</u> → <u>지</u>렁<u>이</u> → <u>이</u>발소","modex3":"끝 한 자리로 시작하는 한국어 어휘로 잇습니다.<br>그<u>물</u> → <u>물</u>레방<u>아</u> → <u>아</u>저씨","modex4":"주어진 주제와 초성만 가지고 어떤 단어인지 유추합니다.","modex5":"십자 모양의 빈 칸에 들어갈 알맞은 한국어 단어를 유추합니다.","modex6":"주어진 한국어 단어를 최대한 빠르게 입력합니다.","modex7":"주어진 영어 단어를 최대한 빠르게 입력합니다.","modex8":"앞 한 자리로 끝나는 한국어 어휘로 잇습니다.<br><u>고</u>구마 → <u>이</u>실직<u>고</u> → 맏<u>이</u>","modex9":"주어진 초성에 맞는 한국어 어휘를 댑니다.","modex10":"주어진 주제에 맞는 한국어 어휘를 댑니다.","modex11":"주어진 주제에 맞는 영어 어휘를 댑니다.","modex12":"무작위로 섞인 글자들 속에서 한국어 단어를 솎아 냅니다.","modex13":"무작위로 섞인 글자들 속에서 영어 단어를 솎아 냅니다.","modex14":"한국어에 있는 모든 단어 중 아무 단어나 입력합니다.","modex15":"영어에 있는 모든 단어 중 아무 단어나 입력합니다.","modex16":"한국어로 아무 글자나 입력합니다.","modex17":"영어로 아무 글자나 입력합니다.","modex18":"끝 두/세 자리로 시작하는 한국어 어휘로 잇습니다.<br>이상한나라의앨<u>리스</u> → <u>리스</u><u>항구</u> → <u>항구</u>도시","modex19":"존재하는 단어 중 한 / 영 상관 없이 아무 단어나 입력합니다.","modex20":"끝 한 자리로 시작하는 세 글자의 영어 어휘로 잇습니다.<br>an<u>i</u> → <u>i</u>c<u>e</u> → <u>e</u>ft","modex21":"한글로 된 2자 ~ 10자의 단어를 그림으로 설명하고 맞춥니다. <b>경고: 모바일은 정상플레이 불가</b>","modex22":"영어로 된 4자 ~ 16자의 단어를 그림으로 설명하고 맞춥니다. <b>경고: 모바일은 정상플레이 불가</b>","modex23":"앞 한 자리로 끝나는 영어 어휘로 잇습니다.<br><u>e</u>ast → <u>c</u>abbag<u>e</u>","modex24":"끝 한 자리로 시작하는 아무 말로 잇습니다.","modex25":"끝 한 자리로 시작하는 아무 말로 잇습니다.","modex26":"가운뎃 말로 시작하는 한국어 어휘로 잇습니다.<br><b>글자 수가 짝수일 경우 가운데 2글자 중 랜덤으로 선택</b>","numRound":"라운드 수","roundTime":"라운드 시간","players":"참여자","rounds":"라운드","subJamsu":"모든 참여자가 준비했습니다. 30초 이내에 게임을 시작하지 않으면 자동으로 방에서 나가게 됩니다.","masterJamsu":"모든 참여자가 준비했으나 게임을 시작하지 않아 방에서 퇴장되었습니다.","join":"입장","hasJoined":"님이 입장했습니다.","hasLeft":"님이 퇴장했습니다.","hasMaster":"님으로 방장이 바뀌었습니다.","hasModified":"방 설정이 바뀌었습니다.","hasKicked":"방에서 강제 퇴장되었습니다.","yourTurn":"당신의 차례!","inputChat":"아래의 채팅 창에서 입력하세요.","inputHere":"여기에 입력하세요.","putPassword":"비밀번호를 입력하세요.","stat_ready":"준비","stat_noready":"대기","stat_spectate":"관전","stat_practice":"연습","pform_J":"참여","pform_S":"관전","pform_O":"옵저버","gameLoading":"게임 정보를 불러오고 있습니다.","master":"방장","soon":"잠시 후 게임이 시작됩니다!","roundEnd":"게임 끝!","sureExit":"게임을 중단하고 퇴장합니까?","exitBlocked":"방에 중퇴금지 옵션이 있어 퇴장할 수 없습니다.","misc":"특수 규칙","optManner":"매너","explManner":"한방 단어를 사용할 수 없게 합니다.","optInjeong":"어인정","explInjeong":"특수한 단어의 사용을 인정합니다.","optMission":"미션","explMission":"특정 글자를 포함시킨 단어로 이으면 추가 점수를 얻습니다.","explInjeongListTitle":"사용 가능한 단어 그룹","optLoanword":"우리말","explLoanword":"외래어를 사용할 수 없게 합니다.","optProverb":"속담","explProverb":"화면에 낱말 대신 한 문장씩 나타납니다.","optStrict":"깐깐","explStrict":"방언, 옛말, 북한말을 제외한 명사 단어만 입력할 수 있습니다.","optReturn":"리턴","explReturn":"사용했던 단어를 다시 사용할 수 있습니다.","optProtect":"보호","explProtect":"한방 단어로 공격을 당할 경우 점수가 깎이지 않습니다.","optInftime":"시간 무제한","explInftime":"라운드 시간이 흐르지 않습니다.","optExitblock":"중퇴 금지","explExitblock":"중도 퇴장을 금지합니다.","optDongsa":"특수 단어","explDongsa":"동사 / 형용사 등의 품사의 단어를 사용 가능하게 합니다.","optSpacewd":"띄어쓰기","explSpacewd":"띄어쓰기가 있는 어휘를 사용 가능하게 합니다.","optSpecwd":"특수문자","explSpecwd":"특수문자가 있는 어휘를 사용 가능하게 합니다.","optScboost":"점수 증가","explScboost":"경험치 배율이 대폭 감소하는 대신 획득하는 점수가 대폭 증가합니다.","optNojmoon":"장문 금지","optSami":"3232","explSami":"세 글자 단어와 두 글자 단어를 번갈아가며 잇습니다.","optVblock":"지진 끄기","explVblock":"지진 효과를 끕니다.","optNo2":"2글자 금지","explNo2":"두 글자 단어의 사용을 막습니다.","optSblt":"봇 초보","explSblt":"봇이 장문을 치지 못하게 합니다.","optSbl1":"봇 1자","explSbl1":"봇이 1글자만 치게 합니다.","optSbsg":"봇 사기","explSbsg":"봇의 단어의 길이가 매우 길어집니다.","optSbhk":"봇 핵","explSbhk":"봇의 단어의 길이가 엄청나게 길어집니다. / 렉 주의","optConsider":"배려","explConsider":"이을 수 있는 단어가 3개 이하인 단어를 사용하지 못하게 합니다.","optUnlimited":"무제한","explUnlimited":"그림퀴즈에서 나오는 단어의 길이의 제한을 없앱니다.","optShort":"짧음","explShort":"그림퀴즈에서 나오는 단어의 길이를 최대 4글자로 정합니다.","optHack":"핵","explHack":"해당 모드 사용 시 핵 / 매크로를 사용이 가능합니다. 단, 글자 조각, 경험치, 핑 등을 모두 획득할 수 없습니다.","optDeclag":"렉 방지","explDeclag":"게임 중에 발생하는 점수 획득 효과, 미션 효과 등을 모두 비활성화하여 렉을 최소화합니다.","optRrlanner":"매너","explRrlanner":"숫자, 영문, 한글로 끝나지 않는 단어를 사용할 수 없게 합니다.","hidden":"(미공개)","pickInjeong":"주제 선택","explInjPick":"게임에서 사용할 주제를 선택하세요.","injpickAll":"모두 설정","injpickNo":"모두 해제","cwHorz":"가로 ","cwVert":"세로 ","cwL":"글자","avg":"평균","afterRun":"초 후 다음 라운드","drawingLineWidth":"선 굵기","drawingColor":"색깔","drawingClear":"모두 지우기","wordis":"제시어: ","themeis":"주제: ","kpm":"<label style='font-size: 11px;'>타/분</label>","theme_IMS":"THE iDOLM@STER","theme_VOC":"VOCALOID","theme_KRR":"개구리 중사 케로로","theme_KTV":"국내 방송 프로그램","theme_NSK":"니세코이","theme_KOT":"대한민국 철도역","theme_DOT":"도타 2","theme_DRR":"듀라라라!!","theme_DGM":"디지몬","theme_RAG":"간식","theme_LVL":"러브 라이브!","theme_LOL":"리그 오브 레전드","theme_MRN":"마법소녀 리리컬 나노하","theme_MMM":"마법소녀 마도카☆마기카","theme_MAP":"메이플스토리","theme_MKK":"메카쿠시티 액터즈","theme_MNG":"모노가타리 시리즈","theme_MOB":"모바일 게임","theme_HYK":"빙과","theme_CYP":"사이퍼즈","theme_HRH":"스즈미야 하루히","theme_STA":"스타크래프트","theme_OIJ":"신조어","theme_KGR":"아지랑이 프로젝트","theme_ESB":"앙상블 스타즈!","theme_ELW":"엘소드","theme_OIM":"오레이모","theme_OVW":"오버워치","theme_NEX":"온라인 게임","theme_WMV":"외국 영화","theme_WOW":"월드 오브 워크래프트","theme_YRY":"유루유리","theme_KPO":"유명인","theme_JLN":"라이트 노벨","theme_JAN":"만화/애니메이션","theme_ZEL":"젤다의 전설","theme_POK":"포켓몬스터","theme_HAI":"하이큐!!","theme_HSS":"하스스톤","theme_KMV":"한국 영화","theme_HDC":"함대 컬렉션","theme_HOS":"히어로즈 오브 더 스톰","theme_PFL":"분홍꽃","theme_SBK":"소설","theme_MCP":"마인크래프트","theme_BUS":"버스 정류장","theme_CKR":"쿠키런","theme_KTR":"카트라이더","theme_COV":"쿠키런:오븐브레이크","theme_DBG":"동방 프로젝트","theme_WBT":"웹툰","theme_BRW":"브롤스타즈","theme_SCH":"학교","theme_JOB":"직업","theme_KPS":"한국 대중음악","theme_PRV":"속담","theme_KYT":"국내 유튜브 채널","theme_MPE":"마인크래프트 PE","theme_ONE":"원피스","theme_DOR":"도라에몽","theme_ZBH":"좀비고등학교","theme_CLY":"클래시 로얄","theme_MCM":"마블 코믹스","theme_BTR":"붕괴 3rd","theme_BSI":"기업","theme_MFF":"마피아 42","theme_ACV":"Age Of Civilizations II","theme_ARP":"공항","theme_KRD":"한국 라디오 프로그램","theme_JPT":"일본 철도역","theme_TSN":"369 게임","theme_NKT":"북한 철도역","theme_PBC":"냥코 대전쟁","theme_RTG":"리듬게임","theme_YKW":"요괴워치","flag_1":"외래어","flag_2":"어인정","flag_4":"본래 띄어쓰기가 있는 어휘","flag_8":"방언","flag_16":"옛말","flag_32":"문화어","class_1":"명","class_2":"대명","class_3":"수","class_4":"조","class_5":"동","class_6":"형","class_7":"관","class_8":"부","class_9":"감","class_10":"접","class_11":"의명","class_12":"조동","class_13":"조형","class_14":"어","class_15":"관·명","class_16":"수·관","class_17":"명·부","class_18":"감·명","class_19":"대·부","class_20":"대·감","class_21":"동·형","class_22":"관·감","class_23":"부·감","class_24":"의명·조","class_25":"수·관·명","class_26":"대·관","theme_e03":"★","theme_e05":"동물","theme_e08":"인체","theme_e10":"언어","theme_e12":"감정","theme_e13":"음식","theme_e15":"지명","theme_e18":"사람","theme_e20":"식물","theme_e43":"날씨","theme_e53":"물리","theme_10":"가톨릭","theme_20":"건설","theme_30":"경제","theme_40":"고적","theme_50":"고유","theme_60":"공업","theme_70":"광업","theme_80":"교육","theme_90":"교통","theme_100":"군사","theme_110":"기계","theme_120":"기독교","theme_130":"논리","theme_140":"농업","theme_150":"문학","theme_160":"물리","theme_170":"미술","theme_180":"민속","theme_190":"동물","theme_200":"법률","theme_210":"불교","theme_220":"사회","theme_230":"생물","theme_240":"수학","theme_250":"수산","theme_260":"수공","theme_270":"식물","theme_280":"심리","theme_290":"약학","theme_300":"언론","theme_310":"언어","theme_320":"역사","theme_330":"연영","theme_340":"예술","theme_350":"운동","theme_360":"음악","theme_370":"의학","theme_380":"인명","theme_390":"전기","theme_400":"정치","theme_410":"종교","theme_420":"지리","theme_430":"지명","theme_440":"책명","theme_450":"천문","theme_460":"철학","theme_470":"출판","theme_480":"통신","theme_490":"컴퓨터","theme_500":"한의학","theme_510":"항공","theme_520":"해양","theme_530":"화학","theme_1001":"나라 이름과 수도","jqTheme":"주제","enhance_201":"강화에 실패했습니다.","class_n":"명","class_a":"형","class_s":"형","class_v":"동","class_r":"부","class_vi":"자동","class_vt":"타동","class_p":"대명","class_int":"감","class_prep":"전","class_aux":"조동","gameResult":"게임 결과","scoreGain":"획득한 경험치","moneyGain":"획득한 핑","scoreOrigin":"기본 제공 경험치","moneyOrigin":"기본 제공 핑","bonusFrom_q":"아이템 장착 효과","bonusFrom_k":"오끄감 버프 효과","bonusFrom_z":"어린이날 효과","bonusFrom_r":"랜덤 지급 효과","bonusFrom_w":"운영자 버프 효과","bonusFrom_t":"핫타임 보너스","bonusFrom_u":"운영진 버프 효과","bonusFrom_e":"이벤트 효과","bonusFrom_j":"주말 효과","bonusFrom_l":"아이템 강화 효과","lvUp":"레벨 업!","ping":"핑","making":"공사 중입니다! ㅠㅠ","robot":"끄투 봇","null":"(정보 없음)","record":"전적","recper":"승률","kick":"강퇴","place":"위치","roomNumber":"번 방","lobby":"로비","recordScore":"총 경험치","sProfile":"님의 정보","sRoomInfo":"번 방의 정보","pAlert":"분홍끄투 안내","paOK":"확인","pfWelcome":"분홍끄투에 오신 것을 환영합니다!","kickVote":"강퇴 투표","kickVoteNotice":"시간 안에 응답하지 않을 경우 찬성으로 간주합니다.","agree":"찬성","disagree":"반대","sureKick":"정말 해당 사용자를 강퇴합니까?","kickVoting":"님의 강제 퇴장에 대한 투표가 진행 중입니다.","kickVoteText":"님의 강제 퇴장에 찬성합니까?","kicked":"님이 강제 퇴장되었습니다.","kickDenied":"님의 강제 퇴장에 대한 투표가 부결되었습니다.","causeMaster":"방장에 의해 ","inviteDenied":"님이 초대를 거절했습니다.","invited":"번 방으로부터 참여 요청을 받았습니다.<br>수락합니까?","guestExit":"관전을 재미있게 하셨나요?\n지금 우측 상단의 로그인 단추를 눌러 플레이해 보세요!","saveReplay":"경기 저장","obtained":"아이템을 획득했습니다","obtainExp":"경험치를 획득했습니다","obtainMoney":"핑을 획득했습니다","sureConsume":"정말 이 항목을 사용합니까?","reportSuccess":"정상적으로 신고되었습니다.","reportWriteR":"신고 사유를 입력 해 주세요.","dress":"프로필 관리","reportOK":"신고","report":"신고","reportElse":"기타","reportText":"신고하기","reportBadwords":"비정상적인 채팅 (욕설, 도배, 비하 발언, 성적 표현 등)","reportSaching":"사칭 행위 (관리 / 단어부 또는 운영자 사칭)","reportHacking":"핵 사용 (핵 모드를 사용하지 않고 핵 사용)","reportBadplay":"비정상 플레이 (버그 악용, 지나친 어뷰징 행위 등)","reportElseL":"기타 사유를 이곳에 자세히 입력해주세요.","myNickname":"닉네임 변경","myNicknameX":"최대 12글자, 몇 가지 특수 문자 사용 불가","myExordial":"소개 한마디","myExordialX":"100글자 이내","myMoremi":"내 모레미","category_all":"전체","category_spec":"특수","category_skin":"스킨","category_badge":"휘장","category_head":"머리","category_eye":"눈","category_acc":"장식","category_eyeacc":"눈 장식","category_facc":"얼굴 장식","category_mouth":"입","category_clothes":"옷","category_hs":"손발","category_back":"배경","equipped":"<font style='color: #FFB861;'> (착용 중)</font>","sureEquip":"다음 항목을 착용합니다","sureUnequip":"다음 항목을 착용 해제합니다","dressWhichHand":"어떤 손에 장착합니까?","charFactory":"글자 조합소","cfCompose":"조합","cfTray":"글자 조각을 클릭하여 단어를 만들어 보세요.","cfBlend":"뜻이 없는 글자 조각 3개를 융합시킬 수 있습니다. 조합 단추를 누르면 융합이 진행됩니다.","cfReward":"조합 보상","cfRewAlways":"<b>확정!</b>","cfCost":"조합 비용","cfSureCompose":"정말 조합합니까? 조합 재료로 쓰인 글자 조각들은 모두 사라집니다.","cfComposed":"조합에 성공했습니다!","hasExpired":" 항목의 사용 기한이 다 되어 사라졌습니다.","profileWrong":"닉네임 설정이 잘못되었습니다. 닉네임을 다시 설정해 주세요.","profileChanged":"프로필 정보가 변경되었습니다. 새로고침 시 적용됩니다.","cmd_r":"(/r) 준비 단추를 누릅니다. 방장일 경우 시작 단추를 누릅니다.","cmd_exit":"(/ex, /exit) 나가기 단추를 누릅니다.","cmd_sp":"(/sp, /spec) 관전 단추를 누릅니다. 게임 중일 때는 사용이 불가능합니다.","cmd_cls":"(/cls) 채팅 창을 비웁니다.","cmd_f":"(/f) 최근 100개의 대화 기록을 담은 창을 띄웁니다.","cmd_e":"(/귓, /e <i>대상</i> <i>내용</i>) <i>대상</i>에게 귓속말을 보냅니다.","cmd_ee":"(/답, /ee <i>내용</i>) 가장 최근에 귓속말을 보낸 상대에게 귓속말을 보냅니다.","cmd_wb":"(/wb <i>대상</i>) 대상의 귓속말을 무시합니다. 무시된 상태에서 이 명령어를 다시 사용하면 무시가 해제됩니다.","cmd_shut":"(/shut <i>대상</i>) 대상의 모든 대화를 차단합니다. 차단된 상태에서 이 명령어를 다시 사용하면 차단이 해제됩니다.","cmd_id":"(/id <i>대상</i>) 대상의 식별 번호를 얻습니다.","cmd_rmv":"(/remove) 채팅 창과 채팅 기록을 모두 비웁니다.","myId":"내 식별 번호: ","send":"전송","help":"FA{question-circle}","helpText":"도움말","settings":"FA{wrench}","settingsText":"환경 설정","community":"FA{comments}","communityText":"친구","bulletin":"FA{bullhorn}&nbsp;알립니다","leaderboard":"FA{trophy}&nbsp;랭킹","onlyleaderboard":"FA{trophy}","onlymyeongboard":"FA{university}","onlyCom":"FA{users}","myeongboard":"FA{university}&nbsp;명예의 전당","pingboard":"FA{krw}&nbsp;핑 랭킹","nickname":"이름","spectate":"관전하기","mute":"음소거","bgm":"배경 음악","effect":"효과음","save":"저장","denyReq":"요청 거부","ingames":"게임 관련","etc":"기타","jangmoonDis":"장문 효과음 미사용","missionDis":"미션 효과음 미사용","yokFiltering":"욕설 필터링","reqExpShow":"필요 경험치로 표시","manExpShow":"만렙 퍼센트로 표시","decreaseLag":"렉 줄이기","denyInvite":"초대","sureInvite":"님을 초대합니까?","autoReady":"자동 준비","noNotice":"접속 시 공지사항 숨기기","sortUser":"접속자 목록 레벨 순 정렬","onlyWaiting":"대기 중인 방만 보기","onlyUnlock":"열려 있는 방만 보기","prevPage":"이전","myRank":"내 순위","nextPage":"다음","page":"페이지","attemptFriendAdd":"님의 친구 추가 요청을 받았습니다.<br>수락합니까?","friendEditMemo":"이 친구에 대한 메모를 설정합니다. (최고 50자)","friendAddRes_ok":"님과 친구가 되었습니다.","friendAddRes_no":"님이 친구 추가 요청을 거절했습니다.","friendAddNotice":"친구 추가 요청을 보낼 사용자의 식별 번호를 입력하세요.\n식별 번호는 명령어 /id를 이용하여 구할 수 있습니다.","friendAdd":"친구 추가","friendSureRemove":"이 친구를 정말 삭제합니까?<br>삭제하는 경우 상대방의 친구 목록에서도<br>회원님이 빠지게 됩니다.","newRoom":"방 만들기","setRoom":"방 설정","quickRoom":"빠른 입장","mac":"계정 이전","quickStatus":"해당 유형의 방 수:","quickQueue":"방 찾는 중...","exit":"나가기","ready":"준비","practice":"연습","start":"시작","shop":"상점","invite":"초대","inviteRobot":"AI 초대","dict":"사전","wordPlus":"단어 추가","chatLog":"대화 기록","notice":"알림","yell":"[공지]","dying":"현재 접속하신 채널에 문제가 발생하여 10초 후 접속이 종료됩니다. 이용에 불편을 드려 대단히 죄송합니다.","blocked":"과도한 메시지 전송으로 관련 기능을 잠시 이용할 수 없습니다.","wblocked":"님의 귓속말을 무시합니다.","wnblocked":"님의 귓속말을 듣습니다.","shut":"차단","userShut":"님의 모든 대화를 차단합니다.","userNShut":"님을 차단 해제합니다.","purchase":"구매","payback":"되팔기","paybackHelp":"Ctrl 키를 누른 상태에서 되팔 항목을 선택해 주세요.","surePayback":"정말 이 항목을 되팝니까? 되판 항목은 복구할 수 없습니다.\n예상 회수 핑: ","painback":"항목을 되팔았습니다.","pingBefore":"현재 핑","pingCost":"가격","pingAfter":"이후 핑","moremiAfter":"착용 모습","alreadyGot":"<b style='color: red;'>이미 보유한 상품인 것 같습니다.</b>","surePurchase":"이 항목을 구매합니까?","notEnoughMoney":"핑이 부족합니다.","shopSearch":"아이템 검색","purchased":"성공적으로 구매했습니다.\n구매한 상품은 화면 왼쪽 아래의\n[내 정보] > [프로필 관리] 단추를 눌러 \n확인할 수 있습니다.","okgExpl":"<h4><label style='color: #FFFF44;'>오늘도 끄투를 이용해 주셔서 감사합니다!</label></h4>끄투에서 사람들과 함께 게임 플레이 시간 5분을 달성할 때마다<br>경험치와 핑을 더욱 많이 얻을 수 있는 <label style='color: #FFFF44;'>오끄감 버프</label>를 획득할 수 있습니다!","okgNotice":"게임 플레이 시간 5분을 달성하여 오끄감 버프를 획득했습니다!","okgCurrent":"현재 오끄감 버프 중첩 (최대 18): ","okgExpired":"자정이 지나 오끄감 버프 중첩이 초기화되었습니다.","replay":"리플레이","replayDate":"기록 날짜","replayPlayers":"참가자","replayView":"보기","replayError":"올바른 끄투 리플레이 파일이 아닙니다.","replayPrev":"←","replayPause":"❚❚","replayResume":"▶","replayNext":"→","aiSetting":"AI 설정","selectLevel":"난이도","aiLevel-1":"구경꾼","aiLevel0":"왕초보","aiLevel1":"초보","aiLevel2":"적절","aiLevel3":"고수","aiLevel4":"사기","team":"팀","searching":"검색 중","injeongReq":"추가 요청","wpDesc1":"추가되기를 희망하는 단어를 입력하세요.","wpDesc2":"단어가 추가되면 경험치 보상을 획득합니다!","wpHere":"검색어","wpInput":"여기에 입력","wpReward":"결과","wpSuccess":"성공!","wpFail_400":"실패 - 잘못된 접근입니다.","wpFail_401":"실패 - 단어가 명사여야 합니다.","wpFail_402":"실패 - 로그인이 필요합니다.","wpFail_403":"실패 - 이미 신청된 단어입니다.","wpFail_404":"유효하지 않은 단어입니다.","wpFail_405":"실패 - 위키에 없는 단어입니다.","wpFail_406":"실패 - 신청 기준에 맞지 않는 단어입니다.","wpFail_409":"실패 - 이미 등록된 단어입니다.","wpFail_429":"실패 - 잠시 후 시도해 주세요."};
var myst = true;
var spamWarning = 0;
var spamCount = 0;
var slow = 0;
var rslow = { i: 0, t: 0 };
var noPF = false;
var noFunc = function(){};
var onnick = false;
var cdn = "https://cdn.jsdelivr.net/gh/pink-flower/pink-kkutu@latest";
var en_info = { item: '', ping: 0, per: 0 };
const per = [100, 70, 60, 30, 20, 10, 10, 8.25, 7.75, 5, 0];
const lis = [115, 130, 145, 160, 175, 190, 210, 230, 250, 300, 300];
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
	
	if($data._talkValue == r.value && !$data.place){
		if(++$data._sameTalk >= 4 && spamCount++ > 1.3) return notice('같은 말을 빠르게 입력하는 것은 타 사용자에게 피해를 줄 수 있습니다.');
	}else $data._sameTalk = 0;
	$data._talkValue = r.value;
	if(type == "talk"){
		if($data.users[$data.id].nickname == "") return ws.close();
	}
	if(type == "talk") if(spamCount++ > 10){
		if(++spamWarning >= 3) return notice('채팅을 천천히 해 주세요.');
		else spamCount = 5;
	}
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
			$data.users[$data.id].data.money = res.money;
			$data.users[$data.id].money = res.money;
			updateMe();
			return pfAlert(L["enhance_" + res.fail]);
		}else{
			if(res.result && res.result == 200){
				$data.users[$data.id].data.money = res.money;
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
function applyOptions(opt){
	//console.log(opt);
	var pre = $data.muteBGM;
	var prf = $data.muteEff;
	//if(!opt.bg) opt.bg = 'og';
	var srt = { lv: $data.opts.su, tm: $data.opts.rv }
	$data.opts = opt;
	$data.muteBGM = $data.opts.mb;
	$data.muteEff = $data.opts.me;
	
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
	$("#yok-seol").attr('checked', $data.opts.bw);
	$("#deny-mention").attr('checked', $data.opts.mc);
	$("#dizzy-off").attr('checked', $data.opts.dz);
	$("#pink-bgm").val($data.opts.bg).attr('selected', 'selected');
	$("#pink-theme").val($data.opts.th).attr('selected', 'selected');
	$("#sort-nick").attr('checked', !$data.opts.su);
	$("#deny-keyword").attr('checked', $data.opts.kw);
	$("#ka-word").attr('checked', $data.opts.wd);
	$("#ka-icld").attr('checked', !$data.opts.wd);
	$("#dt-gs").attr('checked', $data.opts.dt);
	$("#dt-wb").attr('checked', !$data.opts.dt);
	
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
	}
	$(".room-user").removeClass('.light-hover');
	$(".room-user").removeClass('.dark-hover');
	$(".room-user").addClass($data.opts.th + '-hover');
	if($data.bgm){
		if($data.muteBGM){
			$data.bgm.volume = 0;
			$data.bgm.stop();
		}else{
			$data.bgm.volume = 1;
			$data.bgm = playBGM($data.opts.bg, true);
		}
		//$data.bgm.volume = ($data.muteBGM / 100);
	}
	if(srt.lv != $data.opts.su) updateUserList(true);
	if(srt.tm != $data.opts.rv) updateRoomList(true);
	/*if(pre > 1 && $data.muteBGM <= 1) $data.bgm.stop();
	if(pre <= 1 && $data.muteBGM > 1){
		$data.bgm.volume = ($data.muteBGM / 100);
		$data.bgm = playBGM($data.bgm.key, true);
	}*/
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
	var url = $data.URL.replace(/:(\d+)/, function(v, p1){
		return ":" + (Number(p1) + 416 + Number(chan) - 1);
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
            var $introText = $("#intro-text");
            $introText.empty();
            $introText.html('게스트는 캡챠 인증이 필요합니다.' +
                '<br/>로그인을 하시면 캡챠 인증을 건너뛰실 수 있습니다.' +
                '<br/><br/>');
            $introText.append($('<div class="g-recaptcha" id="recaptcha" style="display: table; margin: 0 auto;"></div>'));

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
			if(data.test) pfAlert(L['welcomeTestServer']);
			if(location.hash[1]) tryJoin(location.hash.slice(1));
			updateUI(undefined, true);
			var kaq = Math.floor(Math.random() * 4) + 1;
			notice(L['tip_' + kaq], '[TIP]');
			welcome();
			if(data.caj) checkAge();
			updateCommunity();
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
			else pfConfirm(data.from + L['invited'], function(){send('inviteRes', { from: data.from, res: true }); }, function(){send('inviteRes', { from: data.from, res: false }); });
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
				};
				document.onkeyup = function(e){
					send('test', { ev: "u", c: e.keyCode }, true);
				};
			}else{
				clearInterval($data._testt);
				document.onkeydown = undefined;
				document.onkeyup = undefined;
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
				playBGM($data.opts.bg);
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
			break;
		case 'exoc':
			$data.users[data.usr].exordial = data.value;
			break;
		case 'roomlist':
			$data.room = data.val;
			updateRoomList(true);
			break;
		case 'dict':
			renderDict(data);
			break;
		default:
			break;
	}
	if($data._record) recordEvent(data);

    function recaptchaCallback(response) {
        ws.send(JSON.stringify({type: 'recaptcha', token: response}));
    }
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
		if(newnick.length > 12){
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
function welcome(){
	playBGM($data.opts.bg);
	$("#Intro").animate({ 'opacity': 1 }, 1000).animate({ 'opacity': 0 }, 1000);
	$("#intro-text").text(L['welcome']);
	addTimeout(function(){
		$("#Intro").hide();
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
		'/id': L['cmd_id']
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
		default:
			for(i in CMD) notice(CMD[i], i);
			break;
	}
}
function sendWhisper(target, text){
	if(text.length){
		$data._whisper = target;
		send('talk', { whisper: target, value: text }, true);
		chat({ title: "→" + target }, text, true);
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
	var text = text.replace(/[^\sa-zA-Zㄱ-ㅎ0-9가-힣]/g, "");
	var lang = text.match(/[ㄱ-ㅎ가-힣]/) ? 'ko' : 'en';
	
	if(text.length < 1) return callback({ error: 404 });
	/*
	$data.opts.dt
	true: AUTO
	
	*/
	if($data.opts.dt && mode != 2){
		send('dict', { word: text, lang: lang });
	}else{
		$.get("/dict/" + text + "?lang=" + lang, callback);
	}
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
				playBGM($data.opts.bg);
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
					$data.users[i].game.score = data.spec[i];
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
				playBGM($data.opts.bg);
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
		$(".my-gauge .graph-bar").width(j * 190);
		var gls = (my.data.score-prev)/(goal-prev) * 100;
		gls = gls.toFixed(2);
		var gss = my.data.score / 50000000 * 100;
		gss = gss.toFixed(2);
		if(!$data.opts.rq) $(".my-gauge-text").html($data.opts.ml ? commify(my.data.score) + " / " + commify(50000000) + " [" + gss + "%]" : commify(my.data.score) + " / " + commify(goal) + " [" + gls + "%]");
		else $(".my-gauge-text").html(jl ? commify(my.data.score) + " / " + commify(goal) + " [" + gls + "%]" : commify(my.data.score-prev) + " / " + commify(goal-prev) + " [" + gls + "%]")
		/*$exl = $(".my-gauge-text");
		$exl.append($("<div>").addClass("expl").html('TEST'));
		global.expl($exl);*/
	}catch(e){
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
	if($data.opts.su){
		arr = [];
		for(i in $data.users){
			len++;
			arr.push($data.users[i]);
		}
		arr.sort(function(a, b){ return b.data.score - a.data.score; });
		refresh = true;
	}else{
		/*arr = $data.users;
		
		for(i in $data.users) len++;*/
		arr = [];
		for(i in $data.users){
			len++;
			arr.push($data.users[i]);
		}
		arr.sort(function(a, b){ if(a.nickname > b.nickname) return 1; if(b.nickname > a.nickname) return -1; return 0; });
		refresh = true;
	}
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
	.append($("<div>").addClass("rooms-number").html(zeroPadding(o.id, 3)))
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
	if(!o.gaming && !gmroom && !wuroom) $R.addClass("rooms-waiting");
	if(o.gaming && !gmroom && !wuroom) $R.addClass("rooms-gaming");
	if(o.password) $R.addClass("rooms-locked");
	if(!o.gaming && gmroom && !wuroom) $R.addClass("rooms-waiting-gm");
	if(o.gaming && gmroom && !wuroom) $R.addClass("rooms-gaming-gm");
	if(o.gaming && wuroom && !gmroom) $R.addClass("rooms-gaming-wu");
	if(!o.gaming && wuroom && !gmroom) $R.addClass("rooms-waiting-wu");
	
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
		image: "/img/kkutu/robot.png"
	};
}
function updateRoom(gaming){
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
			if(!confirm(L['surePayback'] + commify(Math.round((item.cost || 0) * 0.2)) + L['ping'])) return;
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
			$("#en-image").css('background-image', "url(" + cdn + iImage(item) + ")");
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
				.css('background-image', "url(" + cdn + gd.image + ")")
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
						.css('background-image', "url(" + cdn + bd.image + ")")
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


	$stage.dialog.commFriends.empty();
	for(i in $data.friends){
		len++;
		memo = $data.friends[i];
		o = $data._friends[i] || {};
		p = ($data.users[i] || {}).profile;
		
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
	$("#CommunityDiag .dialog-title").html(L['communityText'] + " (" + len + " / 100)");
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
			$stage.dialog.profileHandover.show();
			$stage.dialog.profileWhisper.hide();
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
		if($data._replay){
			u = $rec.users[$data.room.players[i]] || $data.room.players[i];
		}else{
			u = $data.users[$data.room.players[i]] || $data.robots[$data.room.players[i].id];
		}
		u.game.score = 0;
		delete $data["_s"+$data.room.players[i]];
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
	playSound('game_start');
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
	playBGM($data.opts.bg);
}
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
		draw('current', Math.min(going, $data._result._boing), 0, $data._result.goal - $data._result.before);
		draw('bonus', Math.max(0, going - $data._result._boing), 0, $data._result.goal - $data._result.before);
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
				.append($("<div>").addClass("jt-image goods-image").css('background-image', "url(" + cdn + url + ")"))
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
				.append($("<div>").addClass("jt-image goods-image").css('background-image', "url(" + cdn + url + ")"))
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
				.append($("<div>").addClass("jt-image goods-image").css('background-image', "url(" + cdn + url + ")"))
				.append($("<div>").addClass("goods-title").html(iName(item._id, item)))
				.append($("<div>").addClass("goods-cost").html(commify(item.evtCost) + ' 코인'))
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
				.append($("<div>").addClass("jt-image goods-image").css('background-image', "url(" + cdn + url + ")"))
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
	$("#bef").text('현재 코인');
	$("#aft").text('이후 코인');
	var after = bef - $obj.evtCost;
	var $oj;
	var spt = L['surePurchase'];
	var i, ceq = {};
	
	if($data.box) if($data.box[id]) spt = L['alreadyGot'] + " " + spt;
	//showDialog($stage.dialog.purchase, true);
	$("#purchase-ping-before").html(commify(bef) + ' 코인');
	$("#purchase-ping-cost").html(commify($obj.evtCost) + ' 코인');
	$("#purchase-item-name").html(L[id][0]);
	$oj = $("#purchase-ping-after").html(commify(after) + ' 코인');
	$("#purchase-item-desc").html((after < 0) ? '코인이 부족합니다.' : spt);
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
				
				playSound(snd);
				if($l.html() == $data.mission){
					if(!$data.opts.ms) playSound('mission');
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
				playSound(ta);
				if(t == $data.mission){
					if(!$data.opts.ms) playSound('mission');
					j = opts.declag ? t + j : "<label style='color: #66FF66;'>" + t + "</label>" + j;
				}else{
					j = t + j;
				}
				$stage.game.display.html(j);
			}, Number(i) * sg / len, text[len - i - 1]);
		}
		else for(i=0; i<len; i++){
			addTimeout(function(t){
				playSound(ta);
				if(t == $data.mission){
					if(!$data.opts.ms) playSound('mission');
					j += opts.declag ? t : "<label style='color: #66FF66;'>" + t + "</label>";
				}else{
					j += t;
				}
				$stage.game.display.html(j);
			}, Number(i) * sg / len, text[i]);
		}
	}
	addTimeout(function(){
		for(i=0; i<3; i++){
			addTimeout(function(v){
				if(isKKT){
					if(v == 1) return;
					else playSound('kung');
				}
				(beat ? $stage.game.display.children(".display-text") : $stage.game.display)
					.css('font-size', 21)
					.animate({ 'font-size': 20 }, tick);
			}, i * tick * 2, i);
		}
		addTimeout(pushHistory, tick * 4, text, mean, theme, wc);
		if(!isKKT) playSound(kkt);
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
	if(equip) if(equip["STY"] === "b1_gm") return getImage("/img/kkutu/lv/lv_gm.png");
	//if(iAdmin) return getImage("/img/kkutu/lv/lv_gm.png");
	return getImage("/img/kkutu/lv/lv" + zeroPadding(lv, 4) + ".png");
	
	/*return $("<div>").css({
		'float': "left",
		'background-image': "url('/img/kkutu/lv/newlv.png')",
		'background-position': lX + "% " + lY + "%",
		'background-size': "2560%"
	});*/
	
}
function getPImage(score){
	//var lv = getLevel(score) - 1;
	var lv = getPL(score);
	//if(iAdmin) return getImage("/img/kkutu/lv/lv_gm.png");
	return getImage("/img/kkutu/lv/lv" + zeroPadding(lv, 4) + ".png");
	//저 lv부분이 lv+1이었으나 lv 선언시 -1을 없애면서 lv로 설정
	
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
	var msk = String(zeroPadding(room.id, 3));
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
function loadSounds(list, callback){
	$data._lsRemain = list.length;
	
	list.forEach(function(v){
		getAudio(v.key, v.value, callback);
	});
}
function getAudio(k, url, cb){
	var req = new XMLHttpRequest();
	
	req.open("GET", /*($data.PUBLIC ? "http://jjo.kr" : "") +*/ url);
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
		if(--$data._lsRemain == 0){
			if(cb) cb();
		}else loading(L['loadRemain'] + $data._lsRemain);
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
function playBGM(key, force){
	if($data.bgm) $data.bgm.stop();
	return $data.bgm = playSound(key, true);
}
function stopBGM(){
	if($data.bgm){
		$data.bgm.stop();
		delete $data.bgm;
	}
}
function Keyword(key, mute){
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
function Mention(key, mute){
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
function playSound(key, loop, bgms){
	var src, sound;
	var mute = (loop && $data.muteBGM) || (!loop && $data.muteEff);
	var mb = loop || false;
	if(!bgms) var bgms = false;
	
	sound = $sound[key] || $sound.missing;
	if(window.hasOwnProperty("AudioBuffer") && sound instanceof AudioBuffer){
		src = audioContext.createBufferSource();
		src.startedAt = audioContext.currentTime;
		src.loop = loop;
		if(mute){
			src.buffer = audioContext.createBuffer(2, sound.length, audioContext.sampleRate);
		}else{
			src.buffer = sound;
		}
		src.connect(audioContext.destination);
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
	
	return src;
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
	var equip = $data.users[profile.id] ? $data.users[profile.id].equip : {};
	var $bar, $msg, $item;
	var link;
	var dt, bt, ut, it, kt;
	var gst;
	try{
		var nicknm = $data.users[profile.id].nickname;
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
				Mention('success', $data.opts.mc);
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
				Mention('success', $data.opts.mc);
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
							Keyword('success', $data.opts.kw);
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
							Keyword('success', $data.opts.kw);
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

	addonNickname($bar, { equip: equip }, spec);
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
	if(obj._id == 'dizzy_rainbow' && $data.opts.dz) return "/img/kkutu/moremi/back/def.png";
	if(obj.group.slice(0, 3) == "BDG") return "/img/kkutu/moremi/badge/" + obj._id + gif;
	return (obj.group.charAt(0) == 'M')
		? "/img/kkutu/moremi/" + obj.group.slice(1) + "/" + obj._id + gif
		: "/img/kkutu/shop/" + obj._id + gif;
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
	$("#obtain-image").css('background-image', "url(" + cdn + iImage(data.key) + ")");
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
		.attr('src', equip.robot ? "/img/kkutu/moremi/robot.png" : iImage(equip['Mskin'], 'Mskin'))
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

delete window.WebSocket;
delete window.setInterval;