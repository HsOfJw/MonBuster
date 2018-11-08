//let NetSocketMgr = require("NetSocketMgr");
let Wx_netSocketMgr=require("Wx_netSocketMgr");
let GameData = require("GameData");
let Util = require("Util");
let UIMgr = require("UIMgr");
let AudioMgr = require("AudioMgr");
let Observer = require("Observer");
cc.Class({
    extends: Observer,

    properties: {
        headFrame: {displayName: "头像纹理", default: null, type: cc.Sprite},
        playerHead: {displayName: "头像", default: null, type: cc.Sprite},
        playerName: {displayName: "玩家姓名", default: null, type: cc.Label},

        Invite_await: {displayName: "再次邀请好友", default: null, type: cc.Prefab},
        Invite_rece: {displayName: "是否接受邀请", default: null, type: cc.Prefab},
        InviteTips: {displayName: "邀请提示", default: null, type: cc.Prefab},

        addNode: {displayName: "添加子预制体的节点", default: null, type: cc.Node},

    },


    onLoad() {
        this._initPage();
        AudioMgr.playGameOverMusic();
        this._initMsg();
    },
    _getMsgList() {
        return [
            "inviteSuccess",//再来一局 发送成功  弹出
            "dialog_invitePage",//弹出邀请页面
            "dialog_opponent_cancel",//对方拒绝
            "playerReady_ok",//玩家已经准备好
        ];
    },
    // [子类继承接口]消息返回
    _onMsg(msg, data) {
        if (msg === "inviteSuccess") {
            this.addNode.removeAllChildren();
            UIMgr.createPrefab(this.Invite_await, function (root, ui) {
                this.addNode.addChild(root);
            }.bind(this));
        } else if (msg === "dialog_invitePage") {
            this.addNode.removeAllChildren();
            UIMgr.createPrefab(this.Invite_rece, function (root, ui) {
                this.addNode.addChild(root);
            }.bind(this));
        } else if (msg === "dialog_opponent_cancel") {
            this.addNode.removeAllChildren();
            UIMgr.createPrefab(this.InviteTips, function (root, ui) {
                this.addNode.addChild(root);
            }.bind(this));
        } else if (msg === "playerReady_ok") {
            this.scheduleOnce(function () {
                //进入游戏 手动调整自己的  级别状态值
                cc.director.loadScene("MainScene");
            }, 1)
        }
    },

    //再来一局
    onBtnClickContinueGame() {
        //发送连接数据 此消息没有回复
        let sendData = {
            user_id: GameData.playInfo.uid,
            owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
        };
        Wx_netSocketMgr.sendMsg(5, sendData);
    },

    onBtnClickBack() {
        //发送 关闭房间
        let sendData = {
            owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
        };
        Wx_netSocketMgr.sendMsg(8, sendData);
        GameData.gameConfig.enterStyle="";
        GameData.playInfo.friendPk_level = 0;
        cc.director.loadScene("HomePage");
    },
    _initPage() {
        let self = this;
        //加载玩家数据
        this.playerName.string = GameData.playInfo.nickName;
        // 远程 url 带图片后缀名
        let remoteUrl = GameData.playInfo.avatarUrl;
        let playerHead = this.playerHead.node;
        Util.loadRemoteSprite(remoteUrl, playerHead);
    },

    onBtnClickShow() {
        let shareInfo = GameData.gameConfig.share;
        if (shareInfo['11']) {
            console.log("[VictoryLayer] 胜利页面分享取服务端数据", shareInfo['11']);
            let title = shareInfo['11'].info.share_title;
            let imageUrl = shareInfo['11'].info.share_img;

            if (window.wx != undefined) {
                window.wx.shareAppMessage({
                    title: title,
                    imageUrl: imageUrl,
                    query: "enterStyle=share&uid=" + GameData.playInfo.uid,
                    success: function (res) {
                        console.log("胜利页面分享成功 返回信息为", res);
                    }
                })
            }
        } else {
            console.log("分享取默认数据");
            if (window.wx != undefined) {
                window.wx.shareAppMessage({
                    title: "万圣节大逃亡，只有我一人活着出来！",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400,
                    }),
                    query: "enterStyle=share&uid=" + GameData.playInfo.uid,
                    success: function (res) {
                        console.log("胜利页面分享成功 返回信息为", res);
                    }

                })

            }
        }
    },


});
