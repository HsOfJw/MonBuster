/**
 * @author Javen 
 * @copyright 2018-10-22 15:04:24 javendev@126.com 
 * @description QQPlay 事件监听
 */

var BKTools = require("BKTools");
cc.Class({
    extends: cc.Component,

    // properties: {},

    // onLoad () {},

    start() {
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            BKTools.log('QQPlayerEvent QQ玩一玩平台');
            this._onQQPlayEvent();
        } else {
            BKTools.log('QQPlayerEvent 非QQ玩一玩平台');
        }
    },
    _enterForegroundListener() {
        BKTools.log('进入前台');
    },
    _enterBackgroundListener() {
        BKTools.log('退出前台');
    },
    _gameCloseListener() {
        BKTools.log('关闭游戏');
        //上报操作
        //...
    },
    _maximizeListener() {
        BKTools.log('最大化');
    },
    _minimizeListener() {
        BKTools.log('最大化');
    },
    _onNetworkChangeListener(data) {
        BKTools.log(data);
        if (data.state == BK.NetworkState.NoneToMobileNetwork) {
            BKTools.log('从无网络到移动网络');
        } else if (data.state == BK.NetworkState.NoneToWifi) {
            BKTools.log('无网络到WiFi网络');
        } else if (data.state == BK.NetworkState.MobileNetworkToWifi) {
            BKTools.log('移动网络到WiFi网络');
        } else if (data.state == BK.NetworkState.MobileNetworkToNone) {
            BKTools.log('移动网络到无网络');
        } else if (data.state == BK.NetworkState.WifiToNone) {
            BKTools.log('WiFi到无网络');
        } else if (data.state == BK.NetworkState.WifiToMobileNetwork) {
            BKTools.log('WiFi到移动网络');
        }
    },
    _onShareCompleteListener(data) {
        //shareDest 0为QQ 1为QZone 2为微信 3为朋友圈  isFirstShare永远为true
        BKTools.log("分享完成： retCode:" + data.retCode + '，isFirstShare:' + data.isFirstShare + '，dest:' + data.shareDest);
    },
    _onShareListener() {
        BKTools.log("调用分享接口时回调,分享了...");
        //无法自定义分享
    },
    _onQQPlayEvent() {
        BK.onEnterForeground(this._enterForegroundListener);
        BK.onEnterBackground(this._enterBackgroundListener);
        BK.onGameClose(this._gameCloseListener);
        BK.onMaximize(this._maximizeListener);
        BK.onMinimize(this._minimizeListener);
        BK.onNetworkChange(this._onNetworkChangeListener);
        BK.onGameShareComplete(this._onShareCompleteListener);
        BK.onGameShare(this._onShareListener);
    },


    // update (dt) {},
});