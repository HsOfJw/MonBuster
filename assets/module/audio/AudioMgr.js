let AudioPlayer = require('AudioPlayer');
module.exports = {
    // 播放游戏主场景音乐
    playMainMusic() {
        cc.loader.loadRes("music/BgMusicMain", cc.AudioClip, function (err, clip) {
            AudioPlayer.playBackGroundMusic(clip, true);
        });
    },
    //播放游戏结束音效
    playGameOverMusic() {
        cc.loader.loadRes("music/gameOver", cc.AudioClip, function (err, clip) {
            AudioPlayer.playEffectMusic(clip, false);

        });
    },
    //播放爆炸音效
    playBlastMusic() {
        cc.loader.loadRes("music/blast", cc.AudioClip, function (err, clip) {
            AudioPlayer.playEffectMusic(clip, false);
        });
    },
    //播放按钮音效
    playButtonSound() {
        cc.loader.loadRes("music/buttonMusic", cc.AudioClip, function (err, clip) {
            AudioPlayer.playEffectMusic(clip, false);
        });
    },
};