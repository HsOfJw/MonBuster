let GameData = require("GameData");
let ObserverMgr = require("ObserverMgr");
let WxApi = require("WxApi");

module.exports = {
    //返回小游戏的启动参数
    getLaunchParam() {
        if (window.wx !== undefined) {
            let onLaunchParam = wx.getLaunchOptionsSync();
            console.log('获取小游戏启动参数', onLaunchParam);
            if (onLaunchParam.query.gid) {
                console.log("游戏需要跳转到其他游戏");
                GameData.gameConfigInfo.gid = onLaunchParam.query.gid;
                this._loadNewLoadingSprite();
            } else {
                //落地页图片显示1.5秒 后跳转场景
                if (onLaunchParam.query.enterStyle) {
                    GameData.gameConfigInfo.launchQueryEnterStyle = onLaunchParam.query.enterStyle;
                    GameData.gameConfigInfo.launchQueryInviteuid = onLaunchParam.query.uid;
                }
                console.log('执行正常的游戏逻辑');
                ObserverMgr.dispatchMsg(GameMsgGlobal.gameReady_loading.enterGame, null);
            }
        }
    },

    //监听游戏切换到前台的事件
    gameOnShow() {
        if (window.wx !== undefined) {
            wx.onShow(res => {//监听小游戏回到前台的事件
                    console.log(' 游戏切换到前台', res);
                    if (res.query.enterStyle === "invitePk") {
                        /* GameData.gameConfigInfo.enterStyle = res.query.enterStyle;
                         GameData.gameConfigInfo.inviteUid = res.query.uid;
                         AudioMgr.playMainMusic();
                         console.log("---->被邀请人进入到房间中");
                         //NetSocketMgr.init();
                         cc.director.loadScene("InviteFriend");*/
                    }

                    if (res.query.game_id === GameData.gameConfigInfo.gameId) {
                        //跳到自己的游戏
                        AudioMgr.playMainMusic();
                        console.log("[loading] 切换到前台 跳转到自己的游戏中");
                        ObserverMgr.dispatchMsg(GameMsgGlobal.gameReady_loading.enterGame, null);
                    }
                    if (res.query.gid) {
                        AudioMgr.playMainMusic();
                        console.log("游戏返回到前台后，又重新进入到 非正常流程");
                        ObserverMgr.dispatchMsg(GameMsgGlobal.gameReady_loading.enterGame, null);
                    }
                }
            )
        }
    },
    //加载新图片
    _loadNewLoadingSprite() {
        let bgNode = cc.find("Canvas").getChildByName("loadingBg");
        bgNode.active = false;
        //为当前节点设置点击监听
        bgNode.on("touchstart", this._loadingSpriteClick, this);

        //加载新图片
        let url = "https://gather.51weiwan.com/hz/general/plan1";
        let sendData = {
            gid: GameData.gameConfigInfo.gid,
        };
        let sucFun = (statusCode,res) => {
            console.log("服务器获取获取落地页跳转信息", res.data.data);
            if (res.data.errno === 0) {
                GameData.gameConfigInfo.loadingSpriteDirectGame.bgSpriteUrl = res.data.data.img;
                GameData.gameConfigInfo.loadingSpriteDirectGame.state = res.data.data.state;
                GameData.gameConfigInfo.loadingSpriteDirectGame.app_id = res.data.data.app_id;
                GameData.gameConfigInfo.loadingSpriteDirectGame.param = res.data.data.param;
                GameData.gameConfigInfo.loadingSpriteDirectGame.path = res.data.data.path;
                GameData.gameConfigInfo.loadingSpriteDirectGame.game_id = res.data.data.game_id;

                GameData.gameConfigInfo.loadingSpriteDirectGame.hz_app_id = res.data.data.hz_app_id;
                GameData.gameConfigInfo.loadingSpriteDirectGame.hz_path = res.data.data.hz_path;
                //加载落地页图片
                WxApi.wx_createImage(res.data.data.img, bgNode);
            }
        };
        //发送请求
        WxApi.wx_request(url, sendData, sucFun);

    },
    //设置背景图片点击的监听  跳转
    _loadingSpriteClick() {
        let status = GameData.gameConfigInfo.loadingSpriteDirectGame.state;

        let ToMiniProgram = {

            envVersion: 'release',//release  正式版  trial 体验版
            success: function () {
                let bgNode = cc.find("Canvas").getChildByName("loadingBg");
                //为当前节点设置点击监听
                bgNode.off("touchstart", this._loadingSpriteClick, this);
                bgNode.getComponent(cc.Sprite).spriteFrame = cc.find("Canvas").getChildByName("logo").getComponent(cc.Sprite).spriteFrame;
            },
            fail: function (res) {
                console.log("跳转失败", res);
            },
        };

        if (status === 1) {//审核中  跳到游戏
            if (GameData.gameConfigInfo.loadingSpriteDirectGame.app_id === GameData.gameConfigInfo.app_id) {
                console.log("跳到自己的小游戏中");
            } else {
                ToMiniProgram.appId = GameData.gameConfigInfo.loadingSpriteDirectGame.app_id;
                ToMiniProgram.extraData = GameData.gameConfigInfo.loadingSpriteDirectGame.param;
                ToMiniProgram.path = GameData.gameConfigInfo.loadingSpriteDirectGame.path;
                console.log("跳转到其他游戏中");
                wx.navigateToMiniProgram(ToMiniProgram);
            }
        } else if (status === 2) {
            console.log("跳转到盒子中");
            ToMiniProgram.appId = GameData.gameConfigInfo.loadingSpriteDirectGame.hz_app_id;
            ToMiniProgram.path = GameData.gameConfigInfo.loadingSpriteDirectGame.hz_path;
            ToMiniProgram.extraData = {gid: GameData.gameConfigInfo.loadingSpriteDirectGame.game_id};
            wx.navigateToMiniProgram(ToMiniProgram);
        }
    },
}