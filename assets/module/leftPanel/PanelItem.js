let Util = require("Util");
cc.Class({
    extends: cc.Component,

    properties: {
        imgSp: {displayName: "图表icon", default: null, type: cc.Sprite},
        gameName: {displayName: "游戏名称", default: null, type: cc.Label},
    },


    onLoad() {

    },

    setItemData(directInfo) {
        this.directInfo = directInfo;
        if (directInfo.gameName.length > 4) {
            this.gameName.string = directInfo.gameName.slice(0,4) + "..";
        } else {
            this.gameName.string = directInfo.gameName;
        }
        Util.loadRemoteSprite(directInfo.img_url, this.imgSp.node);
    },
    //执行跳转逻辑
    onBtnClickItem() {
        let that = this;
        if (window.wx != undefined) {
            wx.navigateToMiniProgram({
                appId: that.directInfo.app_id,
                path: that.directInfo.path,
                extraData: {
                    gameId: that.directInfo.game_id
                },
                envVersion: 'release',
                success() {
                    console.log("跳转成功");
                },
                fail(res) {
                    console.log("跳转失败", res);
                },
            })
        }
    }

    // update (dt) {},
});
