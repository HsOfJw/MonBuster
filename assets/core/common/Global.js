/**
 * 全局参数
 */
module.exports = {
    isDebug: true,
    isWeb: true,
    isMatch: false,
    openId: "15B91788D2D3FDB763DEBA67EB3D646E",
    gameId: 3603,
    PUIN: "2896237320",
    platform: 3, //手机平台 1:ios,2:android 3:其他
    sex: 0, //性别 1 男 2 女 0 未知
    nickName: "Javen", //用户昵称
    osVersion: "1.1.1", //手Q版本
    inviter: "inGame",

    URL: {
        BASE_URL: "http://192.168.1.158:2000/hltt/account/v1",
        LOGIN: "/loginFight",
    },
    WEB_SOCKET: {
        URL: null,
        TOKEN: null
    },

    videoAd: undefined,
    bannerAd: undefined,

    videoAdLoadCount: 0, //视频广告加载次数
    bannerAdLoadCount: 0, //banner广告加载次数
};