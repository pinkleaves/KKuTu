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

var ready = function ready(start, server){
	var i;
	if(start){
		$.post("/userinfo", function(res){
			if(res.error) console.log('Error occurred during logging!');
		});
		$.post("/flush", function(res){
		});
		$data.PUBLIC = $("#PUBLIC").html() == "true";
		$data.URL = $("#URL").html();
		$data.version = $("#version").html();
		/*try{
			$data.server = location.href.match(/\?.*s=(\d+)/)[1];
		}catch(e){
			$data.server = location.href.match(/\?.*server=(\d+)/)[1];
		}*/
		$data.server = $.cookie('server') || 0;
	}else{
		$data.server = server || $data.server;
	}
	document.title = L['title'] + ' - ' + L['server_' + $data.server ];
	if(start){
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
				renew: $("#RenewBtn"),
				vol: $("#VolumeBtn"),
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
					effClose: $("#ed-close"),
				pEvent: $("#pEventDiag"),
					peOK: $("#peventq-ok"),
					peRefresh: $("#pevent-refresh"),
				pServer: $("#pServerDiag"),
					pSvselect: $("#m-server"),
					pGo: $("#move-go"),
				pVolume:  $("#VolumeDiag"),
					pVolOK: $("#volume-ok")
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
		function loadLevel(){
			var n = 1051;
			var img = {};
			for(var i=0; i<n; i++){
				img[i] = new Image();
				var url = cdn + '/img/kkutu/lv/lv' + zeroPadding(i+1, 4) + '.png';
				//$(".jt-image my-stat-level").css('background-image', 'url(' + url + ')' );;
				img[i].src = url;
			}
		}
		if(!jl){
			$data._soundList = [
				{ key: "k", value: cdn + "/media/kkutu/k.mp3" },
				{ key: "lobby", value: cdn + "/media/kkutu/LobbyBGM.mp3" },
				{ key: "1st", value: cdn + "/media/kkutu/LobbyBGM_1st.mp3" },
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
			]
		}
		for(i=0; i<=10; i++) $data._soundList.push(
			{ key: "T"+i, value: cdn + "/media/kkutu/original/T"+i+".mp3" },
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
		$stage.menu.vol.on('click', function(e){
			showDialog($stage.dialog.pVolume);
		});
		$stage.dialog.pVolOK.on('click', function(e){
			$stage.dialog.pVolume.hide();
		});

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
			}
		}*/
	// 객체 설정
		/*addTimeout(function(){
			$("#intro-start").hide();
			$("#intro").show();
		}, 1400);*/
		$(document).on('paste', function(e){
			if($data.room) if($data.room.gaming){
				try{
					if($data.users[$data.id].game.form == "O" || $data.users[$data.id].game.form == "S"){
						
					}else{
						e.preventDefault();
						return false;
					}
				}catch(e){
					console.error(e.toString());
					e.preventDefault();
					return false;
				}
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
		$stage.dialog.pAlertOK.trigger('click');
		var pck = $.cookie('kks');
		if(pck && localStorage != undefined){
			var oa = JSON.parse(decodeURIComponent(pck));
			localStorage.setItem('kks', JSON.stringify(oa));
			sCK('kks', '{}', -1);
		}
		var mod = 1;
		if(localStorage == undefined){
			$data.opts = $.cookie('kks');
			mod = 1;
		}else{
			$data.opts = localStorage.getItem('kks');
			if($data.opts == null) $data.opts = false;
			mod = 2;
		}
		if(sessionStorage != undefined){
			try{
				var te = sessionStorage.getItem('room_opts');
				if(te){
					te = JSON.parse(te);
					$("#room-title").val(te.title);
					$("#room-limit").val(te.limit);
					$("#room-mode").val(te.mode);
					$("#room-round").val(te.round);
					$("#room-time").val(te.time);
					for(i in OPTIONS){
						k = OPTIONS[i].name.toLowerCase();
						$("#room-" + k).attr('checked', te.opts[k]);
					}
					var rule = RULE[MODE[$("#room-mode").val()]];
					if(rule.lang == "ko"){
						$data._ijkey = "#ko-pick-";
					}else if(rule.lang == "en"){
						$data._ijkey = "#en-pick-";
					}
					for(i in te.opts.injpick){
						$($data._ijkey + te.opts.injpick[i]).prop('checked', true);
					}
				}
			}catch(e){
			}
		}
		var uist = $.cookie('kkw');
		if(uist){
			sCK('kkw', uist, 7);
		}
		if($data.opts){
			if(mod == 1){
				applyOptions(JSON.parse(decodeURIComponent($data.opts)));
				sCK('kks', encodeURIComponent(JSON.stringify($data.opts)), 7);
			}else{
				if(JSON.parse($data.opts).pl) loadLevel();
				applyOptions(JSON.parse($data.opts));
			}
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
				nu: false,
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
				dt: false,
				pl: false,
				bs: 1,
			});
			if(mod == 1) sCK('kks', encodeURIComponent(JSON.stringify($data.opts)), 1.5);
			else localStorage.setItem('kks', JSON.stringify($data.opts));
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
			if(!$data.place){
				$data.rooms = {};
				var prim = $data.users[$data.id];
				$data.users = {};
				updateRoomList(true);
				updateUserList(true);
				loading('유저 / 방 목록을 불러오는 중...');
				send('renew');
			}
			//notice('오류로 인해 잠시 비활성화된 기능입니다.');
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
		$("#bgm-v").on('input', function(e){
			setVolume($("#bgm-v").val(), $("#eff-v").val());
		});
		$("#eff-v").on('input', function(e){
			setVolume($("#bgm-v").val(), $("#eff-v").val());
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
			return L['sureExit'];
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
		setStage($stage);
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
			}else send('rank', { id: false, pg: 0, tp: 'redis' });
				/*$.get("/ranking", function(res){
				drawLeaderboard(res);
				showDialog($stage.dialog.leaderboard);
			});*/
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
			/*var vall = $data._lbpage - 1;
			$.get("/ranking?p=" + ($data._lbpage - 1), function(res){
				drawLeaderboard(res, vall, 2);
			});*/
			send('rank', { id: false, pg: $data._lbpage - 1, tp: 'redis' });
		});
		$stage.dialog.lbMe.on('click', function(e){
			$(e.currentTarget).attr('disabled', true);
			/*$.get("/ranking?id=" + $data.id, function(res){
				drawLeaderboard(res, $data.id, 1);
			});*/
			send('rank', { id: $data.id, pg: false, tp: 'redis' });
		});
		$stage.dialog.lbNext.on('click', function(e){
			$(e.currentTarget).attr('disabled', true);
			/*var vall = $data._lbpage + 1;
			$.get("/ranking?p=" + ($data._lbpage + 1), function(res){
				drawLeaderboard(res, vall, 2);
			});*/
			send('rank', { id: false, pg: $data._lbpage + 1, tp: 'redis' });
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
		$("#pink-speed").keypress(function(e){
			e.preventDefault();
		}).keydown(function(e){
			if(e.keyCode == 8 || e.keyCode == 46) return false;
		});
		$("#pink-bgm").on('change', function(e){
			applyOptions(false, { bg: $(this).val() })
		});
		$("#pink-speed").on('input', function(){
			applyOptions(false, { bs: $(this).val() });
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
				nu: $("#sort-nick").is(":checked"),
				ow: $("#only-waiting").is(":checked"),
				ou: $("#only-unlock").is(":checked"),
				ml: $("#manlep-exp").is(":checked"),
				rq: $("#req-exp").is(":checked"),
				ms: $("#mis-sion").is(":checked"),
				//bw: $("#yok-seol").is(":checked"),
				bw: $data.opts.bw,
				jm: $("#jang-moon").is(":checked"),
				mc: $("#deny-mention").is(":checked"),
				dz: $("#dizzy-off").is(":checked"),
				rv: $("#reverse-room").is(":checked"),
				bg: $("#pink-bgm").val(),
				th: $("#pink-theme").val(),
				kw: $("#deny-keyword").is(":checked"),
				wd: $("#ka-word").is(":checked"),
				dt: $("#dt-gs").is(":checked"),
				pl: $("#pic-preload").is(":checked"),
				bs: $("#pink-speed").val(),
			});
			/*$.post("/cookie", { data: JSON.stringify($data.opts) }, function(res){
				if(res.error) console.log(res.error);
			});*/
			if(localStorage == undefined) sCK('kks', encodeURIComponent(JSON.stringify($data.opts)), 7);
			else localStorage.setItem('kks', JSON.stringify($data.opts));
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
		$stage.dialog.peOK.on('click', function(e){
			$stage.dialog.pEvent.hide();
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
			if(sessionStorage != undefined){
				sessionStorage.setItem('room_opts', JSON.stringify({
					title: $("#room-title").val().trim() || $("#room-title").attr('placeholder').trim(),
					limit: $("#room-limit").val(),
					mode: $("#room-mode").val(),
					round: $("#room-round").val(),
					time: $("#room-time").val(),
					opts: opts,
				}));
			}
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
			if($stage.dialog.pEvent.is(":visible")){
				$stage.dialog.pEvent.hide();
			}else getevtKey();
		});
		$stage.dialog.peRefresh.on('click', function(e){
			getevtKey();
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
			}
		});
		$('#sort-user').change(function(){
			if(this.checked){
				if($('#sort-nick').is(':checked')){
					$('#sort-nick').attr('checked', false);
				}
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
		//R_OPT [STL / LTS]
		$('#room-stlong').change(function(){
			if(this.checked){
				$('#room-ltshrt').attr('checked', false);
			}
		});
		$('#room-ltshrt').change(function(){
			if(this.checked){
				$('#room-stlong').attr('checked', false);
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
			if(kssv != '초기화') return pfAlert('올바르게 입력하지 않아 초기화가 취소되었습니다.');
			pfConfirm('초기화 후 즉시 <b>서버와의 접속이 종료</b>되며,<br>오늘의 접속 보상은 <b>다시 받을 수 없습니다</b>.<br>또한, 현재 계정의 정보는 <b>복구할 수 없습니다</b>.<br><br><b>정말로 초기화하시겠습니까?</b>', jsk, function(){  });
		}
		var ksk = function(){
			pfInput('계정을 초기화하시려면 아래에<br><b>초기화</b> 라고 입력해주세요.', fico, function(){  });
		}
		$stage.dialog.acReset.on('click', function(e){
			pfConfirm('정말로 계정을 초기화하시겠습니까?', ksk, function(){  });
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
			if(prq == "" || tnick.length > 16) return pfAlert(L['profileWrong']);
			$(e.currentTarget).attr('disabled', true);
			$.post("/exordial", { data: $("#dress-exordial").val() }, function(res){
				$stage.dialog.dressOK.attr('disabled', false);
				if(res.error) return fail(res.error);
				
				$stage.dialog.dress.hide();
				send('exordialc');
				$data.users[$data.id].exordial = $("#dress-exordial").val();
			});
			if(myn != jnick){
				nickChange(jnick);
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
					
					if($stage.dialog.dress.is(":visible")) drawMyDress($data._avGroup);
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
		$("#change-server").on('click', function(e){
			showDialog($stage.dialog.pServer);
			$("#ms-content").text('이동할 서버를 선택하세요.');
			$stage.dialog.pSvselect.val('default');
		});
		$stage.dialog.pGo.on('click', function(e){
			if($data.room) return pfAlert('게임 중에는 서버를 이동할 수 없습니다.');
			var target = $stage.dialog.pSvselect.val();
			if(target == $data.server || target == 'default') return;
			var port = [8080, 8090, 8100];
			$data.URL = $data.URL.replace(port[Number($data.server)], port[Number(target)]);
			movingServer();
			$stage.dialog.pServer.hide();
			clearAllChat();
			ws.close();
			sCK('server', target, 14)
			ready(false, target);
		});
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
	}
	// 웹소켓 연결
	if(!start) connect();
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
			if(!move){
				var ct = L['closed'] + " (#" + e.code + ")";
				
				if(rws) rws.close();
				stopAllSounds();
				if(!noPF) pfAlert(ct);
				var isWelcome = false;
				svAvail = false;
				/*$.get("/kkutu_notice.html", function(res){
					loading(res);
				});*/
				loading('<center>서버와의 연결이 끊어졌습니다!</center><center></center>'); 
				var count = 0;
				if(!noPF && !$data.guest) _setTimeout(function(){ if(count < 15){ if(!isWelcome) connect(); } }, 200);
			}else move = false;
		};
		ws.onerror = function(e){
			console.warn(L['error'], e);
		};
	}
}
$(document).ready(function(){
	ready(true);
});
var svAvail = true;
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