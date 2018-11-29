/**
 * @author Javen 
 * @copyright 2018-10-20 16:45:24 javendev@126.com 
 * @description QQPlay 工具包
 */

var Global = require("./Global");
/**
 * 日志输出
 * BKTools.log("test1","test2");
 */
function log() {
    if (Global.isDebug) {
        for (let msg in arguments) {
            cc.log(arguments[msg]);
        }
    }
}

function shareToArk() {
    BK.Share.share({
        qqImgUrl: 'http://hudong.qq.com/docs/engine/img/848B76B5530AA7EE7B38E9A1267D7086.png',
        isToFriend: true,
        summary: '单渠道分享-By Javen',
        extendInfo: 'IJPay',
        success: function (succObj) {
            log('分享成功', succObj.code, JSON.stringify(succObj.data));
        },
        fail: function (failObj) {
            log('分享失败', failObj.code, JSON.stringify(failObj.msg));
        },
        complete: () => {
            log('分享完成，不论成功失败');
        }
    });
}

function share() {
    BK.Share.share({
        qqImgUrl: 'http://hudong.qq.com/docs/engine/img/848B76B5530AA7EE7B38E9A1267D7086.png',
        socialPicPath: 'GameRes://qrcode.png',
        title: '测试轻游戏',
        summary: '多渠道分享-By Javen',
        extendInfo: 'IJPay',
        success: function (succObj) {
            //{"reqCode":1,"ret":0,"gameId":3603,"aioType":1,"shareTo":0,"isFirstTimeShare":0}
            //ret成功：0；失败：1；取消：2
            //shareTo 分享渠道：QQ：0；QZone：1；微信：2；朋友圈：3
            log('分享成功', succObj.code, JSON.stringify(succObj.data));
        },
        fail: function (failObj) {
            log('分享失败', failObj.code, JSON.stringify(failObj.msg));
        },
        complete: () => {
            log('分享完成，不论成功失败');
        }
    });
}

function shareLink() {
    BK.Share.share({
        qqImgUrl: 'http://hudong.qq.com/docs/engine/img/848B76B5530AA7EE7B38E9A1267D7086.png',
        msgUrl: 'https://gitee.com/javen205/Brickengine_Guide?', //不加问号分享的链接无法直接访问
        title: '测试轻游戏',
        summary: 'H5链接分享-By Javen',
        //分享出去的链接为
        //https://gitee.com/javen205/Brickengine_Guide?&gameId=游戏ID&roomId=房间ID&gameVersion=游戏版本号&uin=QQ号码
    });
}

function screenShotShare() {

    //实际像素
    var pixelSize = BK.Director.screenPixelSize;
    var pWidth = pixelSize.width;
    var pWheight = pixelSize.height;

    BK.Share.share({
        range: {
            x: pWidth / 2,
            y: pWheight / 2,
            width: pWidth,
            height: pWheight
        },
        title: '测试轻游戏',
        summary: "截图分享-By Javen",
        extendInfo: 'IJPay',
        success: function (succObj) {
            log('分享成功', succObj.code, JSON.stringify(succObj.data));
        },
        fail: function (failObj) {
            log('分享失败', failObj.code, JSON.stringify(failObj.msg));
        },
        complete: () => {
            log('分享完成,不论成功失败');
        }
    });
}

