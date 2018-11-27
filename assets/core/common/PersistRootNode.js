/**
 * @author https://github.com/ShawnZhang2015/CreatorPrimer
 * @copyright 2018-10-22 15:08:22 javendev@126.com 
 * @description 常驻节点组件
 */



cc.Class({
    extends: cc.Component,

    start() {
        if (!cc.game.isPersistRootNode(this.node)) {
            cc.game.addPersistRootNode(this.node);
        }
    },
});