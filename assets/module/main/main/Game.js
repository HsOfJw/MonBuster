/**
 * 游戏核心逻辑
 */
let Util = require("Util");
let ImageUtil = require("ImageUtil");
let JsonFileMgr = require("JsonFileMgr");
let GameData = require("GameData");
let Tips = require("Tips");
let GameScheduleData = require("GameScheduleData");
let AudioMgr = require("AudioMgr");
let Wx_netSocketMgr = require("Wx_netSocketMgr");
let Observer = require("Observer");
let ObserverMgr = require("ObserverMgr");
cc.Class({
    extends: Observer,

    properties: {
        lineItemPre: {displayName: "行预制体", default: null, type: cc.Prefab},//tag==51

        pumpkinItem: {displayName: "南瓜普通预制体", default: null, type: cc.Prefab},//tag==1
        stoneItem: {displayName: "石头普通预制体", default: null, type: cc.Prefab},//tag==2
        pumpkin_up: {displayName: "上升南瓜", default: null, type: cc.Prefab},//tag==11

        assistLine: {displayName: "辅助线", default: null, type: cc.Node},


        //四个button
        touchAreaButton_0: {displayName: "按钮_0", default: null, type: cc.Node},
        touchAreaButton_1: {displayName: "按钮_1", default: null, type: cc.Node},
        touchAreaButton_2: {displayName: "按钮_2", default: null, type: cc.Node},
        touchAreaButton_3: {displayName: "按钮_3", default: null, type: cc.Node},


        addNode: {displayName: "添加内容节点", default: null, type: cc.Node},
    },

    onLoad() {
        this.assistLine.y = 421;
        //创建节点池
        this.mapIndex = 0;
        this.LinePreMap = new Map();

        //对象池
        this.lineItemNodePool = new cc.NodePool();
        this.pumpkinNodePool = new cc.NodePool();
        this.StoneNodePool = new cc.NodePool();
        this.pumpkinUPNodePool = new cc.NodePool();
        this.contiuneCrete = true;
        this.contiuneCreteIndex = 0;
        //控制辅助线移动
        if (GameData.playInfo.friendPk_level !== 11) {
            this._moveAssistLine();
        }

        //游戏进行过程中 设置掉落速度
        this.scheduleOnce(function () {
            this._modifyLinePreDropSpeed(1);//第一次改变速度
        }, GameScheduleData.timeInterval_1);

        if (GameScheduleData.timeInterval_2 !== 0) {
            this.scheduleOnce(function () {
                this._modifyLinePreDropSpeed(2);//第二次改变速度
            }, GameScheduleData.timeInterval_2);
        }
        this.gameOver = false;

        //好友对战中 向服务器发送实时位置
        this.node.on("child-removed", function () {//监听回收节点
            if (GameData.playInfo.friendPk_level === 11) {
                let linePreMapCount = this.LinePreMap.size;
                let sendData = {
                    user_id: GameData.playInfo.uid,
                    owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
                    message: 491 - linePreMapCount * GameScheduleData.customVec_y,
                };

                Wx_netSocketMgr.sendMsg(3, sendData);//发送实时位置
            }

        }.bind(this));
        this.node.on("child-added", function () {//监听添加节点
            if (GameData.playInfo.friendPk_level === 11) {
                let linePreMapCount = this.LinePreMap.size;
                let sendData = {
                    user_id: GameData.playInfo.uid,
                    owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
                    message: 491 - linePreMapCount * GameScheduleData.customVec_y,
                };
                Wx_netSocketMgr.sendMsg(3, sendData);//发送实时位置
            }
        }.bind(this));

        //设置按钮的监听
        this._listeningCreatePumpkin_uo_button();

        //注册消息体
        this._initMsg();

        //设置碰撞检测的下节点的offset_y
        this.node._components[3]._offset.y -= GameData.gameConfigInfo.mobile_Vec_y;

        this.contiuneCrete = true;//是否开启计时
        this.contiuneCreteIndex = 0;
    },
    start() {
        //采用函数调用的方式 ，舍弃消息体
        MainData.Game = this;
    },

    _getMsgList() {
        return [
            "receiveOpponentPosition",//对手位置信息
            "opponentExitRoom"//对手退出房间
        ];
    },
    _onMsg(msg, data) {
        if (msg === "receiveOpponentPosition") {
            console.log("对手辅助线位置", data);
            this._moveOpponentAssistLine(data);
        } else if (msg === "opponentExitRoom") {
            if (GameData.opponentInfo.opponentExitRoom) {

            } else {
                GameData.opponentInfo.opponentExitRoom = true;

                Tips.show("检测到对手掉线,系统正对其进行重新连接");

                /*this.unschedule(this._moveSchedule);
                this.scheduleOnce(function () {
                    cc.director.loadScene("FriendPk_victory");
                }, 1.5);*/
            }
        }
    },
    //设置四个按钮的监听
    _listeningCreatePumpkin_uo_button() {
        //第一个按钮
        this.touchAreaButton_0.on('touchstart', function (event) {
            if (this.customToucuId) {

            } else {
                this.customToucuId = event.getID;
                this.onBtnClickTouchAreaButton(0);
            }

        }.bind(this));
        this.touchAreaButton_0.on('touchend', function (event) {
            this.customToucuId = null;

        }.bind(this));
        this.touchAreaButton_0.on('touchcancel', function (event) {
            this.customToucuId = null;
        }.bind(this));
        //第二个按钮
        this.touchAreaButton_1.on('touchstart', function (event) {
            if (this.customToucuId) {
            } else {
                this.customToucuId = event.getID;
                this.onBtnClickTouchAreaButton(1);
            }

        }.bind(this));
        this.touchAreaButton_1.on('touchend', function (event) {
            this.customToucuId = null;

        }.bind(this));
        this.touchAreaButton_1.on('touchcancel', function (event) {
            this.customToucuId = null;
        }.bind(this));
        //第三个按钮
        this.touchAreaButton_2.on('touchstart', function (event) {
            if (this.customToucuId) {
            } else {
                this.customToucuId = event.getID;
                this.onBtnClickTouchAreaButton(2);
            }

        }.bind(this));
        this.touchAreaButton_2.on('touchend', function (event) {
            this.customToucuId = null;

        }.bind(this));
        this.touchAreaButton_2.on('touchcancel', function (event) {
            this.customToucuId = null;
        }.bind(this));
        //第四个按钮
        this.touchAreaButton_3.on('touchstart', function (event) {
            if (this.customToucuId) {
            } else {
                this.customToucuId = event.getID;
                this.onBtnClickTouchAreaButton(3);
            }

        }.bind(this));
        this.touchAreaButton_3.on('touchend', function (event) {
            this.customToucuId = null;
        }.bind(this));
        this.touchAreaButton_3.on('touchcancel', function (event) {
            this.customToucuId = null;
        }.bind(this));


    },

    //移动 对手 辅助线
    _moveOpponentAssistLine(data) {
        this.assistLine.y = data;
    },

    //手动加速
    onBtnClickModifyLinePreDropSpeed() {
        //this._modifyLinePreDropSpeed(1);
    },
    //手动加行
    onBtnClickAddLinePreNum() {
        //this.addLinePreNum(1);
    },

    //展示我 的操作给对方添加的行数
    controllerLinePreAssistLine(num) {
        this.assistLine.y -= num * GameScheduleData.customVec_y;
        Tips.show("给对方+" + num + "行");
    },

    // 设置掉落速度
    _modifyLinePreDropSpeed(times) {
        this.contiuneCrete = false;
        this._modifyLinePreDropSpeed_subsequentProcessing();

        let addSpeed = 0;
        switch (times) {
            case 1:
                addSpeed = parseFloat(GameScheduleData.addSpeed_1);
                break;
            case 2:
                addSpeed = parseFloat(GameScheduleData.addSpeed_2);
                break;
            case 3:
                addSpeed = parseFloat(GameScheduleData.addSpeed_3);
                break;
            default:
                console.log("***********------------------->[Game] _modifyLinePreDropSpeed 设置掉落速度 游戏判定出现异常，times 出现错误", times);
        }
        GameScheduleData.initDropSpeed += addSpeed;
        let floatNum = (GameScheduleData.initDropSpeed).toFixed(2);

        GameScheduleData.initDropSpeed = parseFloat(floatNum);
        let downDistance = GameScheduleData.setPumpDownDistance(GameScheduleData.initDropSpeed);

        GameScheduleData.pumpkinDownDistance = downDistance;
        Tips.show("注意：掉落速度增加");

        this.contiuneCrete = true;
        this.contiuneCreteIndex = 0;
        //this.schedule(this._addItemToContent, GameScheduleData.initDropSpeed);

    },

    //游戏速度增加后 进行的后续处理
    _modifyLinePreDropSpeed_subsequentProcessing() {
        let highest_y = this._getHighestY();
        let remainder = parseInt(highest_y % GameScheduleData.customVec_y) + GameScheduleData.customVec_y;
        let count = parseInt(highest_y / GameScheduleData.customVec_y);
        if (count >= 1) {
        }
        //移动所有的行预制体
        for (let [k, v] of this.LinePreMap) {
            //let moveAction1 = cc.moveBy(0.01, cc.p(0, -(count * GameScheduleData.customVec_y + remainder)));
            //v.runAction(moveAction1);
            v.y -= (count * GameScheduleData.customVec_y + remainder);
        }
        //添加行预制体
        this._addItemToContent();
    },


    //获取当前行预制体 最高的 y坐标 排除0
    _getHighestY() {
        let highestLinePreVec_Y = -1123;
        for (let [k, v] of this.LinePreMap) {
            if (v.childrenCount === 3) {
                if (v.y >= highestLinePreVec_Y) {
                    highestLinePreVec_Y = v.y;
                }
            }
        }
        if (highestLinePreVec_Y === -1123) {
            //说明当前map中无行预制体
            highestLinePreVec_Y = 0;
        }
        return parseInt(highestLinePreVec_Y);
    },

    //加行操作  改变加行操作  设计模式
    addLinePreNum(num) {
        this.contiuneCrete = false;
        for (let i = 0; i < num; i++) {
            let highest_y = this._getHighestY();
            let remainder = parseInt(highest_y % GameScheduleData.customVec_y) + GameScheduleData.customVec_y;
            let count = parseInt(highest_y / GameScheduleData.customVec_y);
            if (count >= 1) {
                console.log("加行操作中 最高位位置异常  求出的最高y坐标为", highest_y);
            }
            //移动所有的行预制体
            for (let [k, v] of this.LinePreMap) {
                //let moveAction = cc.moveBy(0.01, cc.p(0, -(count * GameScheduleData.customVec_y + remainder)));
                //v.runAction(moveAction);
                v.y -= count * GameScheduleData.customVec_y + remainder;
            }
            //添加行预制体
            this._addItemToContent();
        }
        this.contiuneCrete = true;
        this.contiuneCreteIndex = 0;
    },
    //移动辅助线
    _moveAssistLine() {
        this.moveIndex = 0;
        this.randomArray = JsonFileMgr.getCurrentLevelRobotItem(GameData.playInfo.currentLevel);
        //console.log("取出来的机器人数据", this.randomArray);
        this.schedule(this._moveSchedule, 1, cc.macro.REPEAT_FOREVER, GameScheduleData.initDropSpeed);
    },

    _moveSchedule() {
        let distanceY = this.randomArray[this.moveIndex];
        //console.log("取出来的配表数据", distanceY);
        let num = Math.abs(parseInt(distanceY));
        if (num > 1) {
            this.addLinePreNum(num - 1);
            Tips.show("对方给你+" + (num - 1) + "行");

        }
        this.assistLine.y -= (distanceY * GameScheduleData.customVec_y);
        if (this.assistLine.y > 400) {
            this.assistLine.y = 400;
        }
        if (this.moveIndex == this.randomArray.length - 1) {
            console.log("[Game] 终止移动对手的辅助线");
            this.unschedule(this._moveSchedule);

        }
        this.moveIndex++;
    },
    //替换石头的纹理
    replaceStoneSpriteFrame(parentNode) {
        for (let k = parentNode.childrenCount - 1; k >= 0; k--) {
            let childNode = parentNode.children[k];
            let childNodeName = childNode.name;
            if (childNodeName == "Stone") {
                let sprite = childNode.getChildByName('stone').getComponent(cc.Sprite);
                let url = "texture/stoneMonster_1";
                //替换纹理
                ImageUtil.setImg(sprite, url);
            }
        }
    },
    //向自定义的父节点中   添加子节点
    addPumpkinToLinePre(receiveData) {
        let tag = receiveData.posTag;
        let replaceParentNode = receiveData.replaceParentNode;

        let vecX = this._getPosByTag(tag);
        let pumpkin = this._createPumpkinPre();
        pumpkin.setPosition(vecX, 0);
        replaceParentNode.addChild(pumpkin, pumpkin.zIndex, tag);
    },
    // 添加行节点
    createLinePreAndAddChild(receiveData) {
        let collisionNode = receiveData.collisionNode;//被碰撞的节点信息
        let collisionNodeTag = receiveData.tag;
        let vecX = this._getPosByTag(collisionNodeTag);//在父节点中的x坐标


        //创建行预制体
        let lineItem = this._createLinePre();
        lineItem.setPosition(0, collisionNode.y - GameScheduleData.customVec_y);
        lineItem.blood = 1;
        //创建南瓜
        let pumpkin = this._createPumpkinPre();
        pumpkin.tag = collisionNodeTag;
        pumpkin.setPosition(vecX, 0);

        lineItem.addChild(pumpkin, pumpkin.zIndex, collisionNodeTag);
        lineItem.mapIndex = this.mapIndex;
        this.node.addChild(lineItem);
        this.LinePreMap.set(this.mapIndex, lineItem);
        this.mapIndex++;
    },
    // 回收普通的预制体
    recycleLineItem(node) {
        //播放音效
        AudioMgr.playBlastMusic();
        node.getComponent(cc.BoxCollider).tag = 88;
        //设置监听
        node.on("child-removed", function () {
            if (node.childrenCount === 0) {
                this.lineItemNodePool.put(node);
            }
        }.bind(this));

        this.LinePreMap.delete(node.mapIndex);
        let normalLowestPre_y = 0;
        //取当前预制体 最低的位置  为后续异常节点做准备
        for (let [k, v] of this.LinePreMap) {
            if (v.childrenCount == 3) {
                if (v.y <= normalLowestPre_y) {
                    normalLowestPre_y = v.y;
                }
            }
            //消除 中间空一行的问题
            if (v.y < node.y && v.childrenCount === 3) {
                //let moveAction = cc.moveBy(0.01, cc.p(0, GameScheduleData.customVec_y));
                //v.runAction(moveAction);
                v.y += GameScheduleData.customVec_y;
            }
        }

        // 回收完成之后 调整自定义的行预制体的高度
        for (let [k, v] of this.LinePreMap) {
            if (v.childrenCount < 3) {//代表自定义的节点
                if (v.y >= normalLowestPre_y) {
                    //回收此节点
                    this.LinePreMap.delete(k);
                    v.destroy();
                    console.log("！！！！！！！！！！！！！！！！！！！！！！！！！出现异常节点信息，程序已进行销毁");
                } else {
                    //let moveAction = cc.moveBy(0.01, cc.p(0, GameScheduleData.customVec_y));
                    //v.runAction(moveAction);
                    v.y += GameScheduleData.customVec_y;
                }
            }
        }

        //循环回收
        for (let k = node.childrenCount - 1; k >= 0; k--) {
            let childNode = node.children[k];
            let childNodeName = childNode.name;
            switch (childNodeName) {
                case 'Stone':
                    let sprite = childNode.getChildByName('stone').getComponent(cc.Sprite);
                    let url = "texture/stoneMonster";
                    //替换纹理
                    ImageUtil.setImg(sprite, url);

                    //播放动画
                    let stoneNode = childNode.getChildByName("stone");
                    stoneNode.active = false;
                    let dragonNode = childNode.getChildByName("dragonNode");
                    dragonNode.active = true;

                    let ske = dragonNode.getComponent(sp.Skeleton);
                    //设置动画播放完成后的监听
                    ske.setCompleteListener(function () {
                        this.StoneNodePool.put(childNode);
                    }.bind(this));

                    ske.clearTracks();//清理所有播放队列的动画
                    ske.setAnimation(0, "animation", false);
                    break;
                case 'Pumpkin_down':
                    //播放动画
                    let dragonNode_pumpkin = childNode.getChildByName("dragonNode");

                    let pumpkin = childNode.getChildByName("Pumpkin");
                    pumpkin.active = false;

                    dragonNode_pumpkin.active = true;
                    let sp_pumpkin = dragonNode_pumpkin.getComponent(sp.Skeleton);

                    sp_pumpkin.setCompleteListener(() => {
                        this.pumpkinNodePool.put(childNode);
                    });
                    sp_pumpkin.clearTracks();//清理所有播放队列的动画
                    sp_pumpkin.setAnimation(0, "animation", false);
                    break;
                default :
                    console.log("*************------------>行预制体的子节点信息异常，子节点信息为", childNodeName);
                    break;
            }
        }

    },
    // 碰撞检测 77:行预制体    200:上节点  150:辅助线
    onCollisionEnter(other, self) {
        if (other.tag === 77 && self.tag === 100 && !this.gameOver) {
            this.gameOver = true;
            this.contiuneCrete = false;
            this.unschedule(this._moveSchedule);
            if (GameData.playInfo.friendPk_level !== 11) {
                this.unscheduleAllCallbacks();
                ObserverMgr.dispatchMsg(GameMsgGlobal.mainScene.failLayer, null);
            } else {
                //好友对战
                cc.director.loadScene("FriendPk_failed");
                //通知服务器 本关卡失败
                let sendData = {
                    user_id: GameData.playInfo.uid,
                    owner: GameData.gameConfig.inviteUid ? GameData.gameConfig.inviteUid : GameData.playInfo.uid,
                    message: 1,
                };
                Wx_netSocketMgr.sendMsg(4, sendData);//游戏失败
            }
        } else if (other.tag === 11 && self.tag === 200) {
            this.pumpkinUPNodePool.put(other.node);
        } else if (other.tag === 150 && self.tag === 100 && !this.gameOver) {
            if (GameData.playInfo.friendPk_level !== 11) {
                this.gameOver = true;
                this.contiuneCrete = false;
                this.unscheduleAllCallbacks();
                ObserverMgr.dispatchMsg(GameMsgGlobal.mainScene.victoryLayer, null);
            } else {

            }
        }
    },

    //此按钮点击 从下方生成一个南瓜
    onBtnClickTouchAreaButton(customEventData) {
        let vecX = this._getPosByTag(customEventData);
        let pumpkinItem = this._createPumpkinUpPre();
        pumpkinItem.setPosition(vecX, -1200 - GameData.gameConfigInfo.mobile_Vec_y);
        pumpkinItem.posIndex = parseInt(customEventData);
        let script = pumpkinItem.getComponent("Pumpkin_up");
        if (script) {
            script.initPumpkinData();
        }
        this.node.addChild(pumpkinItem);
    },
    //添加一行预制体  可以手动设置位置
    _addItemToContent(vec) {
        let item = this._createLinePre();
        if (typeof vec === "object") {
            item.setPosition(0, vec.y);
        }
        item.removeAllChildren();
        let randomNUm = Util.randomNum(16);
        let lineIndex = randomNUm % 2;
        let emptyIndex = (randomNUm + Math.floor(Math.random() * 15)) % 4;//空格的位置
        if (lineIndex === 0) {//创建南瓜
            if (this.currentCreateEmpty) {
                //说明上一次创建的是石头
                if (emptyIndex === (this.currentCreateEmpty - 1)) {
                    //说明相等
                    emptyIndex = (emptyIndex + 1) === 4 ? 0 : emptyIndex + 1;
                }
            }
            this.currentCreateEmpty = 0;
            for (let i = 0; i < 4; i++) {
                let pumpkinItem = null;
                if (i !== emptyIndex) {
                    pumpkinItem = this._createPumpkinPre();
                    pumpkinItem.setPosition(-281.25 + 188.5 * i, 0);
                    item.addChild(pumpkinItem, pumpkinItem.zIndex, i);
                }
            }
            //赋予节点特殊信息
            item.blood = 1;
        } else if (lineIndex === 1) {//创建石头
            this.currentCreateEmpty = emptyIndex + 1;
            //目前的需求是  创建石头  不允许上面创建的南瓜  的空格位是 当前石头行的空格位相同
            for (let i = 0; i < 4; i++) {
                let stoneItem = null;
                if (i !== emptyIndex) {
                    stoneItem = this._createStonePre();
                    stoneItem.setPosition(-281.25 + 188.5 * i, 0);
                    item.addChild(stoneItem, stoneItem.zIndex, i);
                }
            }
            //赋予节点特殊信息
            item.blood = 2;
        } else {
        }
        item.mapIndex = this.mapIndex;
        if (item.childrenCount !== 3) {
        }
        this.node.addChild(item);
        this.LinePreMap.set(this.mapIndex, item);
        this.mapIndex++;
    },
    //创建行预制体
    _createLinePre() {
        let lineItem = null;
        if (this.lineItemNodePool.size() == 0) {
            lineItem = cc.instantiate(this.lineItemPre);
        } else {
            lineItem = this.lineItemNodePool.get();
        }
        lineItem.setPosition(cc.p(0, 0));
        lineItem.getComponent(cc.BoxCollider).tag = 77;

        return lineItem;
    },
    //创建上升的南瓜预制
    _createPumpkinUpPre() {
        let pumpkinUPItem = null;
        if (this.pumpkinUPNodePool.size() === 0) {
            pumpkinUPItem = cc.instantiate(this.pumpkin_up);
        } else {
            pumpkinUPItem = this.pumpkinUPNodePool.get();
        }
        pumpkinUPItem.isOver = false;
        return pumpkinUPItem;
    },

    //创建南瓜预制体(普通)
    _createPumpkinPre() {
        let pumpkinItem = null;
        if (this.pumpkinNodePool.size() === 0) {
            pumpkinItem = cc.instantiate(this.pumpkinItem);
        } else {
            pumpkinItem = this.pumpkinNodePool.get();
        }
        let Pumpkin = pumpkinItem.getChildByName("Pumpkin");
        Pumpkin.active = true;
        let dragonNode = pumpkinItem.getChildByName("dragonNode");
        dragonNode.active = false;
        return pumpkinItem;
    },
    //创建石头预制体
    _createStonePre() {
        let stoneItem = null;
        if (this.StoneNodePool.size() == 0) {
            stoneItem = cc.instantiate(this.stoneItem);
        } else {
            stoneItem = this.StoneNodePool.get();
        }
        let stone = stoneItem.getChildByName("stone");
        stone.active = true;
        let dragonNode = stoneItem.getChildByName("dragonNode");
        dragonNode.active = false;
        return stoneItem;
    },
    //根据tag 判定位置
    _getPosByTag(tag) {
        let posX = "";
        switch (parseInt(tag)) {
            case 0:
                posX = -281.25;
                break;
            case 1:
                posX = -92.75;
                break;
            case 2:
                posX = 95.75;
                break;
            case 3:
                posX = 284.25;
                break;
            default:
                console.log("***********------------------->直接碰撞到南瓜或者石头 取到的tag 异常", tag);
        }
        return posX;
    },
    update(dt) {
        if (this.contiuneCrete) {
            this.contiuneCreteIndex++;
            if (this.contiuneCreteIndex > GameScheduleData.initDropSpeed * 60) {
                this._addItemToContent();
                this.contiuneCreteIndex = 0;
            }
        }


    },
});
