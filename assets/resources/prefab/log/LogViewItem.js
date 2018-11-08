cc.Class({
    extends: cc.Component,

    properties: {
        word: {displayName: "提示语", default: null, type: cc.Label},

    },


    onLoad() {

    },

    start() {

    },
    runLogAction(str) {
        this.word.string = str;
        let delay = cc.delayTime(2);
        let remove = cc.removeSelf(true);//从父节点移除自身。

        let seq = cc.sequence([delay, remove]);
        this.node.runAction(seq);
    },

    // update (dt) {},
});
