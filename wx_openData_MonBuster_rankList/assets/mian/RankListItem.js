let Util = require("Util");
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
    // 远程 url 带图片后缀名
    setRankListItemData(ranking, data) {
        this.levelId.string = "NO." + ranking;
        if (ranking === 1) {
            this.levelId.node.color = new cc.Color(255, 121, 0);
        } else if (ranking < 4) {
            this.levelId.node.color = new cc.Color(60, 60, 60);
        } else {
            this.levelId.node.color = new cc.Color(144, 144, 144);
        }

        let remoteUrl = data.avatarUrl;
        Util.loadRemoteSprite(remoteUrl, this.headSprite.node);
        this.nickname.string = data.nickname;
        this.userLevel.string = data.KVDataList[0].value;

    }

    // update (dt) {},
});
