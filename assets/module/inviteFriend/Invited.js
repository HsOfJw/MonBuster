let UIMgr = require("UIMgr");
//let NetSocketMgr = require("NetSocketMgr");
let Wx_netSocketMgr=require("Wx_netSocketMgr");
let GameData=require("GameData");
cc.Class({
    extends: cc.Component,

    properties: {
        friendName: {displayName: "邀请人", default: null, type: cc.Label},
    },


    onLoad() {
        this.friendName.string = GameData.opponentInfo.nickName;
    },
    //同意
    onBtnClickAgree() {
        //发送消息 同意
        let sendData = {
            user_id: GameData.playInfo.uid,
            owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
        };
        Wx_netSocketMgr.sendMsg(6, sendData);
        UIMgr.destroyUI(this);
    },
    //拒绝
    onBtnClickCancel() {
        //发送消息 拒绝
        let sendData = {
            user_id: GameData.playInfo.uid,
            owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
        };
        Wx_netSocketMgr.sendMsg(7, sendData);
        UIMgr.destroyUI(this);
    },
    // update (dt) {},
});
