let UIMgr = require("UIMgr");
cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.scheduleOnce(this._desUi, 2.5);
    },
    _desUi() {
        UIMgr.destroyUI(this);
    },


});
