let GameData = require("GameData");
let AudioMgr = require("AudioMgr");
let JsonFileMgr = require("JsonFileMgr");
let Tips = require("Tips");
let AudioPlayer = require("AudioPlayer");
let WxApi = require("WxApi");
cc.Class({
    extends: cc.Component,

    properties: {
        playerHead: {displayName: "头像", default: null, type: cc.Sprite},
        playerName: {displayName: "玩家姓名", default: null, type: cc.Label},
        startContent: {displayName: "星星父节点", default: null, type: cc.Node},
        startPre: {displayName: "星级预制体", default: null, type: cc.Prefab},

        remainderNumLabel: {displayName: "除数", default: null, type: cc.Label},
        addGold: {displayName: "获取金币预制", default: null, type: cc.Prefab},

        content: {displayName: "游戏列表父节点", default: null, type: cc.Node},
        directGameListItem: {displayName: "跳转游戏子节点", default: null, type: cc.Prefab},
    },

    onLoad() {
        this._hideLogView();
        this._initPage();
        //播放失败音效
        this._controllerMsgByUserStar();
        AudioMgr.playGameOverMusic();
        this._setBannerInfo();
    },
    //隐藏提示条
    _hideLogView() {
        let scene = cc.director.getScene();
        let LogView = scene.getChildByName("LogView");
        LogView.active = false;
    },

    //根据用户星级判断 下一步流程
    _controllerMsgByUserStar() {
        if (GameData.playInfo.currentStarNum > 0) {
            this._popupTips();
        }
    },
    //弹出是否观看视频
    _popupTips() {
        //弹出微信窗口
        let content = "看视频不掉星";
        let cancelText = "不看";
        let confirmText = "看视频";

        if (window.wx !== undefined) {
            wx.showModal({
                title: "",
                content: content,
                showCancel: true,
                cancelText: cancelText,
                confirmText: confirmText,
                success: (res) => {
                    if (res.confirm) {
                        this._executeWatchVideo();
                    } else if (res.cancel) {
                        GameData.playInfo.currentStarNum -= 1;
                        this._sendQuestONGameOver();
                    }
                }
            })
        }
    },

    //失败 发送请求  向子域  服务器 掉星
    _sendQuestONGameOver() {
        this._sendDataToSub();
        this._executeDropStar();
        this._sendDataToServer();
    },

    //执行观看视频的操作 不掉星
    _executeWatchVideo() {
        //关闭背景音乐
        AudioPlayer.stopCurrentBackGroundMusic();

        let onErrorFun = res => {
            this._sendQuestONGameOver();
            AudioMgr.playMainMusic();
            //取消监听
            GameData.gameConfigInfo.videoAd.offError();
        };

        let onCloseFun = res => {
            if (res && res.isEnded || res === undefined) {
                console.log("[failedLayer] 观看视频不掉星  正常播放结束，可以下发游戏奖励");
            }
            else {
                console.log("[failedLayer] 观看视频不掉星 用户播放中途退出，不下发游戏奖励");
                this._sendQuestONGameOver();
            }
            AudioMgr.playMainMusic();
            //取消监听
            GameData.gameConfigInfo.videoAd.offClose();
        };

        WxApi.wx_setVideoAd(GameData.gameConfigInfo.videoId_star, onErrorFun, onCloseFun);

    },

    //初始化页面数据
    _initPage() {
        this.playerName.string = GameData.playInfo.nickName;
        // 远程 url 带图片后缀名
        let remoteUrl = GameData.playInfo.avatarUrl;
        let playerHead = this.playerHead.node;
        WxApi.wx_createImage(remoteUrl, playerHead);
        let starNum = GameData.playInfo.currentStarNum;
        this._initStartContentNode(starNum);

        //展示跳转游戏列表
        let url = "https://gather.51weiwan.com/api/app/redirectlist";
        let sendData = {
            game_id: GameData.gameConfigInfo.gameId,
            location: GameData.gameConfigInfo.directGame.gameOverPositionId
        };
        let sucFun = res => {
            console.log("游戏结束页面 获取的跳转数据为", res);
            this._showData(res);
        };
        WxApi.wx_request(url, sendData, sucFun);


    },
    //遍历展示数据
    _showData(recData) {
        if (recData.data.data.state === "10") {
            console.log("游戏列表审核中，不进行遍历展示");
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
    //设计星星数量
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

    //执行掉星流程
    _executeDropStar() {
        //取出最后一个星星 执行销毁动作
        this.scheduleOnce(function () {
            if (this.startContent) {
                let childNum = this.startContent.childrenCount;
                if (childNum > 0) {
                    let star = this.startContent.children[childNum - 1];
                    let runAction1 = cc.moveBy(1, cc.v2(0, 300));
                    let runAction2 = cc.fadeTo(1, 0);
                    star.runAction(cc.spawn(runAction1, runAction2));
                }
            }
        }.bind(this), 0.5);
    },
    // 发消息给子域  减星 后
    _sendDataToSub() {
        let rankLevelItem = JsonFileMgr.getRankLevelItem(GameData.playInfo.currentLevel);
        let levelName = rankLevelItem.Name;
        let totalStar = (GameData.playInfo.currentLevel - 1) * 5 + GameData.playInfo.currentStarNum;//排序的判定条件
        let sendData = {
            levelInfo: levelName + "x" + GameData.playInfo.currentStarNum,
            totalStar: totalStar
        };
        let storageData = JSON.stringify(sendData);
        WxApi.wx_postMessage({
            message: "setUserStorage",
            storageData: storageData
        });
    },
    //向服务器发送数据  只有不看视频  视频加载错误也会向服务器发送数据  才会向服务器发送数据
    _sendDataToServer() {
        let url = "https://gather.51weiwan.com/api/game/starX";
        let sendData = {
            user_id: GameData.playInfo.uid,
            game_id: GameData.gameConfigInfo.gameId,
            type: 1,
            value: GameData.playInfo.currentStarNum - 1,
            level: GameData.playInfo.currentLevel,
            is_win: 0
        };
        let sucFun = res => {
            if (res.data.errno === 0) {//返回结果正确
                GameData.playInfo.gold = res.data.data.gold;
            }
        };
        WxApi.wx_request(url, sendData, sucFun);
    },
    //换换手气
    onBtnClickChangeGame() {
        WxApi.wx_navigateToMiniProgram({
            appId: GameData.gameConfigInfo.hezi_appId,
            path: '',
            envVersion: 'release'
        });
    },
    //再来一局
    onBtnClickEnterGame() {
        if (cc.sys.isBrowser) {
            cc.director.loadScene("HomePage");
        }
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
                    if (GameData.gameConfigInfo.bannerAd) {
                        GameData.gameConfigInfo.bannerAd.hide();
                    }
                    GameMsgGlobal.sceneDirect.HomePageDirect = "matching";
                    cc.director.loadScene("HomePage");
                } else {
                    Tips.show("金币不足");
                }
            };
            WxApi.wx_request(url, sendData, sucFun);

        }

    },

    onBtnClickBack() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.hide();
        }
        GameMsgGlobal.sceneDirect.HomePageDirect = "levelList";
        cc.director.loadScene("HomePage");
    },
    //设置Banner 广告
    _setBannerInfo() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.show();
        }
    },

    // update (dt) {},
});
