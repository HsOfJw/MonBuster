// 配置 Json 文件必须放在resources/json 目录下
module.exports = {
    _loadJson: function (file, obj) {
        //let url = cc.url.raw("resources/json/" + file + ".json");
        cc.loader.loadRes("json/" + file,
            function (err, results) {
                // 完成
                if (err) {
                    console.log("解析配置文件" + file + "失败: " + err);
                } else {
                    if (results) {
                        obj['data'] = results.json;
                    } else {
                        this._onError(file);
                    }
                }
            }.bind(this));
    },

    file: {
        rankLevel: {data: [], name: "rankLevel"},//等级信息
        robot: {data: [], name: "robot"},//机器人
        dropSpeed: {data: [], name: "dropSpeed"},//掉落速度
        directGame: {data: [], name: "directGame"},//跳转其他游戏
    },
    _isInit: false,
    initJson: function (cb) {
        if (this._isInit === false) {
            this._isInit = true;
            //加载json 文件
            for (let key in this.file) {
                this._loadJson(key, this.file[key]["data"]);
            }
        } else {
            console.log("[JsonFileMgr] has init");
        }
    },
}