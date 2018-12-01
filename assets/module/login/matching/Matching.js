let Util = require("Util");
let GameData = require("GameData");
let Tips = require("Tips");
let WxApi = require("WxApi");
cc.Class({
    extends: cc.Component,

    properties: {
        myPlayerHead: {displayName: "头像", default: null, type: cc.Sprite},
        myPlayerName: {displayName: "玩家姓名", default: null, type: cc.Label},

        youPlayerHead: {displayName: "对方头像", default: null, type: cc.Sprite},
        youPlayerName: {displayName: "对方玩家姓名", default: null, type: cc.Label},

        countDownNum: {displayName: "倒计时", default: null, type: cc.Label},
        circleBg: {displayName: "转圈的节点", default: null, type: cc.Node},


        myNode: {displayName: "我的头像节点", default: null, type: cc.Node},
        youNode: {displayName: "你的头像节点", default: null, type: cc.Node},
    },
    onLoad() {
        this.index = 0;
        this._initPageData();
        cc.director.preloadScene("MainScene");
        this._setBannerInfo();
        this._calculateMobileVec_Y();
    },
    //计算机型适配高度差
    _calculateMobileVec_Y() {
        WxApi.wx_getSystemInfo();
    },

    //初始化页面数据
    _initPageData() {
        let self = this;
        this.myPlayerName.string = GameData.playInfo.nickName;

        // 远程 url 带图片后缀名
        let remoteUrl = GameData.playInfo.avatarUrl;
        let playerHead = this.myPlayerHead.node;
        WxApi.wx_createImage(remoteUrl, playerHead);
        let random = Util.randomNum(20);
        this.totalTime = random % 5 + Math.floor(Math.random() * 3) + 4;
        this.schedule(this._updateCountDownNum, 1);
        this._sendQuest();
    },

    _sendQuest() {
        let url = "https://gather.51weiwan.com/xxl/robot/rand";
        let sendData = null;
        let sucFun = (statusCode,res) => {
            if (res.data.errno === 0) {//返回结果正确
                GameData.gameConfigInfo.opponentInfo.nickName = res.data.data[0].nickname;
                GameData.gameConfigInfo.opponentInfo.avatarUrl = res.data.data[0].avatar_url;
            } else {
                Tips.show(res.data.errmsg);
            }
        };
        WxApi.wx_request(url, sendData, sucFun);
    },

    _updateCountDownNum() {
        this.index++;
        let rotationAction = cc.rotateBy(1, 60);
        this.circleBg.runAction(rotationAction);
        this.countDownNum.string = this.index;
        if (this.index >= this.totalTime) {
            this._initOpponentData();
            this.unschedule(this._updateCountDownNum);
            this._moveToNode();
            this.circleBg.stopAction(rotationAction);
            this.countDownNum.string = "匹配成功";
        }
    },
    _initOpponentData() {
        this.youPlayerName.string = GameData.gameConfigInfo.opponentInfo.nickName;
        // 远程 url 带图片后缀名
        let remoteUrl = GameData.gameConfigInfo.opponentInfo.avatarUrl;
        let playerHead = this.youPlayerHead.node;
        WxApi.wx_createImage(remoteUrl, playerHead);
    },

    _moveToNode() {
        //移动节点
        let moveAction_1 = cc.moveTo(0.5, cc.v2(247, -90));
        let moveAction_2 = cc.moveTo(0.5, cc.v2(-255, -90));
        this.myNode.runAction(moveAction_1);
        this.youNode.runAction(moveAction_2);
        this.scheduleOnce(function () {
            if (GameData.gameConfigInfo.bannerAd) {
                GameData.gameConfigInfo.bannerAd.hide();
            }
            cc.director.loadScene("MainScene");
        }.bind(this), 1.2);
    },
    //设置Banner 广告
    _setBannerInfo() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.show();
        }
    },
});
