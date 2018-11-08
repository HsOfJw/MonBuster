let GameData = require("GameData");
let Util = require("Util");
let AudioMgr = require("AudioMgr");
let Wx_netSocketMgr=require("Wx_netSocketMgr");
let Observer = require("Observer");
let UIMgr = require("UIMgr");
cc.Class({
    extends: Observer,

    properties: {
        playerHead: {displayName: "头像", default: null, type: cc.Sprite},
        playerName: {displayName: "玩家姓名", default: null, type: cc.Label},


        await: {displayName: "等待队友接受邀请", default: null, type: cc.Prefab},
        Invited: {displayName: "被邀请", default: null, type: cc.Prefab},
        reject: {displayName: "被拒绝", default: null, type: cc.Prefab},
        addNode: {displayName: "添加子节点", default: null, type: cc.Node},
    },

    onLoad() {
        this._initPage();
        //播放失败音效
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
            UIMgr.createPrefab(this.await, function (root, ui) {
                this.addNode.addChild(root);
            }.bind(this));
        } else if (msg === "dialog_invitePage") {
            this.addNode.removeAllChildren();
            UIMgr.createPrefab(this.Invite_rece, function (root, ui) {
                this.addNode.addChild(root);
            }.bind(this));
        } else if (msg === "dialog_opponent_cancel") {
            this.addNode.removeAllChildren();
            UIMgr.createPrefab(this.reject, function (root, ui) {
                this.addNode.addChild(root);
            }.bind(this));
        } else if (msg === "playerReady_ok") {
            this.scheduleOnce(function () {
                //进入游戏 手动调整自己的  级别状态值
                cc.director.loadScene("MainScene");
            }, 1)
        }
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

    onBtnClickChangeGame() {
        if (window.wx != undefined) {
            wx.navigateToMiniProgram({
                appId: GameData.gameConfig.appId,
                path: '',
                envVersion: 'release',
                success: function () {
                    console.log("跳转到更多游戏成功");
                },
                fail: function (res) {
                    console.log("跳转到更多游戏失败", res);
                },
            })
        }
    },
    //再来一局
    onBtnClickEnterGame() {
        //发送连接数据 此消息没有回复
        let sendData = {
            user_id: GameData.playInfo.uid,
            owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
        };
        Wx_netSocketMgr.sendMsg(5, sendData);
        //服务器应该下发 邀请是否成功提示  目前默认成功
        this.addNode.removeAllChildren();
        UIMgr.createPrefab(this.await, function (root, ui) {
            this.addNode.addChild(root);
        }.bind(this));
    },
    onBtnClickBack() {
        //发送 关闭房间
        let sendData = {
            owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
        };
        Wx_netSocketMgr.sendMsg(8, sendData);
        GameData.gameConfig.enterStyle = "";
        GameData.playInfo.friendPk_level = 0;
        cc.director.loadScene("HomePage");
    }

    // update (dt) {},
});
