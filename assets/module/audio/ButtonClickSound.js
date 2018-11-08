let AudioPlayer = require('AudioPlayer');
let AudioMgr = require('AudioMgr');

cc.Class({
    extends: cc.Component,

    properties: {
        clickSound: {default: null, displayName: "按钮声音", type: cc.AudioClip},
    },

    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {
            if (this.clickSound) {
                AudioPlayer.playEffectMusic(this.clickSound, false);
            } else {
                AudioMgr.playButtonSound();
            }
            return true;
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, function () {

        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function () {

        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function () {
        }, this);
    },

});
