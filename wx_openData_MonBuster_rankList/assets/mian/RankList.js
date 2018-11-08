let Util = require("Util");
cc.Class({
    extends: cc.Component,

    properties: {
        contentNode: {displayName: "内容节点", default: null, type: cc.Node},
        rankListItem: {displayName: "子预制体", default: null, type: cc.Prefab},

        //玩家个人信息
        levelSign: {displayName: "是否上榜", default: null, type: cc.Label},
        headSprite: {displayName: "头像", default: null, type: cc.Sprite},
        nickname: {displayName: "昵称", default: null, type: cc.Label},
        userLevel: {displayName: "玩家当前等级", default: null, type: cc.Label},

    },


    onLoad() {
    },
    start() {
        let self = this;
        if (window.wx) {
            wx.onMessage(data => {
                switch (data.message) {
                    case 'FriendRankList' ://开始显示好友排行榜
                        self._showFriendRankList();
                        break;
                    case "setUserStorage"://存储好友数据
                        self._setUserStorage(data.storageData);
                        break;
                    default:
                        console.log("向子域发送的消息体 异常", data.message);
                }

            });
        }
    },
    //存储好友数据
    _setUserStorage(data) {
        let recData = JSON.parse(data);
        if (window.wx != undefined) {
            let kvDataList = [
                {key: 'MonBuster_MaxScore', value: recData["levelInfo"]},
                {key: 'MonBuster_TotalStar', value: recData["totalStar"].toString()}
            ];
            wx.setUserCloudStorage({KVDataList: kvDataList});
        }
    },


    //获取好友排行
    _showFriendRankList() {
        console.log("获取好友排行");
        let self = this;
        //获取当前用户托管数据当中对应 key 的数据
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: function (mySelfInfo) {
                console.log("获取当前用户托管数据", mySelfInfo);
                //拉取当前用户所有同玩好友的托管数据
                wx.getFriendCloudStorage({
                    keyList: ['MonBuster_MaxScore', 'MonBuster_TotalStar'],
                    complete: function (res) {
                        console.log('拉取当前用户所有同玩好友的托管数据', res);
                        self._TraverseItemPage(mySelfInfo.data[0], res.data);
                    }
                })
            }
        })
    },

    //遍历展示数据
    _TraverseItemPage(mySelfInfo, arrayList) {
        //手动排序
        this.sortList(arrayList, false);
        //便利好友信息
        this.contentNode.removeAllChildren();
        for (let k = 0; k < arrayList.length; k++) {
            let item = cc.instantiate(this.rankListItem);
            let script = item.getComponent('RankListItem');
            if (script) {
                script.setRankListItemData(k + 1, arrayList[k]);
            }
            this.contentNode.addChild(item);
            if (arrayList[k].nickname === mySelfInfo.nickName && arrayList[k].avatarUrl === mySelfInfo.avatarUrl) {
                //说明这条数据是自己的
                console.log("排行榜展示自己的数据", k + 1, arrayList[k]);
                this._initMyselfInfo(k + 1, arrayList[k]);
            }
        }
    },

    //初始化自己的数据
    _initMyselfInfo(rank, data) {
        if (parseInt(rank) < 101) {
            this.levelSign.string = "上榜";
        } else {
            this.levelSign.string = "未上榜";
        }
        // 远程 url 带图片后缀名
        let remoteUrl = data.avatarUrl;
        Util.loadRemoteSprite(remoteUrl, this.headSprite.node);
        this.nickname.string = data.nickname ? (data.nickname).slice(0, 5) : "";
        this.userLevel.string = this.userLevel.string = data.KVDataList[0].value;
    },

    sortList(ListData, order) { //排序(ListData：res.data;order:false降序，true升序)
        ListData.sort(function (a, b) {
            let AMaxScore = 0;
            let KVDataList = a.KVDataList;
            for (let i = 0; i < KVDataList.length; i++) {
                if (KVDataList[i].key == "MonBuster_TotalStar") {
                    AMaxScore = parseInt(KVDataList[i].value);
                }
            }
            let BMaxScore = 0;
            KVDataList = b.KVDataList;
            for (let i = 0; i < KVDataList.length; i++) {
                if (KVDataList[i].key == "MonBuster_TotalStar") {
                    BMaxScore = parseInt(KVDataList[i].value);
                }
            }
            if (order) {
                return parseInt(AMaxScore) - parseInt(BMaxScore);
            } else {
                return parseInt(BMaxScore) - parseInt(AMaxScore);
            }
        });
        return ListData;
    }


})
;
