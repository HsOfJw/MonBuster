let GameData = require("GameData");
let UIMgr = require("UIMgr");
let AudioPlayer = require("AudioPlayer");
let AudioMgr = require("AudioMgr");
let ObserverMgr = require("ObserverMgr");
let Tips = require("Tips");
let WxApi = require("WxApi");
cc.Class({
    extends: cc.Component,

    properties: {
        watch: {displayName: "观看", default: null, type: cc.Node},
        watch_gray: {displayName: "观看不可用", default: null, type: cc.Node},
        share: {displayName: "分享", default: null, type: cc.Node},
        share_gray: {displayName: "分享不可用", default: null, type: cc.Node},
    },


    onLoad() {

    },

    //点击观看视频
    onBtnClickWatchVideo() {
        //关闭背景音乐
        AudioPlayer.stopCurrentBackGroundMusic();
        let onErrorFun = res => {
            Tips.show("视频加载失败");
            AudioMgr.playMainMusic();
            //取消监听
            GameData.gameConfigInfo.videoAd.offError();
        };

        let onCloseFun = res => {
            if (res && res.isEnded || res === undefined) {
                //发送请求
                let url = "https://gather.51weiwan.com/xxl/game/goldAdd";
                let sendData = {
                    user_id: GameData.playInfo.uid,
                };
                let sucFun = (statusCode,res) => {
                    if (res.data.errno === 0) {//返回结果正确
                        GameData.playInfo.gold = res.data.data.gold;
                        ObserverMgr.dispatchMsg(GameMsgGlobal.gameLoginScene.addGold_watchVideo, null);
                    }
                };
                WxApi.wx_request(url, sendData, sucFun);
            }
            UIMgr.destroyUI(this);
            AudioMgr.playMainMusic();
            //取消监听
            GameData.gameConfigInfo.videoAd.offClose();
        };
        WxApi.wx_setVideoAd(GameData.gameConfigInfo.videoId_gold, onErrorFun, onCloseFun);
    },
    //点击我知道了
    onBtnClickKnow() {
        UIMgr.destroyUI(this);
    }
});
