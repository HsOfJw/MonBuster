let GameData = require("GameData");
let UIMgr = require("UIMgr");
//let NetSocketMgr = require("NetSocketMgr");
let Wx_netSocketMgr=require("Wx_netSocketMgr");
cc.Class({
    extends: cc.Component,

    properties: {
        friendName: {displayName: "对手姓名", default: null, type: cc.Label},
        countDownLabel: {displayName: "倒计时", default: null, type: cc.Label},
    },


    onLoad() {
        this._initPageData();
        this.countDownIndex = 30;
    },

    _initPageData() {
        this.friendName.string = GameData.opponentInfo.nickName;
        this.schedule(this._countDown, 1);
    },
    _countDown() {
        this.countDownLabel.string = this.countDownIndex + "s";
        this.countDownIndex--;
        if (this.countDownIndex === 0) {
            this.onBtnClickCancelInVite();
        }
    },
    //取消邀请
    onBtnClickCancelInVite() {
        //发送 关闭房间
        let sendData = {
            owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
        };
        Wx_netSocketMgr.sendMsg(8, sendData);
        this.unschedule(this._countDown);
        UIMgr.destroyUI(this);
    },

    // update (dt) {},
});
