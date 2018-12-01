let GameLocalStorage = require("GameLocalStorage");
let GameData = require("GameData");
let JsonFileCfg = require("JsonFileCfg");
let AudioMgr = require("AudioMgr");
let Wx_netSocketMgr = require("Wx_netSocketMgr");
let Observer = require("Observer");
let GameReady = require("GameReady");
let WxApi = require("WxApi");
let NetUtils=require("NetUtils");
let BKTools=require('BKTools');
cc.Class({
    extends: Observer,
    properties: {
        progressBr: {displayName: "进度条", default: null, type: cc.ProgressBar},
        bg: {displayName: "背景图", default: null, type: cc.Node},
        logoImg: {displayName: "背景图纹理", default: null, type: cc.Sprite},
    },
    onLoad() {
        GameLocalStorage.initLocalStorage();
        this._initMsg();
        //GameReady.getLaunchParam();
        cc.director.preloadScene("HomePage");
        cc.director.preloadScene("RankList");

        //浏览器测试
        if (cc.sys.isBrowser) {
            this.bg.active = true;
            this._enterGame();
        }else if(cc.sys.platform==cc.sys.QQ_PLAY){
            console.log("进入到qq玩一玩里面");

            this._defaultQQPlayLogin();
            this._directScene();
        }
    },

    //默认登陆
    _defaultQQPlayLogin(){

        if (cc.sys.platform==cc.sys.QQ_PLAY) {
            BKTools.getNick(function (openId, nick) {
                GameData.playInfo.nickName=nick;
            });

            let url='http://s.51weiwan.com/api/login/index';
            let sendData = {
                    openId:GameStatusInfo.openId,
                    sex:GameStatusInfo.sex,
                    game_id: GameStatusInfo.gameId,
            };
            let callBack=(statusCode,res)  =>{
                if(res.data.errno==0){
                    GameData.playInfo.gold=res.data.data.gold;
                    GameData.playInfo.uid=res.data.data.uid;
                }else{
                    console.log("怪兽消消乐登陆返回结果错误，错误码为",statusCode);
                }

            };
            //发送请求
            NetUtils.post(url,sendData,callBack);
        }


    },
    _getMsgList() {
        return [
            GameMsgGlobal.gameReady_loading.direct,
            GameMsgGlobal.gameReady_loading.enterGame,
            GameMsgGlobal.gameReady_loading.enterLoginScene,
        ];
    },

    _onMsg(msg, data) {
        if (msg === GameMsgGlobal.gameReady_loading.enterGame) {
            //执行正常的游戏逻辑
            this.bg.active = true;
            this._enterGame();
        } else if (msg === GameMsgGlobal.gameReady_loading.enterLoginScene) {
            console.log("loading  ->");
            this._directScene();
        }
    },
    //进入到游戏中  只有接收到消息才能进入到此步骤中
    _enterGame() {
        //判断本地内存中 是否存在uid
        let uid = GameLocalStorage.getUid();
        console.log("[Loading] 本地内存中的uid", uid);
        if (uid) {
            console.log("本地内存中存在uid");
            GameData.playInfo.uid = uid;
            GameData.getGameConfig();
        } else {
            console.log("本地内存中不存在uid");
            this._directScene();
        }
    },
    //登陆进游戏
    _directScene() {
        console.log("开始进入到主页");
        //开启游戏初始化相关操作
        AudioMgr.playMainMusic();
        JsonFileCfg.initJson();
        //场景跳转
        let enterGameStyle = GameData.gameConfigInfo.launchQueryEnterStyle;
        if (enterGameStyle === "invitePk") {
            Wx_netSocketMgr.init();
            this._loadHomePageScene("InviteFriend", function () {
                cc.director.loadScene("InviteFriend");
            })
        } else {
            GameMsgGlobal.sceneDirect.HomePageDirect = "";
            //添加计时器   由于 JsonFileCfg.initJson(); 是异步过程  导致程序进入到 HomePage 中  获取json数据 会报错
            this.scheduleOnce(function () {
                this._loadHomePageScene("HomePage", function () {
                    cc.director.loadScene("HomePage");
                });
            }.bind(this), 1.5);
        }
    },
    _loadHomePageScene(sceneName, onLoaded) {
        let info = cc.director._getSceneUuid(sceneName);
        if (info) {
            cc.loader.load({uuid: info.uuid, type: 'uuid'},
                (completedCount, totalCount, item) => {
                    let loadingProgress = (completedCount / totalCount * 100);
                    this.progressBr.progress = loadingProgress / 100;
                }, function (error, asset) {
                    if (error) {
                    }
                    if (onLoaded) {
                        onLoaded(error, asset);
                    }
                });
        }
        else {
            onLoaded(new Error());
        }
    },
});
