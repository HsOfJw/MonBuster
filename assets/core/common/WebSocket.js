let Global = require("Global");
let BKTools = require("BKTools");
let pbkiller = require('pbkiller');

let WS_TYPE = cc.Enum({
    BK_WS: 1,
    WEB_WS: 2,
});

cc.Class({
    extends: cc.Component,
    // properties: {},

    // onLoad () {},

    start() {
        this.asyncLoad();
    },

    initWebSocket() {
        if (cc.sys.platform == cc.sys.QQ_PLAY) {
            this._ws = new BK.WebSocket("ws://" + Global.WEB_SOCKET.URL);
            this._wsType = WS_TYPE.BK_WS;
        } else {
            this._ws = new WebSocket("ws://" + Global.WEB_SOCKET.URL);
            this._wsType = WS_TYPE.WEB_WS;
        }
        this.addEventListener(this._ws);
    },

    addEventListener(ws) {
        let self = this;
        ws.onopen = function (event) {
            self._isConnected = true;
            self.toLogin();
        };
        ws.onerror = function (event) {
            self._isConnected = false;
            BKTools.log("onerror....");
        };
        ws.onclose = function (event) {
            self._isConnected = false;
            BKTools.log("onclose....");
        };
        if (self._wsType == WS_TYPE.BK_WS) {
            ws.onMessage = function (ws, event) {
                if (event.isBinary) {
                    let buf = event.data;
                    //将游标pointer重置为0
                    buf.rewind();
                    let ab = new ArrayBuffer(buf.length);
                    let dv = new DataView(ab);
                    while (!buf.eof) {
                        dv.setUint8(buf.pointer, buf.readUint8Buffer());
                    }
                    self.toHander(ab);
                } else {
                    BKTools.log("BK.WebSocket data type is not binary");
                }
            }
        } else {
            ws.onmessage = function (event) {
                if (event.data instanceof Blob) {
                    let blob = event.data;
                    var reader = new FileReader();
                    reader.readAsArrayBuffer(blob);
                    reader.onload = function (e) {
                        if (e.target.readyState == FileReader.DONE) {
                            let result = reader.result;
                            self.toHander(result);
                        }
                    }
                } else {
                    BKTools.log("webSocket data type is not blob");
                }
            };
        }
    },

    hasConnected() {
        return this._isConnected;
    },

    toHander(buffer) {
        let self = this;
        let cmd = this.pb.UserCmdOutComonProto.decode(buffer);
        switch (cmd.id) {
            case this.pb.UserCmdOutType.RECONNECTION_RESULT:
                BKTools.log("重连结果....");
                break;
            case this.pb.UserCmdOutType.USER_CONNECT_SUCCESS:
                BKTools.log("客户端连接成功....");
                break;
            case this.pb.UserCmdOutType.USER_LOGIN_SUCCESS:
                BKTools.log("反馈登录消息开始...");
                break;
            case this.pb.UserCmdOutType.USER_LOGIN_SUCCESS_OVER:
                BKTools.log("反馈登录消息结束....");
                let loginOver = this.pb.PlayerLoginOverProtoOut.decode(buffer);
                this.log("昵称:" + loginOver.nickName);
                this.log(`登录获取到的信息:${JSON.stringify(loginOver, null, 4)}`);
                break;

            case this.pb.UserCmdOutType.ERROR_CODE:

                break;
            case this.pb.UserCmdOutType.PING:
                BKTools.log("心跳....");
                let pingOut = this.pb.UserPingClientProtoOut.decode(buffer);
                let stime = pingOut.serverTime;
                //心跳回包
                let ping = new this.pb.UserPingBackProto();
                ping.id = this.pb.UserCmdInType.USER_PING;
                ping.serverTime = stime;
                self.send(ping.toArrayBuffer());
                break;
            default:
                break;
        }
    },

    send(bytes) {
        this._ws.send(bytes);
    },

    /**
     * 使用pbkiller.preload方法预加载所有resources/pb目录下的proto文件
     * 之后用法与之前相同
     */
    asyncLoad() {
        pbkiller.preload(() => {
            this.loadProto();
        });
    },
    /**
     * 如果要在微信小游戏环境执行，需要先执行pbkiller.preload函数
     */
    loadProto() {
        //loadAll自动加载resources/pb下所有proto
        this.pb = pbkiller.loadAll('proto', 'gn.proto');
        // this.log(JSON.stringify(pb.gn.proto, null, 4));
    },
    /**
     * 登录
     */
    toLogin() {
        let login = new this.pb.UserLoginProto();
        login.id = this.pb.UserCmdInType.USER_LOGIN;
        login.token = Global.WEB_SOCKET.TOKEN;
        let data = login.toArrayBuffer();
        this.send(data);
    },

    log(msg) {
        cc.log(msg);
    },
    // update (dt) {},
});