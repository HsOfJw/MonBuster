/**
 * @author Javen 
 * @copyright 2018-10-26 16:13:11 javendev@126.com 
 * @description 自定义组件
 */

cc.Class({
    extends: cc.Component,
    start() {
        try {
            this._webSocket = cc.find("WebSocket").getComponent("WebSocket");
        } catch (error) {}
    }
});