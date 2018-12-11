let UIMgr = require("UIMgr");
let GameData = require("GameData");
let ObserverMgr = require("ObserverMgr");
let JsonFileMgr = require("JsonFileMgr");
let AudioMgr = require("AudioMgr");
let AudioPlayer = require("AudioPlayer");
let WxApi = require("WxApi");
cc.Class({
    extends: cc.Component,

    properties: {
        levelName: {displayName: "段位名称", default: null, type: cc.Label},
        awardNum: {displayName: "金币数量", default: null, type: cc.Label},
        getAward: {displayName: "领取", default: null, type: cc.Button},
        doubleGetAward: {displayName: "双倍领取", default: null, type: cc.Button},
    },


    onLoad() {
        this._initPageData();
    },
    _initPageData() {
        let levelId = GameData.playInfo.acceptAwardLevel;
        let rankLevelItem = JsonFileMgr.getRankLevelItem(levelId);
        if (rankLevelItem) {
            this.levelName.string = rankLevelItem.Name;
            this.awardNum.string = "X" + rankLevelItem.awardGold;
        }
    },
    //点击领取  单倍
    onBtnClickSure() {
        console.log("领取单倍奖励");
        this.sentQuestToGetAward(0);
    },
    //观看视频领取双倍奖励
    onBtnClickDoubleGetAward() {
        console.log("观看视频领取双倍奖励");
        //关闭背景音乐
        AudioPlayer.stopCurrentBackGroundMusic();
        let onErrorFun = res => {
            Tips.show("视频加载失败");
            AudioMgr.playMainMusic();
            this.sentQuestToGetAward(0);
            //取消监听
            GameData.gameConfigInfo.videoAd.offError();
        };
        let onCloseFun = res => {
            if (res && res.isEnded || res === undefined) {
                this.sentQuestToGetAward(1);
            } else {
                this.sentQuestToGetAward(0);
            }
            AudioMgr.playMainMusic();
            //取消监听
            GameData.gameConfigInfo.videoAd.offClose();
        };
        WxApi.wx_setVideoAd(GameData.gameConfigInfo.videoId_gold, onErrorFun, onCloseFun);
    },
    //发送请求  领取金币
    sentQuestToGetAward(isDoubleNUm) {
        let url = "https://gather.51weiwan.com/xxl/game/goldDrawLogAdd";
        let sendData = {
            user_id: GameData.playInfo.uid,
            level_id: GameData.playInfo.acceptAwardLevel,
            is_double: isDoubleNUm
        };
        let sucFun = res => {
            if (res.data.errno === 0) {//返回结果正确
                GameData.gameConfigInfo.acceptAwardInfo = res.data.data.level;
                //给自己加金币
                GameData.playInfo.gold = res.data.data.gold;
                //刷新段位列表
                ObserverMgr.dispatchMsg(GameMsgGlobal.gameLoginScene.refreshLevelList, null);
                UIMgr.destroyUI(this);
            } else {
                console.log("[dialog ]服务器获取 领取段位奖励错误", res.data.errMsg);
            }
        };
        WxApi.wx_request(url, sendData, sucFun());
    }
});
