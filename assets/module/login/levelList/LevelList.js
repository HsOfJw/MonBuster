cc.Class({
    extends: cc.Component,

    properties: {
        contentNode: {displayName: "内容节点", default: null, type: cc.Node},
        LevelListItem: {displayName: "子预制体", default: null, type: cc.Prefab},
    },
    onLoad() {
        this._initPage();
    },
    _initPage() {
        this.contentNode.removeAllChildren();
        for (let k = 1; k < 11; k++) {
            let LevelListItem = cc.instantiate(this.LevelListItem);
            let script = LevelListItem.getComponent("LevelListItem");
            if (script) {
                script.setLevelListItemData(k);
            }
            this.contentNode.addChild(LevelListItem);
        }
    },

    // update (dt) {},
});
