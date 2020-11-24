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

var GLOBAL = require("./sub/global.json");
exports.KKUTU_MAX_SERVER = [60, 30, 30];
exports.KKUTU_MAX = 50;
exports.MAIN_PORTS = GLOBAL.MAIN_PORTS;
exports.TEST_PORT = 4040;
exports.SPAM_CLEAR_DELAY = 200;
exports.SPAM_ADD_DELAY = 350;
exports.SPAM_LIMIT = 20;
exports.BLOCKED_LENGTH = 20000;
exports.KICK_BY_SPAM = 25;
exports.MAX_OBSERVER = 4;
exports.TESTER = GLOBAL.ADMIN.concat([
	"Input tester id here",
	"117997976560534863706"
]);
exports.IS_SECURED = GLOBAL.IS_SECURED;
exports.SSL_OPTIONS = GLOBAL.SSL_OPTIONS;
exports.OPTIONS = {
	'man': { name: "Manner" },
	'ext': { name: "Injeong" },
	'mis': { name: "Mission" },
	'loa': { name: "Loanword" },
	'prv': { name: "Proverb" },
	'str': { name: "Strict" },
	'k32': { name: "Sami" },
	'no2': { name: "No2" },
	'rtl': { name: "Return" },
	'ptr': { name: "Protect" },
	'ift': { name: "Inftime" },
	'ssg': { name: "Sbsg" },
	'slt': { name: "Sblt" },
	'sl1': { name: "Sbl1" },
	'shk': { name: "Sbhk" },
	'csd': { name: "Consider" },
	'meb': { name: "Exitblock" },
	'sht': { name: "Short" },
	'ulm': { name: "Unlimited" },
	'dsa': { name: "Dongsa" },
	'vbl': { name: "Vblock" },
	'hax': { name: "Hack" },
	'spc': { name: "Spacewd" },
	'spw': { name: "Specwd" },
	'scb': { name: "Scboost" },
	'dlg': { name: "Declag" },
	'rln': { name: "Rrlanner" }, // rrlanner = 매너
	'stl': { name: "Stlong" },
	'lts': { name: "Ltshrt" },
	'rgo': { name: "Rightgo" },
	'fst': { name: "Faster" },
	'arc': { name: "GameConn" }
};
exports.MOREMI_PART = [ 'back', 'skin', 'eye', 'eyeacc', 'facc', 'mouth', 'shoes', 'clothes', 'hair', 'head', 'lhand', 'rhand', 'front' ];
exports.CATEGORIES = [ "all", "spec", "skin", "badge", "head", "eye", "acc", "mouth", "clothes", "hs", "back" ];
exports.AVAIL_EQUIP = [
	"NIK", "BDG1", "BDG2", "BDG3", "BDG4", "Mhair",
	"Mskin", "Mhead", "Meye", "Meyeacc", "Mfacc", "Mmouth", "Mhand", "Mclothes", "Mshoes", "Mback", "CHT", "STY", "EXP"
];
exports.GROUPS = {
	'spec': [ "PIX", "PIY", "PIZ", "CNS", "EVT", "CHT", "STY", "EXP" ],
	'skin': [ "NIK", "Mskin" ],
	'badge': [ "BDG1", "BDG2", "BDG3", "BDG4" ],
	'head': [ "Mhair" ],
	'eye': [ "Meye" ],
	'acc': [ "Meyeacc", "Mfacc", "Mhead" ],
	'mouth': [ "Mmouth" ],
	'clothes': [ "Mclothes" ],
	'hs': [ "Mhand", "Mshoes" ],
	'back': [ "Mback", "Mfront" ]
};
exports.RULE = {
/*
	유형: { lang: 언어,
		rule: 이름,
		opts: [ 추가 규칙 ],
		time: 시간 상수,
		ai: AI 가능?,
		big: 큰 화면?,
		ewq: 현재 턴 나가면 라운드 종료?
	}
*/
	'EKT': { lang: "en",
		rule: "Classic",
		opts: [ "man", "ext", "mis", "rtl", "ptr", "meb", "vbl", "ift", "hax", "spc", "spw" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'ESH': { lang: "en",
		rule: "Classic",
		opts: [ "ext", "mis", "rtl", "meb", "vbl", "ift", "hax", "spc", "spw" , "arc", "fst" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KKT': { lang: "ko",
		rule: "Classic",
		opts: [ "man", "ext", "mis", "loa", "str", "k32", "rtl", "ptr", "dsa", "meb", "ift", "hax" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KSH': { lang: "ko",
		rule: "Classic",
		opts: [ "man", "csd", "ext", "mis", "loa", "str", "rtl", "ptr", "dsa", "meb", "vbl", "ift", "hax" , "arc", "fst" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'CSQ': { lang: "ko",
		rule: "Jaqwi",
		opts: [ "meb", "ijp" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: false
	},
	'KCW': { lang: "ko",
		rule: "Crossword",
		opts: [ , "arc" ],
		time: 2,
		ai: false,
		big: true,
		ewq: false
	},
	'KTY': { lang: "ko",
		rule: "Typing",
		opts: [ "meb", "prv", "hax" , "arc" ],
		time: 1,
		ai: false,
		big: false,
		ewq: false
	},
	'ETY': { lang: "en",
		rule: "Typing",
		opts: [ "meb", "hax" , "arc" ],
		time: 1,
		ai: false,
		big: false,
		ewq: false
	},
	'KAP': { lang: "ko",
		rule: "Classic",
		opts: [ "man", "ext", "mis", "loa", "str", "ptr", "dsa", "meb", "vbl", "ift", "hax" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		_back: true,
		ewq: true
	},
	'HUN': { lang: "ko",
		rule: "Hunmin",
		opts: [ "ext", "mis", "loa", "str", "meb", "hax" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KDA': { lang: "ko",
		rule: "Daneo",
		opts: [ "ijp", "mis", "rtl", "ift", "vbl", "meb", "hax", "scb", "stl", "lts", "rgo" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'EDA': { lang: "en",
		rule: "Daneo",
		opts: [ "ijp", "mis", "rtl", "ift", "vbl", "meb", "hax", "scb", "stl", "lts", "rgo" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KSS': { lang: "ko",
		rule: "Sock",
		opts: [ "no2", "meb" , "arc" ],
		time: 1,
		ai: false,
		big: true,
		ewq: false
	},
	'ESS': { lang: "en",
		rule: "Sock",
		opts: [ "no2", "meb" , "arc" ],
		time: 1,
		ai: false,
		big: true,
		ewq: false
	},
	'KAD': { lang: "ko",
		rule: "allDaneo",
		opts: [ "mis", "rtl", "meb", "vbl", "ift", "hax", "rgo" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'EAD': { lang: "en",
		rule: "allDaneo",
		opts: [ "mis", "rtl", "meb", "vbl", "ift", "hax", "rgo" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KAW': { lang: "ko",
		rule: "All",
		opts: [ "mis", "rtl", "meb", "ift", "slt", "ssg", "sl1", "shk", "vbl", "hax", "scb", "dlg", "rgo", "fst" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'EAW': { lang: "en",
		rule: "All",
		opts: [ "mis", "rtl", "meb", "ift", "slt", "ssg", "sl1", "shk", "vbl", "hax", "scb", "dlg", "rgo", "fst" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KMT': { lang: "ko",
		rule: "Classic",
		opts: [ "man", "ext", "mis", "rtl", "ptr", "meb", "ift", "vbl", "hax" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KEA': { lang: "ko",
		rule: "keAll",
		opts: [ "mis", "rtl", "meb", "ift", "vbl", "hax", "rgo" , "arc" ],
		time: 1,
		ai: false,
		big: false,
		ewq: true
	},
	'EKD': { lang: "en",
		rule: "Classic",
		opts: [ "ext", "mis", "k32", "rtl", "meb", "ift", "hax" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		_back: true,
		ewq: true
	},
	'KDG': { lang: "ko",
		rule: "Drawing",
		opts: [ "ijp", "sht", "ulm" , "arc" ],
		time: 1,
		ai: false,
		big: true,
		ewq: true
	},
	'EDG': { lang: "en",
		rule: "Drawing",
		opts: [ "ijp", "sht", "ulm" , "arc" ],
		time: 1,
		ai: false,
		big: true,
		ewq: true
	},
	'EAP': { lang: "en",
		rule: "Classic",
		opts: [ "ext", "mis", "rtl", "meb", "vbl", "ift", "hax", "spc" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KJH': { lang: "ko",
		rule: "Jycls",
		opts: [ "mis", "rtl", "ift", "meb", "vbl", "dsa", "rln" , "arc", "hax" ],
		time: 1,
		ai: false,
		big: false,
		ewq: true
	},
	'EJH': { lang: "en",
		rule: "Jycls",
		opts: [ "mis", "rtl", "ift", "meb", "vbl", "rln" , "arc", "hax" ],
		time: 1,
		ai: false,
		big: false,
		ewq: true
	},
	'KGT': { lang: "ko",
		rule: "Classic",
		opts: [ "man", "ext", "mis", "loa", "str", "rtl", "ptr", "dsa", "meb", "vbl", "ift", "hax" , "arc" ],
		time: 1,
		ai: true,
		big: false,
		ewq: true
	},
	'KTT': { lang: "ko",
		rule: "Typing",
		opts: [ "ijp", "meb", "hax" , "arc" ],
		time: 1,
		ai: false,
		big: false,
		ewq: false
	},
	'ETT': { lang: "en",
		rule: "Typing",
		opts: [ "ijp", "meb", "hax" , "arc" ],
		time: 1,
		ai: false,
		big: false,
		ewq: false
	},
	'TAK': { lang : "ko",
		rule: "Classic",
		opts: [],
		time: 1,
		ai: true,
		big: false,
		ewq: false
	}
};
exports.getPreScore = function(text, chain, tr){
	var CL = (chain || []).length;
	if(CL>30) CL=30+((CL-30)/2);
	if(CL>90) CL=90+((CL-90)/5);
	if(CL>150) CL=150+((CL-150)/7.5);
	var tlen = (text || " ").length;
	//if(tlen>200) tlen = 200 + Math.floor((tlen-200)/10);
	if(tlen>50) tlen=50+((tlen-50)/3);
	return 2 * (Math.pow(5 + 7 * tlen, 0.74) + 0.88 * CL * ( 0.5 + 0.5 * tr ));
};
exports.getPenalty = function(chain, score){
	return -1 * Math.round(Math.min(10 + (chain || []).length * 2.1 + score * 0.15, score));
};
exports.GAME_TYPE = Object.keys(exports.RULE);
exports.EXAMPLE_TITLE = {
	'ko': "가나다라마바사아자차카타파하고노도로모소보오조초코토포호교뇨됴료묘뵤쇼요죠쵸쿄툐표효",
	'en': "abcdefghijhijklmnopqrstuvwxyz"
};
exports.INIT_SOUNDS = [ "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ" ];
exports.MISSION_ko = [ "가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하" ];
exports.MISSION_en = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z" ];

exports.KO_INJEONG = [
	"IMS", "VOC", "KRR", "KTV",
	"NSK", "KOT", "DOT", "DRR", "DGM", "RAG", "LVL",
	"LOL", "MRN", "MMM", "MAP", "MKK", "MNG",
	"HYK", "CYP", "HRH", "STA", "OIJ",
	"KGR", "ESB", "ELW", "OIM", "OVW", /*"WOW",*/
	"YRY", "KPO", "JLN", "JAN", "ZEL", "POK", "HAI",
	"HSS", "KMV", "WMV", "HDC", "HOS", "PFL", "SBK", "CKR", "BUS",
	"MCP", "KTR", "COV", "DBG", "WBT", "SCH", "BRW", "PRV", "JOB", "KPS",
	"KYT", "MPE", "ONE", "DOR", "ZBH", "CLY", "MCM", "BTR", "BSI", "MFF", "ACV",
	"ARP", "KRD", "JPT", "NKT", "PBC", "YKW", "GAM", "NFL", "SVN", "MDM"
];
exports.EN_INJEONG = [
	"LOL", "PRV", "MCP"
];
exports.KO_THEME = [
	"30", "40", "60", "80", "90",
	"140", "150", "160", "170", "190",
	"220", "230", "240", "270", "310",
	"320", "350", "360", "420", "430",
	"450", "490", "530", "1001"
];
exports.EN_THEME = [
	"e05", "e08", "e10", "e12", "e13", "e15",
	"e18", "e20", "e43"
];
exports.IJP_EXCEPT = [
	/*"OIJ"*/"VOC", "DRR", "MKK", "HYK", "HRH", "OIM", "YRY"
];
exports.KO_IJP = exports.KO_INJEONG.concat(exports.KO_THEME).filter(function(item){ return !exports.IJP_EXCEPT.includes(item); });
exports.EN_IJP = exports.EN_INJEONG.concat(exports.EN_THEME).filter(function(item){ return !exports.IJP_EXCEPT.includes(item); });
exports.REGION = {
	'en': "en",
	'ko': "kr"
};
exports.KOR_STRICT = /(^|,)(1|INJEONG)($|,)/;
exports.KOR_GROUP = new RegExp("(,|^)(" + [
	"0", "1", "3", "7", "8", "11", "9",
	"16", "15", "17", "2", "18", "20", "26", "19",
	"INJEONG"
].join('|') + ")(,|$)");
exports.ENG_ID = /^[a-z]+$/i;
exports.KOR_FLAG = {
	LOANWORD: 1, // 외래어
	INJEONG: 2,	// 어인정
	SPACED: 4, // 띄어쓰기를 해야 하는 어휘
	SATURI: 8, // 방언
	OLD: 16, // 옛말
	MUNHWA: 32 // 문화어
};
exports.WP_REWARD = function(){
	return 10 + Math.floor(Math.random() * 91);
};
exports.getRule = function(mode){
	return exports.RULE[exports.GAME_TYPE[mode]];
};
