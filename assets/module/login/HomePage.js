let GameData = require("GameData");
let UIMgr = require("UIMgr");
let GameLocalStorage = require("GameLocalStorage");
let Observer = require("Observer");
let WxApi = require("WxApi");
let BKTools = require("BKTools");
require('ald-game');
cc.Class({
    extends: Observer,

    properties: {
        playerHead: {displayName: "玩家头像", default: null, type: cc.Sprite},
        playerName: {displayName: "玩家名字", default: null, type: cc.Label},
        playerGold: {displayName: "玩家金币", default: null, type: cc.Label},

        setting: {displayName: "设置预制", default: null, type: cc.Prefab},
        levelList: {displayName: "段位列表", default: null, type: cc.Node},
        getGold: {displayName: "获取金币小妙招", default: null, type: cc.Prefab},

        addNode: {displayName: "添加子节点", default: null, type: cc.Node},
        bgNode: {displayName: "主页节点", default: null, type: cc.Node},

        //将要跳转的游戏
        directGameContent: {displayName: "跳转游戏", default: null, type: cc.Node},
        directGameItem: {displayName: "跳转游戏item", default: null, type: cc.Prefab},

        matching: {displayName: "匹配界面", default: null, type: cc.Prefab},
        levelAward: {displayName: "段位礼包", default: null, type: cc.Prefab},
    },

    onLoad() {

        /**
         * 由于游戏场景跳转 需要从主页面跳转到 homePage页面  个别子页面需要重新设置
         */
        if (GameMsgGlobal.sceneDirect.HomePageDirect === "matching") {//显示匹配页面
            //this.onBtnClickStartGame();
            this._matching();
        } else if (GameMsgGlobal.sceneDirect.HomePageDirect === "levelList") {//显示二级页面
            this._initPage();
            this._initMsg();
            this.onBtnClickStartGame();
        } else {
            console.log("");
            this._initMsg();
            this._setDayAward();
            this._loadGameList();
            this._authorAuthentication();
        }
        if (cc.sys.isBrowser) {
            this._initPage();
        }else if(cc.sys.platform==cc.sys.QQ_PLAY){
            this._initPage();
        }
    },
    _getMsgList() {
        return [
            GameMsgGlobal.gameLoginScene.addGold_watchVideo,
            GameMsgGlobal.gameReady_loading.enterLoginScene,
            GameMsgGlobal.gameLoginScene.startMatching,
            GameMsgGlobal.gameLoginScene.refreshLevelList
        ];
    },
    _onMsg(msg, data) {
        if (msg === GameMsgGlobal.gameLoginScene.addGold_watchVideo) {
            this.playerGold.string = GameData.playInfo.gold;
        } else if (msg === GameMsgGlobal.gameReady_loading.enterLoginScene) {
            this._initPage();
        } else if (msg === GameMsgGlobal.gameLoginScene.startMatching) {
            this._matching();
        } else if (msg === GameMsgGlobal.gameLoginScene.refreshLevelList) {
            //刷新段位列表
            this.playerGold.string = GameData.playInfo.gold ? GameData.playInfo.gold : 0;
            this.levelList.active = false;
            this.levelList.active = true;
        }
    },
    //进入到匹配页面
    _matching() {
        this.bgNode.active = false;
        this.addNode.removeAllChildren();
        UIMgr.createPrefab(this.matching, function (root, ui) {
            this.addNode.addChild(root);
        }.bind(this));
    },


    //授权认证
    _authorAuthentication() {
        let uid = GameLocalStorage.getUid();
        if (uid) {
            GameData.getLevelAwardAndPerLevelNum();
            //初始化页面数据
            this._initPage();
        } else {
            //开始授权操作
            WxApi.createUserInfoButtonAndBindTap();
        }
    },
    //每日登陆奖励
    _setDayAward() {
        let currentDate = new Date().toLocaleDateString();
        let loginTime = GameLocalStorage.getLoginTime();
        if (!loginTime || loginTime !== currentDate) {
            //重置  说明是新的一天
            GameLocalStorage.setLoginTime(currentDate);

            //发送请求
            let url = "https://gather.51weiwan.com/xxl/game/goldAdd";
            let sendData = {
                user_id: GameData.playInfo.uid,
            };
            let sucFun = res => {
                if (res.data.errno === 0) {//返回结果正确
                    GameData.playInfo.gold = res.data.data.gold;
                }
            };
            WxApi.wx_request(url, sendData, sucFun);
        }
    },
    //获取用户金币
    _addGold_watchVideo() {
        let url = "https://gather.51weiwan.com/api/user/gold";
        let sendData = {
            user_id: GameData.playInfo.uid,
        };
        let sucFun = res => {
            GameData.playInfo.gold = res.data.data.gold;
            this.playerGold.string = GameData.playInfo.gold;
        };
        WxApi.wx_request(url, sendData, sucFun);
    },
    //开始游戏
    onBtnClickStartGame() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.hide();
        }
        this.bgNode.active = false;
        this.levelList.active = true;
    },
    //返回大厅
    onBtnClickBack() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.show();
        }
        this._loadGameList();
        this.bgNode.active = true;
        this.levelList.active = false;
    },
    //排行榜
    onBtnClickRankList() {
        cc.director.loadScene("RankList");
    },
    //设置
    onBtnClickSetting() {
        this.addNode.removeAllChildren();
        UIMgr.createPrefab(this.setting, function (root, ui) {
            this.addNode.addChild(root);
        }.bind(this));
    },
    //点击首页的+号  获取金币
    onBtnClickGetGold() {
        this.addNode.removeAllChildren();
        UIMgr.createPrefab(this.getGold, function (root, ui) {
            this.addNode.addChild(root);
        }.bind(this));
    },
    //初始化页面数据
    _initPage() {
        //加载底部的banner广告
        if (!GameData.gameConfigInfo.bannerAd) {
            WxApi.wx_setBannerInfo();
        }
        //监听分享
        let defaultTitle = "万圣节大逃亡，只有我一人活着出来！";
        if (window.wx) {
            WxApi.wx_showShareMenu(GameData.gameConfigInfo.share[5], defaultTitle);
            let remoteUrl = GameData.playInfo.avatarUrl;
            WxApi.wx_createImage(remoteUrl, this.playerHead.node);
            this.playerName.string = GameData.playInfo.nickName;

        }else if(cc.sys.platform==cc.sys.QQ_PLAY){
            BKTools.getHead(this.playerHead.node);
            let that=this;
            BKTools.getNick(function (openId, nick) {
                GameData.playInfo.nickName=nick;
                that.playerName.string = nick;
            });
        }
        this.playerGold.string = GameData.playInfo.gold ? GameData.playInfo.gold : 0;
        //this.gameMoney.string = GameData.playInfo.gameMoney ? GameData.playInfo.gameMoney : 0;
    },
    //加载跳转游戏的item
    _loadGameList() {
        this.directGameContent.removeAllChildren();
        for (let i = 1; i < 7; i++) {
            let directGameItem = cc.instantiate(this.directGameItem);
            let script = directGameItem.getComponent("DirectGameItem");
            if (script) {
                script.setItemData(i);
            }
            this.directGameContent.addChild(directGameItem);
        }
    },
    //好友对战
    onBtnClickFriendPk() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.hide();
        }
        cc.director.loadScene('InviteFriend');
    },

});
