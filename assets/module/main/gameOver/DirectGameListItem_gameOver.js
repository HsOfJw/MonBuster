let WxApi = require("WxApi");
cc.Class({
    extends: cc.Component,

    properties: {
        imgSp: {displayName: "图表icon", default: null, type: cc.Sprite},
    },


    onLoad() {

    },

    setItemData(directInfo) {
        this.directInfo = directInfo;
        WxApi.wx_createImage(directInfo.img_url, this.imgSp.node);
    },
    //执行跳转逻辑
    onBtnClickItem() {
        WxApi.wx_navigateToMiniProgram({
            appId: this.directInfo.app_id,
            path: this.directInfo.path,
            extraData: {
                gameId: this.directInfo.game_id
            },
            envVersion: 'release',
        });
    }

    // update (dt) {},
});
