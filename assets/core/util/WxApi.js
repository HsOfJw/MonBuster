let GameData = require("GameData");
let GameLocalStorage = require("GameLocalStorage");
let NetUtils=require('NetUtils');
module.exports = {
    //创建授权按钮
    createUserInfoButtonAndBindTap() {
        if (window.wx !== undefined) {
            //设置按钮信息
            let button = wx.createUserInfoButton({
                type: 'image',
                image: 'http://gather.51weiwan.com//uploads//file//20180810//63dc8acab48ee0de3260a1b9dc38c163.png',
                style: {
                    left: 0,
                    top: 0,
                    width: 1000,
                    height: 1500,
                }
            });
            button.onTap(res => {
                if (res.errMsg === "getUserInfo:ok") {
                    //数据交互
                    wx.login({
                        success: res_wxLogin => {
                            let url = 'https://gather.51weiwan.com/api/login/index';
                            let data = {
                                code: res_wxLogin.code,
                                game_id: require("GameData").gameConfigInfo.gameId,
                                iv: res.iv,
                                encryptedData: res.encryptedData,
                            };
                            let successFun = (statusCode,res_login)=> {
                                button.destroy();
                                require("GameData").playInfo.uid = res_login.data.data.uid;
                                //存贮uid  进入到内存中
                                GameLocalStorage.setUid(res_login.data.data.uid);

                                require("GameData").getGameConfig();
                                require("GameData").getLevelAwardAndPerLevelNum();

                                //发送消息 通知页面刷新数据
                            };
                            this.wx_request(url, data, successFun);
                        }
                    });

                }

            })
        }

    },
    // 发送请求
    wx_request(url, data, successFun) {
        if (window.wx !== undefined) {
            wx.request({
                url: url,
                data: data,
                success: successFun,
            })
        }else if(cc.sys.platform==cc.sys.QQ_PLAY){
            url.replace("gather", "s");
            //发送原生请求
            NetUtils.post(url,data,successFun);

        }
    },
    //显示页面右上角 菜单的转发按钮  并监听点击触发的事件
    wx_showShareMenu(data, defaultTitle) {
        console.log("左上角的转发参数", data, defaultTitle);
        if (window.wx !== undefined) {
            //wx.showShareMenu();//开启转发
            wx.showShareMenu({withShareTicket: true});

            if (data) {
                wx.onShareAppMessage(() => {
                    return {
                        title: data.info.share_title,
                        imageUrl: data.info.share_img
                    }
                })
            } else {
                wx.onShareAppMessage(() => {
                    return {
                        title: defaultTitle,
                        imageUrl: canvas.toTempFilePathSync({
                            destWidth: 500,
                            destHeight: 400
                        }),
                    }
                })
            }


        }
    },
    //主动拉起转发  例如点击分享  秀一秀  触发的效果
    wx_shareAppMessage(data, defaultTitle) {
        console.log("主动拉起转发参数", data, defaultTitle);
        if (window.wx !== undefined) {
            if (data) {
                wx.shareAppMessage(() => {
                    return {
                        title: data.info.share_title,
                        imageUrl: data.info.share_img,
                    }
                })
            } else {
                //使用当前页面的截图 作为转发的图片
                wx.shareAppMessage(() => {
                    return {
                        title: defaultTitle,
                        imageUrl: canvas.toTempFilePathSync({
                            destWidth: 500,
                            destHeight: 400
                        }),
                    }
                })
            }
        }

    },
    //创建一个图片对象
    wx_createImage(remoteUrl, pointNode) {
        if (window.wx !== undefined) {
            let image = wx.createImage();
            image.onload = () => {
                try {
                    let texture = new cc.Texture2D();
                    texture.initWithElement(image);
                    texture.handleLoadedTexture();
                    let sp = new cc.SpriteFrame(texture);
                    pointNode.setScale(pointNode.width / sp.getOriginalSize().width);
                    pointNode.getComponent(cc.Sprite).spriteFrame = sp;
                    pointNode.active = true;
                } catch (e) {
                    console.log("加载远程图标失败,错误信息为", e);
                    pointNode.active = false;
                }
            };
            image.src = remoteUrl;
        }
    },
    //获取机型信息
    wx_getSystemInfo() {
        if (window.wx !== undefined) {
            wx.getSystemInfo({
                success: function (res) {
                    require("GameData").gameConfigInfo.playMobile_windowHeight = res.windowHeight;
                    require("GameData").gameConfigInfo.mobile_Vec_y = (res.windowHeight - 667) * 2;
                },
            })
        }
    },

    //设置底部banner广告
    wx_setBannerInfo() {
        if (window.wx !== undefined) {
            let winSize = wx.getSystemInfoSync();
            let bannerHeight = 120;
            let bannerWidth = 421;

            let bannerAd = wx.createBannerAd({
                adUnitId: 'adunit-a4fb536ae75837e9',
                style: {
                    left: 0,
                    top: winSize.windowHeight - bannerHeight,
                    width: bannerWidth
                }
            });
            bannerAd.onError(err => {
                console.log(" Banner广告拉取失败", err)
            });
            bannerAd.onLoad(() => {
                console.log(' Banner 广告加载成功')
            });
            bannerAd.show()
                .then(() => console.log(' banner 广告显示'));
            //微信缩放后得到banner的真实高度，从新设置banner的top 属性
            bannerAd.onResize(res => {
                bannerAd.style.top = winSize.windowHeight - bannerAd.style.realHeight;
            });
            require("GameData").gameConfigInfo.bannerAd = bannerAd;
        }
    },
    //视频广告相关  看视频不掉星
    wx_setVideoAd(videoId, onErrorFun, onClose) {
        if (window.wx !== undefined) {
            let videoAd = wx.createRewardedVideoAd({
                adUnitId: videoId
            });
            videoAd.show()
                .catch(err => {
                    videoAd.load()
                        .then(() => videoAd.show());
                });
            videoAd.onError(onErrorFun);
            videoAd.onClose(onClose);
            require("GameData").gameConfigInfo.videoAd = videoAd;
        }
    },

    //跳转小程序 小游戏
    wx_navigateToMiniProgram(obj) {
        if (window.wx !== undefined) {
            wx.navigateToMiniProgram(
                obj
            );
        }
    },
    //向子域发送消息
    wx_postMessage(obj) {
        if (window.wx !== undefined) {
            wx.postMessage(
                obj
            );
        }
    },
}