let GameData = require("GameData");
let WxApi = require("WxApi");
cc.Class({
    extends: cc.Component,

    properties: {
        ladderScrollView: {displayName: "天梯排行", default: null, type: cc.ScrollView},
        ladderContent: {displayName: "天梯排行内容节点", default: null, type: cc.Node},
        rankListItem: {displayName: "天梯排行子预制体", default: null, type: cc.Prefab},

        //玩家信息
        levelSign: {displayName: "是否上榜", default: null, type: cc.Label},
        headSprite: {displayName: "头像", default: null, type: cc.Sprite},
        nickname: {displayName: "昵称", default: null, type: cc.Label},
        userLevel: {displayName: "玩家当前等级", default: null, type: cc.Label},

        display: {displayName: "好友排行榜纹理", default: null, type: cc.Sprite},
        userInfo: {displayName: "个人信息", default: null, type: cc.Node},

    },
    onLoad() {
        this._sendQuestToGetLadderData();
        this.onBtnClickLadderRankList();
        this.updateFrameRate = 0;
        this._setBannerInfo();
    },
    //设置Banner 广告
    _setBannerInfo() {
        if (GameData.gameConfigInfo.bannerAd) {
            GameData.gameConfigInfo.bannerAd.show();
        }
    },
    start() {
        this._isShow = true;
        this.tex = new cc.Texture2D();
    },

    //世界排名
    onBtnClickLadderRankList() {
        this._isShow = true;//关闭子域
        this.display.node.active = false;
        this.ladderScrollView.node.active = true;
        this.userInfo.active = true;
    },
    //好友排行榜
    onBtnClickFriendRankList() {
        this._isShow = false;//开启子域
        this.ladderScrollView.node.active = false;
        this.userInfo.active = false;
        this.display.node.active = true;
        // 发消息给子域
        WxApi.wx_postMessage({
            message: "FriendRankList",
        });
    },
    //返回
    onBtnClickToBack() {
        GameMsgGlobal.sceneDirect.HomePageDirect = "";
        cc.director.loadScene("HomePage");
    },
    //发送请求 获取世界排行榜数据
    _sendQuestToGetLadderData() {
        let url = "https://gather.51weiwan.com/api/game/rankX";
        let sendData = {
            type: 1,
            user_id: GameData.playInfo.uid,
            game_id: 30,
        };
        let sucFun = res => {
            if (res.data.errno === 0) {//返回结果正确
                this._showLadderData(res.data.data);
            }
        };
        WxApi.wx_request(url, sendData, sucFun);
    },
    //遍历展示数据
    _showLadderData(data) {
        let arrayData = data.rank;
        this.ladderContent.removeAllChildren();
        for (let k = 0; k < arrayData.length; k++) {
            let item = cc.instantiate(this.rankListItem);
            let script = item.getComponent('RankListItem');
            if (script) {
                script.setRankListItemData(k + 1, arrayData[k]);
            }
            this.ladderContent.addChild(item);
        }
        //展示自己的数据
        this._initMyselfInfo(data.user_info);
    },
    //初始化自己的数据
    _initMyselfInfo(data) {
        this.levelSign.string = parseInt(data.rank) < 101 ? "上榜" : "未上榜";
        // 远程 url 带图片后缀名
        let remoteUrl = data.avatar_url;
        WxApi.wx_createImage(remoteUrl, this.headSprite.node);
        this.nickname.string = data.nickname ? (data.nickname).slice(0, 5) : "";
        this.userLevel.string = data.name + "x" + data.value + "星";
    },

    //查看群排行
    onBtnClickGroupOfRanking() {
        let defaultTitle = "那一刻，我和南瓜精的距离只有0.001公分...";
        WxApi.wx_shareAppMessage(GameData.gameConfigInfo.share[3],)
    },
    _updateSubDomainCanvas() {
        //获取开放数据域
        let openDataContext = wx.getOpenDataContext();
        //开放数据域和主域共享的 sharedCanvas
        let sharedCanvas = openDataContext.canvas;
        //使用HTML元素初始化。 initWithElement
        this.tex.initWithElement(sharedCanvas);
        //纹理加载的事件处理程序。
        this.tex.handleLoadedTexture();
        this.display.spriteFrame = new cc.SpriteFrame(this.tex);
    },

    update() {
        if (!this._isShow) {
            this.updateFrameRate++;
            if (this.updateFrameRate > 12) {
                this.updateFrameRate = 0;
                this._updateSubDomainCanvas();
            }
        }


    }
});
