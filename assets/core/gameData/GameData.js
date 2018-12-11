let WxApi = require("WxApi");
let ObserverMgr = require("ObserverMgr");
module.exports = {
    isFirstEnterLoginScene: false,//是否是第一次进入到主页
    isFirstEnterLoading: true,//是否是第一次进入到主页
    gameBackMusic_on_off: 'on',//游戏背景音效开关
    gameSoundEffect_on_off: 'on',//游戏音效开关
    playInfo: {
        code: '',
        uid: 0,
        gold: 0,
        nickName: "",
        gender: 0,//性别
        avatarUrl: '',//头像地址
        currentLevel: 3,//当前段位
        currentStarNum: 3,//当前段位星级
        acceptAwardLevel: 0,


        //赛季奖励
        gameMoney: 0,//账户金额
        levelTotalMoney: 0,//奖池金额
        gameLastLevel: 6,//上个段位的级别
        lastLevelNum: 0,//上个段位的人数

        //和玩家pk用到的数据
        friendPk_level: 0,

    },

    gameConfigInfo: {//游戏配置信息
        gameId: 30,
        app_id: "wxaa1745f906874ada",
        hezi_appId: "",//盒子的appid
        gid: null,//即将跳转游戏的gameID
        //落地页跳到其他游戏
        launchQueryEnterStyle: null,//进入到游戏的方式
        launchQueryInviteUid: "",//
        //跳转到其他游戏的参数
        loadingSpriteDirectGame: {
            bgSpriteUrl: "",//图片纹理
            state: "",//审核状态
            app_id: "",
            param: "",
            path: "",
            hz_app_id: "",
            hz_path: "",
            game_id: "",
        },
        share: null,//分享参数信息
        levelInfo: null,//不同段位的人数
        acceptAwardInfo: null,//是否领取段位奖励


        //匹配到的机器人数据
        opponentInfo: {
            nickName: "",
            avatarUrl: '',
        },

        //手机机型适配数据
        playMobile_windowHeight: 667,//手机机型高度
        mobile_Vec_y: 0,//机型适配高度差

        enterStyle: "",//进入小游戏的方式  点击分享进入  对战进入 ， 普通进入
        inviteUid: null,

        //跳转游戏列表相关参数
        //侧拉板信息
        directGame: {
            stating: 10,//审核中
            mainPositionId: 600001,
            gameOverPositionId: 600002
        },

        // 激励视频  Banner相关信息
        bannerAd: null,
        videoAd: null,
        videoId_gold: "adunit-ab7a36ace71ccf5a",
        videoId_star: "adunit-784bb964399230ea",


    },

    //侧拉板信息
    leftPanelItem: {
        mainPositionId: 600001,
        gameOverPositionId: 600002
    },


    //对手 数据  （真实玩家）
    opponentInfo: {
        uid: 0,
        nickName: "",
        avatarUrl: '',//头像地址
        opponentExitRoom: false,
    },

    gameConfig: {//游戏配置信息
        basicConfig: {},//基础数据
        opponentInfo: {//机器人 对手信息
            nickName: "",
            avatarUrl: '',
        },
        levelInfo: {},//不同段位的人数
        acceptAwardInfo: [],//是否领取段位奖励
        appId: null,
        share: null,

        enterStyle: "",//进入小游戏的方式  点击分享进入  对战进入 ， 普通进入
        inviteUid: null,


    },

    //游戏广告相关数据
    gameAdInfo: {
        gameAd: null,
        gid: null,
        adObj_dropStar: null,//看视频不掉星
        adObj_lackGold: null,//金币
        adObj_dialog: null,//领取双倍金币
    },

    //由于场景会重复跳转 在此处设置全局变量 定义
    directScene: false,//正在跳转场景


    //获取游戏配置信息
    getGameConfig() {
        console.log("准备获取游戏配置信息");
        let url = 'https://gather.51weiwan.com/api/app/getConfig';
        let sendData = {
            type: 1,
            user_id: this.playInfo.uid,
            game_id: window.GameStatusInfo ? window.GameStatusInfo.gameId : this.gameConfigInfo.gameId,
        };
        let sucFun = res => {
            console.log("游戏配置数据", res);
            if (res.data.errno === 0) {//返回结果正确

                let playInfo = res.data.data.user_info;
                this._setUserInfo(playInfo);
                this.gameConfigInfo.hezi_appId = res.data.data.app_id;
                this.gameConfigInfo.share = res.data.data.share;
                ObserverMgr.dispatchMsg(GameMsgGlobal.gameReady_loading.enterLoginScene, null);
            }
        };
        WxApi.wx_request(url, sendData, sucFun);
    },
    //设置玩家信息
    _setUserInfo(data) {
        this.playInfo.nickName = data.nickname ? (data.nickname).slice(0, 5) : "";
        this.playInfo.avatarUrl = data.avatar_url;
        this.playInfo.gender = data.gender;
        this.playInfo.gold = data.gold;
        this.playInfo.currentLevel = data.tid == null ? 1 : data.tid;
        this.playInfo.currentStarNum = data.value == null ? 0 : data.value;
    },

    //获取游戏段位奖励以及每个段位的人数
    getLevelAwardAndPerLevelNum() {
        //获取段位奖励是否领取
        let url_drawLog = 'https://gather.51weiwan.com/xxl/game/goldDrawLog';
        let sendData_drawLog = {
            user_id: this.playInfo.uid,
        };
        let sucFun_drawLog = res => {
            console.log("游戏段位奖励数据", res);
            if (res.data.errno === 0) {//返回结果正确
                this.gameConfigInfo.acceptAwardInfo = res.data.data.level;
            }
        };
        WxApi.wx_request(url_drawLog, sendData_drawLog, sucFun_drawLog);

        //获取不同的段位人数
        let url = 'https://gather.51weiwan.com/api/mine/levelinfo';
        let sendData = {
            type: 1,
            game_id: this.gameConfigInfo.gameId,
        };
        let sucFun = res => {
            console.log("游戏段位段位人数", res);
            if (res.data.errno === 0) {//返回结果正确
                this.gameConfigInfo.levelInfo = res.data.data;
            }
        };
        WxApi.wx_request(url, sendData, sucFun);
    }
};