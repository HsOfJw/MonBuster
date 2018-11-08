let UIMgr = require("UIMgr");
cc.Class({
    extends: cc.Component,

    properties: {},
    onLoad() {
    },
    onBtnClickIKnow() {
        UIMgr.destroyUI(this);
    },

    // update (dt) {},
});
