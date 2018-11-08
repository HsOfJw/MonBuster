let GameData = require("GameData");
let Tips = require("Tips");
let Util = require("Util");
cc.Class({
    extends: cc.Component,

    properties: {
        ladderScrollView: {displayName: "天梯排行", default: null, type: cc.ScrollView},
        ladderContent: {displayName: "天梯排行内容节点", default: null, type: cc.Node},
        rankListItem: {displayName: "天梯排行子预制体", default: null, type: cc.Prefab},

        //玩家信息
        levelSign: {displayName: "是否上榜", default: null, type: cc.Label},

        headFrame: {displayName: "头像frame", default: null, type: cc.Sprite},
        headSprite: {displayName: "头像", default: null, type: cc.Sprite},
        nickname: {displayName: "昵称", default: null, type: cc.Label},
        userLevel: {displayName: "玩家当前等级", default: null, type: cc.Label},

        display: {displayName: "好友排行榜纹理", default: null, type: cc.Sprite},
        userInfo: {displayName: "个人信息", default: null, type: cc.Node},

    },
    onLoad() {
        this.sendQuestToGetLadderData();
        this.onBtnClickLadderRankList();
        this.updateFrameRate = 0;
        this.setBannerInfo();
    },
    start() {
        this._isShow = true;
        this.tex = new cc.Texture2D();
    },
    //设置Banner 广告
    setBannerInfo() {
        if (window.wx != undefined) {

            let winSize = wx.getSystemInfoSync();
            console.log("winSize", winSize);
            let bannerHeight = 120;
            let bannerWidth = 421;
            this.bannerAd = wx.createBannerAd({
                adUnitId: 'adunit-a4fb536ae75837e9',
                style: {
                    left: 0,
                    top: winSize.windowHeight - bannerHeight,
                    width: bannerWidth
                }
            });
            this.bannerAd.onLoad(() => {

                console.log('[RankList]  banner 广告加载成功')
            });
            this.bannerAd.onError(err => {
                console.log("[rankList]  banner广告拉取失败 原因为", err)
            });
            this.bannerAd.show()
                .then(() => console.log('banner 广告显示'));
            //微信缩放后得到banner的真实高度，从新设置banner的top 属性
            this.bannerAd.onResize(res => {
                this.bannerAd.style.top = winSize.windowHeight - this.bannerAd.style.realHeight;
            });
        }
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
        if (window.wx !== undefined) {
            wx.postMessage({
                message: "FriendRankList",
            });
        }

    },
    //返回
    onBtnClickToBack() {
        this.bannerAd.destroy();
        cc.director.loadScene("HomePage");
    },
    //发送请求 获取世界排行榜数据
    sendQuestToGetLadderData() {
        let self = this;
        if (window.wx != undefined) {
            wx.request({
                url: 'https://gather.51weiwan.com/api/game/rankX',
                data: {
                    type: 1,
                    user_id: GameData.playInfo.uid,
                    game_id: 30,
                },
                success: function (res) {
                    if (res.data.errno == 0) {//返回结果正确
                        self._showLadderData(res.data.data);
                    } else {
                        console.log("服务器获取 世界排行返回信息错误");
                    }
                    console.log("服务器获取 世界排行返回相应数据", res);
                },
            });
        }
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
        this.headFrame.node.active = true;
        let self = this;
        if (parseInt(data.rank) < 101) {
            this.levelSign.string = "上榜";
        } else {
            this.levelSign.string = "未上榜";
        }

        // 远程 url 带图片后缀名
        let remoteUrl = data.avatar_url;
        Util.loadRemoteSprite(remoteUrl, this.headSprite.node);
        this.nickname.string = data.nickname ? (data.nickname).slice(0, 5) : "";
        this.userLevel.string = data.name + "x" + data.value + "星";
    },

    //查看群排行
    onBtnClickGroupOfRanking() {
        let self = this;
        let shareInfo = GameData.gameConfig.share;
        if (shareInfo['3']) {
            console.log("[VictoryLayer] 胜利页面分享取服务端数据", shareInfo['3']);
            let title = shareInfo['3'].info.share_title;
            let imageUrl = shareInfo['3'].info.share_img;

            if (window.wx != undefined) {
                window.wx.shareAppMessage({
                    title: title,
                    imageUrl: imageUrl,
                    query: "enterStyle=share&uid=" + GameData.playInfo.uid,
                    success: function (res) {
                        console.log("群排行分享成功 返回信息为", res);
                    }
                })
            }
        } else {
            console.log("分享取默认数据");
            if (window.wx != undefined) {
                window.wx.shareAppMessage({
                    title: "那一刻，我和南瓜精的距离只有0.001公分...",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400,
                    }),
                    query: "enterStyle=share&uid=" + GameData.playInfo.uid,
                    success: function (res) {
                        console.log("群排行页面分享成功 返回信息为", res);
                    }

                })

            }
        }
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