function follow() {
    log("Global.PUIN>" + Global.PUIN);
    BK.QQ.enterPubAccountCard(Global.PUIN);
}
function getHead(pointNode) {
    let absolutePath = "GameSandBox://_head/" + GameStatusInfo.openId + ".jpg";
    let isExit = BK.FileUtil.isFileExist(absolutePath);
    cc.log(absolutePath + " is exit :" + isExit);
    //如果指定目录中存在此图像就直接显示否则从网络获取
    if (isExit) {
        cc.loader.load(absolutePath, function (err, texture) {
            if (err == null) {
                pointNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    } else {
        BK.MQQ.Account.getHeadEx(GameStatusInfo.openId, function (oId, imgPath) {
            cc.log("openId:" + oId + " imgPath:" + imgPath);
            var image = new Image();
            image.onload = function () {
                var tex = new cc.Texture2D();
                tex.initWithElement(image);
                tex.handleLoadedTexture();
                pointNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
            }
            image.src = imgPath;
        });
    }
}
function getNick(callback) {
    BK.MQQ.Account.getNick(GameStatusInfo.openId, callback);
}

/**
 * 成绩上报
 * @param {*} level 
 * @param {*} callback 
 */
function uploadScore(level, callback) {
    if (cc.sys.platform != cc.sys.QQ_PLAY) {
        if (callback) {
            callback(-1, "此接口只支持QQ玩一玩平台");
        }
        return;
    }
    console.log("<----11111111111---->");
    var data = {
        userData: [{
            openId: GameStatusInfo.openId,
            startMs: (((new Date()).getTime())-Math.ceil(Math.random()*15*6000)).toString(),
            endMs: ((new Date()).getTime()).toString(),
            scoreInfo: {
                score: level,
            },
        }],
        attr: {
            score: {
                type: 'rank',
                order: 1,//1:  从大到小  2：从小到大 3：累积  4：直接覆盖
            }
        },
    };
    BK.QQ.uploadScoreWithoutRoom(1, data, function (errCode, cmd, data) {
        // 返回错误码信息
        if (errCode !== 0) {
            log('---------->排行榜上传分数失败!错误码：' + errCode);
            return
        }
        log("-------------->>>>>>> callback  cmd" + cmd + " errCode:" + errCode + "  data:" + JSON.stringify(data));
        if (callback) {
            callback(errCode, data);
        }
    });
}
/**
 * 拉取排行榜数据
 * @param {*} callback 
 */
function getRankList(callback) {
    if (cc.sys.platform != cc.sys.QQ_PLAY) {
        if (callback) {
            callback(-1, "此接口只支持QQ玩一玩平台");
        }
        return;
    }
    let attr = "score";
    let order = 1;
    let rankType = 0;
    BK.QQ.getRankListWithoutRoom(attr, order, rankType, function (errCode, cmd, data) {
        log("getRankListWithoutRoom callback  cmd" + cmd + " errCode:" + errCode);
        if (errCode != 0) {
            console.log("接收到好友数据，-----------》报错",errCode);

            //callback(errCode);
            return;
        }
        if (data) {
            console.log("接收到好友数据，并且即将要打印数据");
            let rankList = data.data.ranking_list;
            log("data not null " + rankList.length);
            log(JSON.stringify(data));
             /*rankList.forEach(element => {
              log("....华丽的分割线....");
               log("score:" + element.score);
              log("nick:" + element.nick);
              log("....华丽的分割线....");
             });*/
            if (callback) {
                 callback(errCode, rankList);
            }
        }
    });
}
/**
 * //展示广告 Global.videoAd.show();
 * 预加载视频广告
 */
function loadVideoAd() {
    if (!Global.videoAd && cc.sys.platform == cc.sys.QQ_PLAY) { //如果没有广告资源就加载新的视频广告
        let videoAd = BK.Advertisement.createVideoAd();
        videoAd.onError(function (err) {
            //加载失败
            log("BKTools onError code:" + err.code + " msg:" + err.msg);
            Global.viewAdLoadCount += 1;
            if (Global.viewAdLoadCount < 4) {
                loadVideoAd();
            }
        });

        videoAd.onPlayFinish(function () {
            //播放结束
            log("BKTools onPlayFinish...")
            Global.videoAd = undefined;
        });

        videoAd.onLoad(function () {
            //加载成功
            log("BKTools onLoad");
            Global.videoAd = videoAd;
            Global.videoAdLoadCount = 0;
        });
    } else {
        log("BKTools 已存在广告资源 或者 非QQ玩一玩平台....");
    }
}

/**
 * //展示广告 Global.bannerAd.show();
 * 预加载banner广告
 */
function loadBannerAd(viewId) {
    if (!viewId) {
        viewId = 1001;
    }
    if (!Global.bannerAd && cc.sys.platform == cc.sys.QQ_PLAY) { //如果没有广告资源就加载新的视频广告
        let bannerAd = BK.Advertisement.createBannerAd({
            viewId: viewId,
        });
        bannerAd.onError(function (err) {
            //加载失败
            log("BKTools onError code:" + err.code + " msg:" + err.msg);
            Global.bannerAdLoadCount += 1;
            if (Global.bannerAdLoadCount < 4) {
                loadBannerAd(viewId);
            }
        });
        bannerAd.onLoad(function () {
            //加载成功
            log("BKTools onLoad");
            Global.bannerAd = bannerAd;
            Global.viewAdLoadCount = 0;
        });
    } else {
        log("BKTools 已存在banner资源 或者 非QQ玩一玩平台....");
    }
}

function showBannerAd() {
    if (Global.bannerAd) {
        Global.bannerAd.show();
    } else {
        log("BKTools 不存在banner资源....");
    }
}

function hideBannerAd() {
    if (Global.bannerAd) {
        Global.bannerAd.destory(); //hide() 测试不生效
        Global.bannerAd = undefined;
    } else {
        log("BKTools 不存在banner资源无法关闭....");
    }
}

module.exports = {
    log: log,
    shareToArk: shareToArk,
    share: share,
    shareLink: shareLink,
    screenShotShare: screenShotShare,
    getHead:getHead,
    getNick: getNick,
    follow: follow, //关注公众号
    uploadScore: uploadScore,
    getRankList: getRankList,
    loadVideoAd: loadVideoAd,
    loadBannerAd: loadBannerAd,
    showBannerAd: showBannerAd,
    hideBannerAd: hideBannerAd,
};