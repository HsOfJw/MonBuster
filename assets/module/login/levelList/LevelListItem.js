let GameData = require("GameData");
let JsonFileMgr = require("JsonFileMgr");
let Tips = require("Tips");
let ObserverMgr = require("ObserverMgr");
let AudioPlayer = require("AudioPlayer");
let AudioMgr = require("AudioMgr");
let WxApi = require("WxApi");
let BKTools = require("BKTools");
cc.Class({
    extends: cc.Component,

    properties: {
        id: {displayName: "id", default: null, type: cc.Label},
        bg: {displayName: "底图", default: null, type: cc.Sprite},
        levelHeadSprite: {displayName: "等级", default: null, type: cc.Sprite},
        starContent: {displayName: "星星底图", default: null, type: cc.Node},
        currentLevelNum: {displayName: "当前段位的人数", default: null, type: cc.Label},
        costGold: {displayName: "消耗金币", default: null, type: cc.Label},
        starPre: {displayName: "星星预制体", default: null, type: cc.Prefab},

        shadeBg: {displayName: "段位遮罩", default: null, type: cc.Node},
        treasure: {displayName: "宝箱", default: null, type: cc.Node},

        remainderNumLabel: {displayName: "除数", default: null, type: cc.Label},//满级后处理
    },
    onLoad() {
    },
    setLevelListItemData(data) {
        this.id.string = data;

        let rankLevelItem = JsonFileMgr.getRankLevelItem(data);
        if (rankLevelItem) {
            //加载不同等级的段位底图
            let bgUrl = "texture/levelItemBg/list_" + parseInt(rankLevelItem.magic);
            cc.loader.loadRes(bgUrl, cc.SpriteFrame, function (err, spriteFrame) {
                this.bg.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }.bind(this));
            //加载段位头衔
            let levelHeadUrl = "texture/rank/rank_" + data;
            cc.loader.loadRes(levelHeadUrl, cc.SpriteFrame, function (err, spriteFrame) {
                this.levelHeadSprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }.bind(this));

            //设置当前段位人数 进入段位花费的金币
            let currentLevelData = GameData.gameConfigInfo.levelInfo[data];
            let currentLevelNum = currentLevelData ? currentLevelData.count : 0;
            this.currentLevelNum.string = "当前段位" + currentLevelNum + "人";
            this.costGold.string = rankLevelItem.Cost;

            //判断是否显示遮罩
            let rankLevel = GameData.playInfo.currentLevel;
            let acceptAwardInfo = GameData.gameConfigInfo.acceptAwardInfo;
            let currentAwardData = acceptAwardInfo[parseInt(data) - 1];
            if (parseInt(data) > rankLevel) { //当前级别大于用户等级
                this.starContent.removeAllChildren();
                this.shadeBg.active = true;
            } else if (parseInt(data) === rankLevel) { //当前级别等于用户等级
                this.shadeBg.active = false;
                //加载星星底图
                let starNum = GameData.playInfo.currentStarNum;
                if (data === 10) {//满级状态
                    // 页面展示的X 后面的个数
                    let divideNum = parseInt(starNum / 5);
                    //余数  页面展示的星星个数
                    let num = parseInt(starNum % 5) === 0 ? 0 : parseInt(starNum % 5);
                    if (divideNum >= 1) {
                        this.remainderNumLabel.string = "X" + divideNum;
                    }
                    this.starContent.removeAllChildren();
                    for (let k = 0; k < num; k++) {
                        let starItem = cc.instantiate(this.starPre);
                        this.starContent.addChild(starItem);
                    }
                } else {
                    this.starContent.removeAllChildren();
                    for (let k = 0; k < starNum; k++) {
                        let starItem = cc.instantiate(this.starPre);
                        this.starContent.addChild(starItem);
                    }
                }
            } else {  //当前级别小于玩家等级
                if (currentAwardData) {
                    if (currentAwardData.is_draw === 0) {//未领取过
                        //代表未领取
                        this.shadeBg.active = true;
                    } else {
                        //代表已经领取  此段位不能点击
                        this.shadeBg.active = true;
                        this.treasure.active = false;
                    }
                    this.shadeBg.opacity = 150;
                    this.treasure.opacity = 2555;
                } else {
                    console.log("获取领取日志信息错误", currentAwardData);
                }
                // 填充星星
                this.starContent.removeAllChildren();
                for (let k = 0; k < 5; k++) {
                    let starItem = cc.instantiate(this.starPre);
                    this.starContent.addChild(starItem);
                }
            }
        } else {
            console.log('[LevelListItem ] setLevelListItemData 中取出的json数据不正确 ', rankLevelItem);
        }
    },
    //进入到游戏中
    onBtnClickGo() {

        if(cc.sys.platform==cc.sys.QQ_PLAY){
            //上报数据
            BKTools.uploa
            dScore(parseInt(this.id.string),function (code,res) {
                console.log("上报成功，接收到数据");
            });
        }


        if (cc.sys.isBrowser) {
            ObserverMgr.dispatchMsg(GameMsgGlobal.gameLoginScene.startMatching, null);
        }
        let id = this.id.string;
        let rankLevelItem = JsonFileMgr.getRankLevelItem(id);
        if (rankLevelItem) {
            let costGold = rankLevelItem.Cost;
            //向服务器发送请求
            let url = "https://gather.51weiwan.com/xxl/game/start";
            let sendData = {
                gold: costGold,
                user_id: GameData.playInfo.uid
            };
            let sucFun = res => {
                if (res.data.errno === 0) {
                    //进入到匹配页面
                    ObserverMgr.dispatchMsg(GameMsgGlobal.gameLoginScene.startMatching, null);
                } else {
                    Tips.show(res.data.errmsg);
                }
            };
            WxApi.wx_request(url, sendData, sucFun);
        } else {
            console.log("[LevelListItem] onBtnClickGo 读取配置信息错误")
        }
    },
    //领取奖励
    onBtnClickReceiveAward() {
        GameData.playInfo.acceptAwardLevel = this.id.string;
        ObserverMgr.dispatchMsg(GameMsgGlobal.gameLoginScene.showLevelAward, null);
    },


});
