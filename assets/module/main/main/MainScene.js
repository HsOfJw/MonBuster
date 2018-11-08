let GameData = require("GameData");
let GameScheduleData = require("GameScheduleData");
let JsonFileMgr = require("JsonFileMgr");
let Observer = require("Observer");
let WxApi = require("WxApi");
let UIMgr = require("UIMgr");

cc.Class({
    extends: Observer,
    properties: {
        myHead: {displayName: "自己头像", default: null, type: cc.Sprite},
        myName: {displayName: "自己昵称", default: null, type: cc.Label},


        yourHead: {displayName: "对方头像", default: null, type: cc.Sprite},
        yourName: {displayName: "对方昵称", default: null, type: cc.Label},

        mainSceneNode: {displayName: "主游戏内容节点", default: null, type: cc.Node},
        assistLine: {displayName: "辅助线", default: null, type: cc.Node},
        assistYourHead: {displayName: "辅助线上的头像", default: null, type: cc.Sprite},

        addNode: {displayName: "添加节点", default: null, type: cc.Node},

        //游戏结束  AI
        victoryLayer: {displayName: "胜利页面", default: null, type: cc.Prefab},
        failLayer: {displayName: "失败页面", default: null, type: cc.Prefab},

        //游戏结束 Friend
        victoryLayer_pk: {displayName: "好友对战胜利页面", default: null, type: cc.Prefab},
        failLayer_pk: {displayName: "好友对战失败页面", default: null, type: cc.Prefab},
    },

    onLoad() {
        //开启碰撞组件
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        this._initMainScenePageData();
        this._initGameScheduleData();
        this._initMsg();
        cc.game.setFrameRate(60);//游戏帧率设为60
    },
    _getMsgList() {
        return [
            GameMsgGlobal.mainScene.victoryLayer,
            GameMsgGlobal.mainScene.failLayer,

            "opponent_gameOver",//游戏结束
        ];
    },
    _onMsg(msg, data) {
        if (msg === "opponent_gameOver") {
            this._opponent_gameOver();
        } else if (msg === GameMsgGlobal.mainScene.victoryLayer) {
            this._loadVictoryLayer();
        } else if (msg === GameMsgGlobal.mainScene.failLayer) {
            this._loadFailLayer();
        }
    },
    //加载胜利页面
    _loadVictoryLayer() {
        this.addNode.removeAllChildren();
        let childrenLen = this.node.childrenCount+5;
        UIMgr.createPrefab(this.victoryLayer, function (root, ui) {
            this.addNode.addChild(root, childrenLen);
        }.bind(this));
    },
    //加载失败页面
    _loadFailLayer() {
        this.addNode.removeAllChildren();
        let childrenLen = this.node.childrenCount+5;
        UIMgr.createPrefab(this.failLayer, function (root, ui) {
            this.addNode.addChild(root, childrenLen);
        }.bind(this));
    },

    //对手游戏失败
    _opponent_gameOver() {
        //说明自己取得胜利
        cc.director.loadScene("FriendPk_victory");
    },
    //初始化页面数据
    _initMainScenePageData() {
        // 远程 url 带图片后缀名
        let remoteUrl = GameData.playInfo.avatarUrl;
        WxApi.wx_createImage(remoteUrl, this.myHead.node);
        this.myName.string = GameData.playInfo.nickName;

        //对方数据
        if (GameData.playInfo.friendPk_level !== 11) {
            let opponentRemoteUrl = GameData.gameConfigInfo.opponentInfo.avatarUrl;
            WxApi.wx_createImage(opponentRemoteUrl, this.yourHead.node);
            WxApi.wx_createImage(opponentRemoteUrl, this.assistYourHead.node);
            this.yourName.string = GameData.gameConfigInfo.opponentInfo.nickName ? GameData.gameConfigInfo.opponentInfo.nickName : "";
        } else {
            let opponentRemoteUrl = GameData.gameConfigInfo.opponentInfo.avatarUrl;
            WxApi.wx_createImage(opponentRemoteUrl, this.yourHead.node);
            WxApi.wx_createImage(opponentRemoteUrl, this.assistYourHead.node);
            this.yourName.string = GameData.gameConfigInfo.opponentInfo.nickName ? GameData.gameConfig.opponentInfo.nickName : "";
        }

    },
    //初始化掉落速度
    _initGameScheduleData() {
        let currentLevelDropSpeed = null;
        if (GameData.playInfo.friendPk_level === 11) {
            currentLevelDropSpeed = JsonFileMgr.getCurrentLevelDropSpeed(GameData.playInfo.friendPk_level);
        } else {
            currentLevelDropSpeed = JsonFileMgr.getCurrentLevelDropSpeed(GameData.playInfo.currentLevel);
        }
        if (currentLevelDropSpeed) {
            //初始值
            GameScheduleData.initDropSpeed = parseFloat(currentLevelDropSpeed.Speed);

            GameScheduleData.pumpkinDownDistance = GameScheduleData.setPumpDownDistance(GameScheduleData.initDropSpeed);
            //在间隔多少秒之后 速度的增量
            GameScheduleData.timeInterval_1 = currentLevelDropSpeed.Place1 ? parseFloat(currentLevelDropSpeed.Place1) : 0;
            GameScheduleData.addSpeed_1 = currentLevelDropSpeed.speedAdd1 ? parseFloat(currentLevelDropSpeed.speedAdd1) : 0;


            GameScheduleData.timeInterval_2 = currentLevelDropSpeed.Place2 ? parseFloat(currentLevelDropSpeed.Place2) : 0;
            GameScheduleData.addSpeed_2 = currentLevelDropSpeed.speedAdd2 ? parseFloat(currentLevelDropSpeed.speedAdd2) : 0;

            GameScheduleData.timeInterval_3 = currentLevelDropSpeed.Place3 ? parseFloat(currentLevelDropSpeed.Place3) : 0;
            GameScheduleData.addSpeed_3 = currentLevelDropSpeed.speedAdd3 ? parseFloat(currentLevelDropSpeed.speedAdd3) : 0;
            console.log("[MainScene] 初始化掉落速度 游戏数据为", GameScheduleData);
        } else {
            console.log("[MainScene] 根据玩家级别 设置南瓜掉落速度 取值失败");
        }
    },

});
