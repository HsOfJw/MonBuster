let ObserverMgr = require("ObserverMgr");
let SocketMsgDispatch = require("SocketMsgDispatch");
let GameData = require("GameData");
//构造心跳对象

/**

 * timeout: number, 心跳对象内timeout为每10秒发一次心跳,
 * timeoutObj: null, timeoutObj、serverTimeoutObj是清除定时器用的对象
 * serverTimeoutObj: null,
 * reset:   重置定时器
 * start:   发送心跳
 */

let heartCheck = {
    timeout: 10000,
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function () {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function () {
        this.timeoutObj = setTimeout(() => {
            //每隔10 秒发送一次心跳
            wx.sendSocketMessage({
                data: "ping",
                success() {
                    console.log("发送ping成功");
                }
            });
            this.serverTimeoutObj = setTimeout(() => {
                wx.closeSocket();
            }, this.timeout);
        }, this.timeout);
    }
};
module.exports = {
    limit: 0,
    ws: null,
    isFirstInit: true,
    heartID: null,
    // 保存上次的请求
    _tmpQuest: {
        msg: null,
        data: null,
    },

    init() {
        if (this.isFirstInit) {
            let that = this;
            if (window.wx !== undefined) {
                wx.connectSocket({
                    //url: 'wss://socket.51weiwan.com',
                    url: 'ws://106.14.220.170:9501/',
                    header: {
                        'content-type': 'application/json'
                    },
                    success() {
                        console.log("[wx_socket]  初始化连接 con url: wss://socket.51weiwan.com");
                        that.isFirstInit = false;
                        that.initEventHandle();
                    }
                })
            }
        } else {
            console.log("[wx_socket] has init");
        }
    },
    initEventHandle() {
        let that = this;
        wx.onSocketMessage((res) => {
            //收到消息
            if (res.data == "pong") {//服务器判定 连接断开
                heartCheck.reset().start()
            } else {
                //处理数据
                that.onMessage(res);
            }
        });
        wx.onSocketOpen(() => {
            that.limit = 0;
            console.log("[wx_socket] Open: " + that._getTime());
            //heartCheck.reset().start();
        });
        wx.onSocketError(function () {
            console.log("[wx_socket]Error: " + that._getTime());
            that.reconnect()
        });
        wx.onSocketClose(function () {
            console.log("[wx_socket] onClose: " + that._getTime());
            that.reconnect();
        });
    },
    //断线重连
    reconnect() {
        let that = this;
        console.log("程序开始执行断线重连操作 次数为", this.limit);
        if (this.lockReconnect) return;
        this.lockReconnect = true;
        clearTimeout(this.timer);
        //3秒重试一次，最多请求12次
        if (this.limit < 12) {

            this.timer = setTimeout(() => {
                this.isFirstInit = true;
                this.init();
                this.lockReconnect = false;
                setTimeout(function () {
                    if (that._tmpQuest.msg) {
                        that.sendMsg(that._tmpQuest.msg, that._tmpQuest.data);
                    }
                    // 断线重连 向服务器发送数据
                    let sendData = {
                        user_id: GameData.playInfo.uid,
                    };
                    that.sendMsg(9, sendData);
                }, 6000);

            }, 3000);
            this.limit++;
        }
    },
    onMessage: function (event) {
        console.log("[socket ] 服务器返回数据", event);
        let receiveData = null;
        try {
            receiveData = JSON.parse(event.data);
        } catch (e) {
            console.log(e);
            receiveData = null;
        }
        if (receiveData !== null) {
            console.log("[socket 返回数据信息为]", receiveData);
            SocketMsgDispatch.dealSocketMagDispatch(receiveData);
        } else {
            console.log("[Socket] 服务器返回数据不是json格式: " + event.data);
        }
    },
    sendMsg(msg, data) {
        let that = this;
        let sendData = {
            message_type: msg,
            message_data: data,
        };
        this._tmpQuest.msg = msg;
        this._tmpQuest.data = data;
        //this._showSendData(msg, data);
        if (window.wx != undefined) {
            wx.sendSocketMessage({
                data: JSON.stringify(sendData),
                success: function () {
                    console.log("[wx_socket] 连接正常，发送的消息是", JSON.stringify(sendData));
                    that._tmpQuest.msg = null;
                    that._tmpQuest.data = null;
                },
                fail: function (res) {
                    console.log("[wx_socket] 信息发送失败，错误原因为", res, "发送的消息是", JSON.stringify(sendData));
                }
            });
        }
    },
    _showSendData(msg, data) {
        let sendData = {time: this._getTime(), msg: msg, data: data};
        if (cc.sys.isBrowser) {
            console.log("[Socket===>]%c %s ", "color:green;font-weight:bold;", JSON.stringify(sendData));
        } else {
            console.log("[Socket===>]%s ", JSON.stringify(sendData));
        }
    },
    _showRecvData(msg, data) {
        let recvData = {time: this._getTime(), msg: msg, data: data};
        if (cc.sys.isBrowser) {
            console.log("[Socket<===]%c %s", "color:red;font-weight:bold;", JSON.stringify(recvData));
        } else {
            console.log("[Socket<===]%s", JSON.stringify(recvData));

        }
    },
    _getTime() {
        let time = new Date();
        let hour = time.getHours();
        let min = time.getMinutes();
        let sec = time.getSeconds();
        return hour + ":" + min + ":" + sec;
    },

}