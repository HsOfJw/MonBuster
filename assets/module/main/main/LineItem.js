let GameScheduleData = require("GameScheduleData");
cc.Class({
    extends: cc.Component,

    properties: {},
    onLoad() {
    },
    update(dt) {
        this.node.y -= GameScheduleData.pumpkinDownDistance;
    },
});
