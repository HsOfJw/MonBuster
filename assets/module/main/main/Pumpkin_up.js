/**
 * 上升的南瓜预制体
 */
cc.Class({
    extends: cc.Component,

    properties: {},
    onLoad() {
    },
    initPumpkinData() {
        this.unableUpdate = false;//不能上升
        this.previousCollisionNodeInfo = null;
        this.upPumpkinNodeUnableNextGo = false;
        this.continuousRecycleLinePre = 0;
    },

    //给对方添加行
    _addLinePreNum(msg) {
        if (msg == "recycleLineItem") {
            this.continuousRecycleLinePre++;
        } else {
            if (this.continuousRecycleLinePre > 1) {
                let addLinePreNum = this.continuousRecycleLinePre - 1;
                MainData.Game.controllerLinePreAssistLine(addLinePreNum);
            }
            this.continuousRecycleLinePre = 0;
        }
    },


    //碰撞检测
    onCollisionEnter(other, self) {
        if (other.tag === 77 && !self.node.isOver) {
            //console.log("-------------> 开始碰撞 初始化数据为" );
            let tag = self.node.posIndex;
            let collisionNode = other.node.getChildByTag(tag);
            if (collisionNode) {
                //回收上升的南瓜节点
                this.unableUpdate = true;//此节点不再接受碰撞
                self.node.isOver = true;
                MainData.Game.pumpkinUPNodePool.put(self.node);

                this._addLinePreNum("others");

                if (this.upPumpkinNodeUnableNextGo) {//说明之前碰撞到预制体的空节点
                    //console.log("碰撞到障碍物之前回收行预制体，此时不做任何处理 ");
                } else if (this.previousCollisionNodeInfo) {
                    //console.log("碰撞到障碍物之前穿过行预制体，执行替换操作 被替换的子节点数量和 坐标", this.previousCollisionNodeInfo.childrenCount, this.previousCollisionNodeInfo.y);
                    let sendDate = {};
                    sendDate.posTag = tag;
                    sendDate.replaceParentNode = this.previousCollisionNodeInfo;
                    MainData.Game.addPumpkinToLinePre(sendDate);
                    this._addLinePreNum("others");
                } else {//直接碰撞到预制体 执行加行操作
                    //console.log("直接碰撞到障碍物，执行加行操作");
                    let receiveData = {};
                    receiveData.collisionNode = other.node;
                    receiveData.tag = tag;

                    MainData.Game.createLinePreAndAddChild(receiveData);
                    this._addLinePreNum("others");
                }
               // console.log("南瓜历险记 宣告结束 ------------->");
            } else {  //碰撞的是空
                if (other.node.childrenCount === 3) {
                    //console.log("穿过预制体，开始回收此行节点");
                    if (other.node.blood === 1) {
                        MainData.Game.recycleLineItem(other.node);
                        this._addLinePreNum("recycleLineItem");
                    } else if (other.node.blood === 2) {
                        //替换石头体预制的纹理
                        MainData.Game.replaceStoneSpriteFrame(other.node);
                        this._addLinePreNum("others");
                        other.node.blood = 1;
                    }
                    //先消除 再碰撞到障碍物    此时南瓜 已经 无法再进行碰撞
                    this.upPumpkinNodeUnableNextGo = true;
                } else {//节点数量不为3  此种情况下 不做处理
                    //console.log("穿过行预制体，保留节点信息");
                    // 说明 碰撞过  手动添加的行 预制体
                    this.previousCollisionNodeInfo = other.node;
                }
            }
        }
    },
    update(dt) {
        if (!this.unableUpdate) {
            this.node.y += 55;
        }
    },
});
