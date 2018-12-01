/**
 * @author Javen
 * @copyright 2018-11-13 18:36:04 javendev@126.com
 * @description 常用的工具方法
 */

function setImg(imgNode, spriteFrame) {
    imgNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
}

function loadImgByUrl(imgNode, remoteUrl, imageType) {
    if (!imageType) {
        imageType = "png";
    }
    cc.loader.load({
        url: remoteUrl,
        type: imageType
    }, function (err, texture) {
        if (err) {
            return;
        }
        setImg(imgNode, new cc.SpriteFrame(texture));
    })
}

function loadLocal(absolutePath, imgNode) {
    cc.loader.load(absolutePath, function (err, texture) {
        if (err) {
            return;
        }
        setImg(imgNode, new cc.SpriteFrame(texture));
    });
}

function isArray(value) {
    if (typeof Array.isArray === "function") {
        return Array.isArray(value);
    } else {
        return Object.prototype.toString.call(value) === "[Object Array]";
    }
}

/**
 * 将秒转化为 "00:02:30"
 * @param {*} value
 */
function formatSeconds(value) {
    let secondTime = parseInt(value); // 秒
    let minuteTime = 0; // 分
    let hourTime = 0; // 小时
    if (secondTime > 60) { //如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60);
        //获取秒数，秒数取佘，得到整数秒数
        secondTime = parseInt(secondTime % 60);
        //如果分钟大于60，将分钟转换成小时
        if (minuteTime > 60) {
            //获取小时，获取分钟除以60，得到整数小时
            hourTime = parseInt(minuteTime / 60);
            //获取小时后取佘的分，获取分钟除以60取佘的分
            minuteTime = parseInt(minuteTime % 60);
        }
    }
    if (secondTime < 10) {
        secondTime = "0" + secondTime;
    }
    if (minuteTime < 10) {
        minuteTime = "0" + minuteTime;
    }
    if (hourTime < 10) {
        hourTime = "0" + hourTime;
    }
    return hourTime + ":" + minuteTime + ":" + secondTime;
}

/**
 * 将秒转化为 "2.30"
 * @param {*} value
 */
function formatMilliSecond(value) {
    if (value > 3600) {
        return;
    }
    let milliSecondTime = parseInt(value); // 毫秒
    let secondTime = 0; // 秒
    if (milliSecondTime > 60) {
        secondTime = parseInt(milliSecondTime / 60);
        milliSecondTime = parseInt(milliSecondTime % 60);
    }

    if (milliSecondTime < 10) {
        milliSecondTime = "0" + milliSecondTime;
    }
    return secondTime + ":" + milliSecondTime;
}

module.exports = {
    loadImgByUrl: loadImgByUrl,
    loadLocal: loadLocal,
    setImg: setImg,
    isArray: isArray,
    formatMilliSecond: formatMilliSecond,
    formatSeconds: formatSeconds,
};