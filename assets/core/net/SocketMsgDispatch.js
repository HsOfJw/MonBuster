/**
 *  dispatch socket response
 */
let ObserverMgr = require("ObserverMgr");
module.exports = {
    dealSocketMagDispatch: function (recData) {
        let id = parseInt(recData.type);
        let data = recData.data;
        switch (id) {
            case  1://玩家已经准备好
                ObserverMgr.dispatchMsg("playerReady_ok", data);
                break;
            case 2://发送对手辅助线位置
                ObserverMgr.dispatchMsg("receiveOpponentPosition", data);
                break;
            case 3://对手游戏失败
                ObserverMgr.dispatchMsg("opponent_gameOver", data);
                break;
            case 4://对手不在线 对手离开房间
                ObserverMgr.dispatchMsg("opponentExitRoom", data);
                break;

            case 5://房间已满
                ObserverMgr.dispatchMsg("roomFull", data);
                break;
            //开始再来一局
            case 10://
                ObserverMgr.dispatchMsg("inviteSuccess", data);
                break;
            case 6://被邀请人 弹框
                ObserverMgr.dispatchMsg("dialog_invitePage", data);
                break;
            case 7://玩家拒绝
                ObserverMgr.dispatchMsg("dialog_opponent_cancel", data);
                break;
            default:

                break;
        }
    }
    ,

}
;