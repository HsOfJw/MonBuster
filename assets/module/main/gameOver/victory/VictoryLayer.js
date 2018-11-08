let GameData = require("GameData");
let Util = require("Util");
let UIMgr = require("UIMgr");
let AudioMgr = require("AudioMgr");
let JsonFileMgr = require("JsonFileMgr");
let AudioPlayer = require("AudioPlayer");
let Tips = require("Tips");
let WxApi = require("WxApi");
cc.Class({
    extends: cc.Component,

    properties: {
        playerHead: {displayName: "头像", default: null, type: cc.Sprite},
        playerName: {displayName: "玩家姓名", default: null, type: cc.Label},
        startContent: {displayName: "星星父节点", default: null, type: cc.Node},
        remainderNumLabel: {displayName: "除数", default: null, type: cc.Label},

        //Button
        RmRematch: {displayName: "再来一局", default: null, type: cc.Node},
        AcceptPrize: {displayName: "去领奖", default: null, type: cc.Node},

        //Prefab
        startPre: {displayName: "星级预制体", default: null, type: cc.Prefab},
        gradeUp: {displayName: "星级提升", default: null, type: cc.Prefab},
        addNode: {displayName: "添加节点", default: null, type: cc.Node},

        content: {displayName: "游戏列表父节点", default: null, type: cc.Node},
        directGameListItem: {displayName: "跳转游戏子节点", default: null, type: cc.Prefab},
    },

    onLoad() {
        this._hideLogView();
        this._initPage();
        this._loadGradeUp();
        //播放胜利音效
        AudioMgr.playGameOverMusic();
        this._setBannerInfo();

    },
    //隐藏提示条
    _hideLogView() {
        let scene = cc.director.getScene();
        let LogView = scene.getChildByName("LogView");
        if (LogView) {
            LogView.active = false;
        }
    },
    //设置Banner 广告
    _setBannerInfo() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.show();
        }
    },


    //向子域发送消息  向服务器发送消息
    _sendData() {
        // 发消息给子域
        let rankLevelItem = JsonFileMgr.getRankLevelItem(GameData.playInfo.currentLevel);
        let levelName = rankLevelItem.Name;
        let totalStar = (GameData.playInfo.currentLevel - 1) * 5 + GameData.playInfo.currentStarNum;
        let sendSubData = {
            levelInfo: levelName + "x" + GameData.playInfo.currentStarNum,
            totalStar: totalStar
        };
        let storageData = JSON.stringify(sendSubData);

        //向服务器发送数据  用户星级插入
        let postSubMsg = {
            message: "setUserStorage",
            storageData: storageData
        };
        WxApi.wx_postMessage(postSubMsg);
        //发送请求
        let url = "https://gather.51weiwan.com/api/game/starX";
        let sendData = {
            user_id: GameData.playInfo.uid,
            game_id: GameData.gameConfigInfo.gameId,
            type: 1,
            value: GameData.playInfo.currentStarNum,
            level: GameData.playInfo.currentLevel,
            is_win: 1,
        };
        let sucFun = res => {
            GameData.playInfo.gold = res.data.data.gold;
        };
        WxApi.wx_request(url, sendData, sucFun);
    },
    //初始化展示页面数据
    _initPage() {
        //加载玩家数据
        this.playerName.string = GameData.playInfo.nickName;
        // 远程 url 带图片后缀名
        let remoteUrl = GameData.playInfo.avatarUrl;
        let playerHead = this.playerHead.node;
        WxApi.wx_createImage(remoteUrl, playerHead);

        let starNum = GameData.playInfo.currentStarNum;
        if (starNum === 4) {
            //星级满的时候  提示去领奖
            if (GameData.playInfo.currentLevel >= 10) {
                GameData.playInfo.currentLevel = 10;
                GameData.playInfo.currentStarNum += 1;
            } else {
                GameData.playInfo.currentLevel += 1;
                GameData.playInfo.currentStarNum = 0;
                this.RmRematch.active = false;
            }
        } else {
            GameData.playInfo.currentStarNum += 1;
        }
        this._initStartContentNode(starNum);
        this._sendData();
        this._setGameList();
    },
    //加载最新推荐的游戏列表
    _setGameList() {
        let url = "https://gather.51weiwan.com/api/app/redirectlist";
        let sendData = {
            game_id: GameData.gameConfigInfo.gameId,
            location: GameData.gameConfigInfo.directGame.gameOverPositionId
        };
        let sucFun = res => {
            console.log("游戏胜利页面 获取的跳转数据为", res);
            this._showGameListData(res);
        };
        WxApi.wx_request(url, sendData, sucFun);
    },
    //遍历展示 游戏列表数据
    _showGameListData(recData) {
        if (recData.data.data.state === GameData.gameConfigInfo.directGame.stating) {
            console.log("游戏列表审核中，不进行遍历展示")
        } else {
            let gameList = recData.data.data.redirect;
            for (let i = 0; i < 4; i++) {
                let item = cc.instantiate(this.directGameListItem);
                let script = item.getComponent("DirectGameListItem_gameOver");
                if (script) {
                    let directInfo = {
                        img_url: gameList[i].img_url,
                        game_id: gameList[i].game_id,
                        app_id: recData.data.data.hz_app_id,
                        path: recData.data.data.hz_path
                    };
                    script.setItemData(directInfo);
                }
                this.content.addChild(item);
            }
        }
    },
    //游戏胜利执行加星操作
    _addStar() {
        let startItem = cc.instantiate(this.startPre);
        startItem.width = 51;
        startItem.height = 49;
        this.startContent.addChild(startItem);
    },
    //加载星级提升的动画
    _loadGradeUp() {
        this.addNode.removeAllChildren();
        UIMgr.createPrefab(this.gradeUp, function (root, ui) {
            this.addNode.addChild(root);
        }.bind(this));
        this.scheduleOnce(this._addStar, 1);
    },

    //设置星星数量
    _initStartContentNode(starNum) {
        let divideNum = parseInt(starNum / 5);
        let remainderNum = parseInt(starNum % 5);
        if (divideNum >= 1) {
            this.remainderNumLabel.string = "X" + divideNum;
        }
        this.startContent.removeAllChildren();
        for (let k = 0; k < remainderNum; k++) {
            let startItem = cc.instantiate(this.startPre);
            startItem.width = 51;
            startItem.height = 49;
            this.startContent.addChild(startItem);
        }
    },
    //炫耀一下
    onBtnClickShow() {
        let defaultTitle = "万圣节大逃亡，只有我一人活着出来！";
        WxApi.wx_shareAppMessage(GameData.gameConfigInfo.share[2], defaultTitle);
    },
    //去领奖
    onBtnClickAcceptPrize() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.hide();
        }
        GameMsgGlobal.sceneDirect.HomePageDirect = "levelList";
        cc.director.loadScene("HomePage");

    },
    //再来一局
    onBtnClickRmRematch() {
        let rankLevelItem = JsonFileMgr.getRankLevelItem(GameData.playInfo.currentLevel);
        if (rankLevelItem) {
            let costGold = rankLevelItem.Cost;
            let url = "https://gather.51weiwan.com/xxl/game/start";
            let sendData = {
                gold: costGold,
                user_id: GameData.playInfo.uid
            };
            let sucFun = res => {
                if (res.data.errno === 0) {//返回结果正确
                    GameMsgGlobal.sceneDirect.HomePageDirect = "matching";
                    cc.director.loadScene("HomePage");
                } else {
                    Tips.show("金币不足");
                }
            };
            WxApi.wx_request(url, sendData, sucFun);
        }

    },
    //返回段位列表页面
    onBtnClickBack() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.hide();
        }
        GameMsgGlobal.sceneDirect.HomePageDirect = "levelList";
        cc.director.loadScene("HomePage");
    },

});
