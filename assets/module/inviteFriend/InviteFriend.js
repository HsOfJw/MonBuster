let Wx_netSocketMgr = require("Wx_netSocketMgr");
let GameData = require("GameData");
let Util = require("Util");
let GameLocalStorage = require("GameLocalStorage");
let Tips = require("Tips");
let Observer = require("Observer");
cc.Class({
    extends: Observer,

    properties: {
        myHeadFrame: {displayName: "头像纹理", default: null, type: cc.Sprite},
        myPlayerHead: {displayName: "头像", default: null, type: cc.Sprite},
        myPlayerName: {displayName: "玩家姓名", default: null, type: cc.Label},

        inviteButton: {displayName: "邀请按钮", default: null, type: cc.Node},

        otherHeadFrame: {displayName: "对手头像纹理", default: null, type: cc.Sprite},
        otherPlayerHead: {displayName: "对手头像", default: null, type: cc.Sprite},
        otherPlayerName: {displayName: "对手玩家姓名", default: null, type: cc.Label},

    },


    onLoad() {
        Wx_netSocketMgr.init();
        let enterStyle = GameData.gameConfig.enterStyle;
        // 通过好友的对战邀请链接进入到游戏中
        if (enterStyle === "invitePk") {//玩家通过 链接进入
            this._judgePlayerEnterPageStyle();
        } else {//玩家自己进入
            this._initPage();
        }
        this.otherHeadFrame.node.active = false;
        this._initMsg();
        this.setBannerInfo();
    },


    //设置Banner 广告
    setBannerInfo() {
        if (window.wx != undefined) {

            let winSize = wx.getSystemInfoSync();
            console.log("winSize", winSize);
            let bannerHeight = 120;
            let bannerWidth = 421;
            this.bannerAd = wx.createBannerAd({
                adUnitId: 'adunit-a4fb536ae75837e9',
                style: {
                    left: 0,
                    top: winSize.windowHeight - bannerHeight,
                    width: bannerWidth
                }
            });
            this.bannerAd.onLoad(() => {
                console.log('[inviteFriend] banner 广告加载成功');
            });
            this.bannerAd.onError(err => {
                console.log("[inviteFriend]  banner广告拉取失败 原因为", err)
            });
            this.bannerAd.show()
                .then(() => console.log('banner 广告显示'));
            //微信缩放后得到banner的真实高度，从新设置banner的top 属性
            this.bannerAd.onResize(res => {
                this.bannerAd.style.top = winSize.windowHeight - this.bannerAd.style.realHeight;
            });
        }
    },

    _getMsgList() {
        return [
            "playerReady_ok",//玩家已经准备好
            "roomFull",//房间已满
        ];
    },
    // [子类继承接口]消息返回
    _onMsg(msg, data) {
        if (msg === "playerReady_ok") {
            this._initOpponentPage(data);
        } else if (msg === "roomFull") {
            Tips.show("房间已满,即将返回主页");
            this.scheduleOnce(function () {
                this.onBtnClickBack();
            }, 1);

        }
    },
    //初始化 对手数据
    _initOpponentPage(data) {
        console.log("好友pk 启动 下发数据为", data);
        this.inviteButton.active = false;
        this.otherHeadFrame.node.active = true;
        GameData.opponentInfo.nickName = data.nickname;
        GameData.opponentInfo.avatarUrl = data.avatar_url;

        this.otherPlayerName.string = data.nickname ? data.nickname : "";
        // 远程 url 带图片后缀名
        let remoteUrl = data.avatar_url;
        let playerHead = this.otherPlayerHead.node;
        Util.loadRemoteSprite(remoteUrl, playerHead);
        GameData.playInfo.friendPk_level = 11;
        this.scheduleOnce(function () {
            //进入游戏 手动调整自己的  级别状态值
            cc.director.loadScene("MainScene");
        }, 1)
    },


    //邀请好友
    onBtnClickInviteFriend() {
        this.bannerAd.destroy();
        //发送 关闭房间
        let sendData = {
            owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
        };
        Wx_netSocketMgr.sendMsg(8, sendData);

        let shareInfo = GameData.gameConfig.share;
        if (shareInfo['6']) {
            console.log("[secondPage]邀请好友 取服务端数据", shareInfo['6']);
            let title = shareInfo['6'].info.share_title;
            let imageUrl = shareInfo['6'].info.share_img;

            if (window.wx !== undefined) {
                window.wx.shareAppMessage({
                    title: title,
                    imageUrl: imageUrl,
                    query: "enterStyle=invitePk&uid=" + GameData.playInfo.uid,
                    success: function (res) {

                        //发送连接数据 此消息没有回复
                        let sendData = {
                            user_id: GameData.playInfo.uid,
                            nickname: GameData.playInfo.nickName,
                            avatar_url: GameData.playInfo.avatarUrl,
                        };
                        Wx_netSocketMgr.sendMsg(1, sendData);
                        console.log("邀请好友 分享成功 返回信息为", res);
                    }
                })
            }
        } else {
            console.log("邀请好友对战 取默认数据");
            if (window.wx != undefined) {
                window.wx.shareAppMessage({
                    title: "我家的南瓜成精啦！快来救救我...",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400,
                    }),
                    query: "enterStyle=invitePk&uid=" + GameData.playInfo.uid,
                    success: function (res) {
                        //发送连接数据 此消息没有回复
                        let sendData = {
                            user_id: GameData.playInfo.uid,
                            nickname: GameData.playInfo.nickName,
                            avatar_url: GameData.playInfo.avatarUrl,
                        };
                        Wx_netSocketMgr.sendMsg(1, sendData);
                    }

                })

            }
        }
    },
    //返回主页面
    onBtnClickBack() {
        this.bannerAd.destroy();
        //发送 关闭房间
        let sendData = {
            owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
        };
        Wx_netSocketMgr.sendMsg(8, sendData);

        GameData.gameConfig.enterStyle = "";
        GameData.playInfo.friendPk_level = 0;
        cc.director.loadScene("HomePage");
    },

    //判定用户进入到场景的方式
    _judgePlayerEnterPageStyle() {
        let uid = GameLocalStorage.getUid();
        if (uid) {
            console.log("[InviteFriend] _judgePlayerEnterPageStyle 玩家 uid 存在 直接进入到游戏中 ");
            //发送连接数据 此消息没有回复
            let sendData = {
                user_id: GameData.playInfo.uid,
                nickname: GameData.playInfo.nickName,
                avatar_url: GameData.playInfo.avatarUrl,
                owner: GameData.gameConfig.inviteUid,
            };
            this.scheduleOnce(function () {
                Wx_netSocketMgr.sendMsg(2, sendData);
            }, 1.5);
            this._initPage();
            console.log("用户通过分享连接直接进入到匹配页面");
        } else {
            this._authorization();
        }
    },
    //授权操作
    _authorization() {
        console.log("[InviteFriend] _judgePlayerEnterPageStyle 进入到授权操作");
        if (window.wx != undefined) {
            wx.showToast({
                title: "点击屏幕任意位置，授权成功后即可进入到对战环节",
                duration: 3000
            })
        }
        let self = this;
        //开始授权操作
        if (window.wx !== undefined) {
            //设置按钮信息
            let button = wx.createUserInfoButton({
                type: 'image',
                image: 'http://gather.51weiwan.com//uploads//file//20180810//63dc8acab48ee0de3260a1b9dc38c163.png',
                style: {
                    left: 0,
                    top: 0,
                    width: 1000,
                    height: 1500,
                }
            });
            console.log("[:LoginScene] login 创建自定义按钮信息", button);
            button.onTap((res) => {
                console.log("点击按钮的返回值", res);
                if (res.errMsg == "getUserInfo:ok") {
                    //数据交互
                    wx.login({
                        success: function (res_login) {
                            console.log("success login", res_login);
                            //GameData.playInfo.code = res_login.code;
                            //发送请求
                            wx.request({
                                url: 'https://gather.51weiwan.com/api/login/index',
                                data: {
                                    code: res_login.code,
                                    game_id: 30,
                                    iv: res.iv,
                                    encryptedData: res.encryptedData,
                                },
                                success: function (res) {
                                    if (res.data.errno == 0) {//返回结果正确
                                        button.destroy();
                                        GameData.playInfo.uid = res.data.data.uid;
                                        //存贮uid  进入到内存中
                                        GameLocalStorage.setUid(GameData.playInfo.uid);
                                        self._getGameConfig(res.data.data.uid);
                                    } else {
                                        console.log("服务器登录错误，请重新尝试", res.data);
                                    }

                                    console.log("服务器登录返回数据", res);

                                    //执行邀请奖励邀请奖励
                                    if (GameData.gameConfig.enterStyle === "share") {
                                        if (window.wx != undefined) {
                                            wx.request({
                                                url: ' https://gather.51weiwan.com/xxl/share/goldAdd',
                                                data: {
                                                    share_id: GameData.gameConfig.inviteUid,
                                                    user_id: GameData.playInfo.uid,
                                                },
                                                success: function (res) {
                                                    console.log("点击分享加金币  服务器登录返回数据", res);
                                                },
                                            })
                                        }
                                    }
                                    console.log("服务器登录返回数据", res);
                                },
                            })
                        }
                    });
                }

            })

        }
    },

    //获取游戏配置相关信息
    _getGameConfig(uid) {
        let self = this;
        if (window.wx != undefined) {
            wx.request({
                url: 'https://gather.51weiwan.com/api/app/getConfig',
                data: {
                    type: 1,
                    user_id: uid,
                    game_id: 30,
                },
                success: function (res) {
                    if (res.data.errno == 0) {//返回结果正确
                        GameData.gameConfig.basicConfig = res.data.data;
                        self.loginSuccess(res.data.data.user_info);
                        GameData.gameConfig.appId = res.data.data.app_id;
                        GameData.gameConfig.share = res.data.data.share;
                    } else {
                        console.log("服务器获取配置文件返回信息错误");
                    }
                    console.log("服务器获取配置文件返回相应数据", res);
                },
            });
        }
    },
    //读取配置信息 返回数据
    loginSuccess(data) {
        console.log("退出登录流程，开始执行游戏逻辑 配置信息返回的玩家数据为", data);
        GameData.playInfo.nickName = data.nickname ? (data.nickname).slice(0, 5) : "";
        GameData.playInfo.avatarUrl = data.avatar_url;
        GameData.playInfo.gender = data.gender;
        GameData.playInfo.gold = data.gold;
        GameData.playInfo.currentLevel = data.tid == null ? 1 : data.tid;
        GameData.playInfo.currentStarNum = data.value == null ? 0 : data.value;

        //向服务器发送请求
        //发送连接数据 此消息没有回复
        let sendData = {
            user_id: GameData.playInfo.uid,
            nickname: GameData.playInfo.nickName,
            avatar_url: GameData.playInfo.avatarUrl,
            owner: GameData.gameConfig.inviteUid,
        };
        Wx_netSocketMgr.sendMsg(2, sendData);
        this._initPage();
        console.log("用户通过分享连接 授权进入到匹配页面");
    },

    //初始化自己的页面数据
    _initPage() {

        this.myPlayerName.string = GameData.playInfo.nickName;
        // 远程 url 带图片后缀名
        let remoteUrl = GameData.playInfo.avatarUrl;
        let playerHead = this.myPlayerHead.node;
        Util.loadRemoteSprite(remoteUrl, playerHead);
    },


});
