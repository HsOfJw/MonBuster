module.exports = {
    catchKey: "gameCatchKey",
    catchData: {
        uid: null,
        loginTime: "",
    },
    _isInit: false,
    initLocalStorage() {
        if (this._isInit === false) {
            this._isInit = true;

            let saveStr = cc.sys.localStorage.getItem(this.catchKey);
            if (saveStr) {
                let saveObj = JSON.parse(saveStr);
                this.catchData.uid = saveObj.uid;
                this.catchData.loginTime = saveObj.loginTime;
            } else {
                this.catchData.uid = null;
                this.catchData.loginTime = null;

            }
        } else {
            console.log("[GameLocalStorage] has init");
        }
    },


    setUid(data) {
        this.catchData.uid = data;
        this._save();
    },
    getUid() {
        return this.catchData.uid;
    },

    setLoginTime(data) {
        this.catchData.loginTime = data;
        this._save();
    },
    getLoginTime() {
        return this.catchData.loginTime;
    },


    _save() {
        let saveStr = JSON.stringify(this.catchData);
        cc.sys.localStorage.setItem(this.catchKey, saveStr);
    },


};