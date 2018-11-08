cc.Class({
    extends: cc.Component,

    properties: {
        logNode: {displayName: "log节点", default: null, type: cc.Node},
        logItem: {displayName: "item", default: null, type: cc.Prefab},

    },


    onLoad() {

    },

    start() {

    },
    addLog(str) {
        let item = cc.instantiate(this.logItem);
        this.logNode.addChild(item);
        let script = item.getComponent('LogViewItem');
        if(script){
            script.runLogAction(str);
        }
    }

    // update (dt) {},
});
