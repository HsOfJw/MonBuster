let UIMgr = require("UIMgr");
let Tips = require("Tips");
let AudioMgr = require("AudioMgr");
let AudioPlayer = require("AudioPlayer");
let GameData = require("GameData");
cc.Class({
    extends: cc.Component,

    properties: {
        music_on: {displayName: "开启音乐", default: null, type: cc.Toggle},
        music_off: {displayName: "关闭音乐", default: null, type: cc.Toggle},
        soundEffect_on: {displayName: "开启音效", default: null, type: cc.Toggle},
        soundEffect_off: {displayName: "关闭音效", default: null, type: cc.Toggle},
    },

    onLoad() {
        if (GameData.gameBackMusic_on_off === "off") {
            this.music_off.isChecked = true;
            this.music_on.isChecked = false;
        }
        if (GameData.gameSoundEffect_on_off === "off") {
            this.soundEffect_off.isChecked = true;
            this.soundEffect_on.isChecked = false;
        }
    },
    //开启音乐
    onBtnClickMusic_on() {
        console.log('开启背景音乐');
        GameData.gameBackMusic_on_off = "on";
        AudioMgr.playMainMusic();
    },
    onBtnClickMusic_off() {
        console.log('关闭背景音乐');
        GameData.gameBackMusic_on_off = "off";
        AudioPlayer.stopCurrentBackGroundMusic();
    },
    onBtnClickSoundEffect_on() {
        console.log('开启音效');
        GameData.gameSoundEffect_on_off = 'on';
    },
    onBtnClickSoundEffect_off() {
        console.log('关闭音效');
        GameData.gameSoundEffect_on_off = 'off';
    },
    onBtnClickBack() {
        UIMgr.destroyUI(this);
    },
});
