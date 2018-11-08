let ObserverMgr = require("ObserverMgr");
let SocketMsgDispatch = require("SocketMsgDispatch");
module.exports = {
    limit: 0,
    ws: null,
    isNetOpen: false,
    heartID: null,
    init() {
        if (this.ws === null) {
            //let url = "wss://socket.51weiwan.com";
            let url = " ws://106.14.220.170:9501/";
            console.log("[Socket] con url:" + url);
            this.ws = new WebSocket(url);
            this.ws.onopen = this.onOpen.bind(this);
            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onerror = this.onError.bind(this);
            this.ws.onclose = this.onClose.bind(this);
        } else {
            console.log("[Socket] has init");
        }
    },

    _onHeartBeat() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.sendMsg(0, {});
        }
    },
    _beganHeartBeat() {
        this._cleanHeartBeat();
        // 30s心跳
        this.heartID = setInterval(this._onHeartBeat.bind(this), 1000 * 30);
    },
    _cleanHeartBeat() {
        if (this.heartID !== null) {
            clearInterval(this.heartID);
            this.heartID = null;
        }
    },

    onOpen: function () {
        console.log("[Socket] Open: " + this._getTime());
        //this.isNetOpen = true;
        //ObserverMgr.dispatchMsg(GameMsgGlobal.Net.Open, null);
        this._beganHeartBeat();
    },
    onError: function () {
        console.log("[Socket] Error: " + this._getTime());
        //this.ws = null;
        //this.isNetOpen = false;
        //ObserverMgr.dispatchMsg(GameMsgGlobal.Net.Error, null);
        this._cleanHeartBeat();
    },
    //重新连接
    onReconnect: function () {
        if (this.limit < 10) {
            console.log("[Socket] onReconnect: " + this._getTime());
            if (this.ws.readyState == 3) {
                let url = "wss://socket.51weiwan.com";
                console.log("[Socket] con url:" + url);
                this.ws = new WebSocket(url);
                this.ws.onopen = this.onOpen.bind(this);
                this.ws.onmessage = this.onMessage.bind(this);
                this.ws.onerror = this.onError.bind(this);
                this.ws.onclose = this.onClose.bind(this);
            } else {
                console.log("[Socket] onReconnect this.ws.readyState 的值不为3  开启重新连接方案", this.ws.readyState + this._getTime());
                let rews = new WebSocket("wss://socket.51weiwan.com");
                rews.onmessage = this.onMessage.bind(this);
                rews.onclose = this.onClose.bind(this);

            }
            this.limit++;
        }
    },
    //主动断开连接
    onClose: function () {
        console.log("[Socket] onClose: " + this._getTime());
        //this.ws.close();
        //this.ws = null;
        //this.scheduleOnce(function () {
        this.onReconnect();
        // }.bind(this), 5)

    },
    onMessage: function (event) {
        this.limit = 0;
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
        if (this.ws) {
            if (this.ws.readyState === WebSocket.OPEN) {
                this._showSendData(msg, data);
                let sendData = {
                    message_type: msg,
                    message_data: data,
                };
                console.log("[socket] 连接正常，发送的消息是", JSON.stringify(sendData));
                this.ws.send(JSON.stringify(sendData));
            } else {
                console.log("[Socket] 网络失去连接");
            }
        } else {
            console.log("网络连接出现问题:可能没有初始化网络,或网络失去连接!");
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