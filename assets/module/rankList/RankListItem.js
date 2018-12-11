let Util = require("Util");
let BKTools = require("BKTools");
let Utils = require("Utils");
cc.Class({
    extends: cc.Component,

    properties: {
        levelId: {displayName: "名次", default: null, type: cc.Label},
        headSprite: {displayName: "头像", default: null, type: cc.Sprite},
        nickname: {displayName: "昵称", default: null, type: cc.Label},
        userLevel: {displayName: "玩家当前等级", default: null, type: cc.Label},
    },


    onLoad() {
    },

    setRankListItemData(ranking, data) {
        this.levelId.string = "NO." + ranking;
        if (ranking == 1) {
            this.levelId.node.color = new cc.Color(255, 121, 0);
        } else if (ranking < 4) {
            this.levelId.node.color = new cc.Color(60, 60, 60);
        } else {
            this.levelId.node.color = new cc.Color(144, 144, 144);
        }

        if (cc.sys.platform === cc.sys.QQ_PLAY) {
            Utils.loadImgByUrl(this.headSprite.node, data.url);
            this.nickname.string = data.nick ? (data.nick).slice(0, 5) : "";
            this.userLevel.string = data.score + "x 星";
        } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            // 远程 url 带图片后缀名
            let remoteUrl = data.avatar_url;
            Util.loadRemoteSprite(remoteUrl, this.headSprite.node);
            this.nickname.string = data.nickname ? (data.nickname).slice(0, 5) : "";
            this.userLevel.string = data.name + "x" + data.value + "星";
        }
    }
    // update (dt) {},
});
