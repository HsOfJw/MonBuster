let GameData = require("GameData");
module.exports = {
    _bgMusic: null,// 背景音乐句柄, 背景音乐只存在一个
    // 播放背景音乐
    playBackGroundMusic(url, isLoop) {
        if (GameData.gameBackMusic_on_off === "on") {
            if (this._bgMusic) {
                cc.audioEngine.stop(this._bgMusic);
                this._bgMusic = null;
            }
            this._bgMusic = cc.audioEngine.play(url, isLoop);
            return this._bgMusic;
        }
    },
    // 停止当前正在播放的背景音乐
    stopCurrentBackGroundMusic() {

        if (this._bgMusic || this._bgMusic == 0) {
            cc.audioEngine.stop(this._bgMusic);
            this._bgMusic = null;
        }
    },
    // 播放音效
    playEffectMusic(url,   isLoop ) {
		console.log("111111");
        //查看是否打开音效开关
        if (GameData.gameSoundEffect_on_off === "on") {
            if (typeof (isLoop) === "undefined") {
                isLoop = false;
            }
            return cc.audioEngine.playEffect(url, isLoop);
        }


    }
};