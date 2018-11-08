let JsonFileMgr = require("JsonFileMgr");
let WxApi = require("WxApi");
cc.Class({
    extends: cc.Component,

    properties: {
        gameIcon: {displayName: "游戏图标", default: null, type: cc.Sprite},
        gameName: {displayName: "要跳转的游戏名称", default: null, type: cc.Label},
    },


    onLoad() {

    },
    setItemData(data) {
        let gameParamItemData = JsonFileMgr.getDirectGameParam(data);
        if (gameParamItemData) {
            let gameIcon = gameParamItemData.catalogue_path;
            let gameName = gameParamItemData.GameName;
            //加载icon 图标
            cc.loader.loadRes(gameIcon, cc.SpriteFrame, function (err, spriteFrame) {
                this.gameIcon.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }.bind(this));
            this.gameName.string = gameName.length > 5 ? gameName.slice(0, 4) + ".." : gameName;
            this.appId = gameParamItemData.appId;
            this.path = gameParamItemData.path;
        }

    },
    //点击跳转
    onBtnClickItem() {
        WxApi.wx_navigateToMiniProgram({
            appId: this.appId,
            path: this.path,
            envVersion: 'release',
        })

    },
});
