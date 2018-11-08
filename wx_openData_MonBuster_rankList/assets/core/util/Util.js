module.exports = {
    log(str) {
        console.log("-------------------------------------------");
        console.log(str);
        console.log("*******************************************");
    },
    // 自动补0
    prefix(num, length) {
        if (num.toString().length >= length) {
            return num;
        } else {
            return (Array(length).join('0') + num).slice(-length);
        }
    },
    // 将剩余时间格式化输出
    formatTimeRemainTime(time) {
        let totalSecond = parseInt(time / 1000);
        let preHourSecond = 60 * 60;
        let preMinSecond = 60;

        let hour = Math.floor(totalSecond / preHourSecond);
        let minute = Math.floor(totalSecond % preHourSecond / preMinSecond);
        let second = Math.floor(totalSecond % preHourSecond % preMinSecond);

        hour = this.prefix(hour, 2);
        minute = this.prefix(minute, 2);
        second = this.prefix(second, 2);
        return hour + ":" + minute + ":" + second;
    },
    // 返回[0,maxNum)的数值
    randomByMaxValue(maxNum) {
        return Math.floor(Math.random() * maxNum);
    },
    //随机数
    randomNum(number) {
        let today = new Date();
        let seed = today.getSeconds() + Math.floor(Math.random() * 100);

        let seedNum = this.rnd(seed);
        return Math.ceil(seedNum * number);
        /* return function randomNum(number){

         };*/
    },
    rnd(seed) {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / (233280.0);
    },


// 从数组中删除指定元素,不能用于for循环中
    removeElementsFromArray: function (arr, element) {
        let index = -1;
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            if (arr[i] === element) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            arr.splice(index, 1);
        }
    }
    ,
    makeRdmStr: function (len) {

        len = len || 32;
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        let maxPos = $chars.length;
        let ret = '';
        for (let i = 0; i < len; i++) {
            ret += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return ret;
    }
    ,
    numCutOut(num, len) {
        let a = parseInt(num * Math.pow(10, len));
        let ret = (a / Math.pow(10, len)).toString();
        let arr = ret.split('.');
        if (arr.length === 1) {
            ret += ".";
            for (let i = 0; i < len; i++) {
                ret += "0";
            }
        } else if (arr.length === 2) {
            let i = arr[1].length;
            for (; i < len; i++) {
                ret += "0";
            }
        }
        return ret;
    }
    ,
    getUnixTime: function () {
        return Math.round(new Date().getTime() / 1000);
    }
    ,
// 对象的深拷贝
    deepCopy(obj) {
        let out = [], i = 0, len = obj.length;
        for (; i < len; i++) {
            if (obj[i] instanceof Array) {
                out[i] = this.deepCopy(obj[i]);
            }
            else out[i] = obj[i];
        }
        return out;
    }
    ,
// 从数组中随机取出值
    getRandomItemFromArray(arr, num) {
        let tempArr = [];
        for (let index in arr) {
            tempArr.push(arr[index]);
        }

        let retArr = [];
        for (let i = 0; i < num; i++) {
            if (tempArr.length > 0) {
                let index = Math.floor(Math.random() * tempArr.length);
                retArr[i] = tempArr[index];
                tempArr.splice(index, 1);
            } else {
                break;
            }
        }
        return retArr;
    }
    ,
    getNowTime() {
        let time = new Date();
        let hour = time.getHours();
        let min = time.getMinutes();
        let sec = time.getSeconds();
        return hour + ":" + min + ":" + sec;
    }
    ,
    getIP() {
        let url = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js';
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 400)) {
                console.log(xhr.responseText);
            }
        };
        xhr.open('GET', url, true);
        xhr.send();
    },
    loadRemoteSprite(remoteUrl, pointNode) {
        if (window.wx) {
            let image = wx.createImage();
            //image.onload = () => {
            image.onload = function () {
                try {
                    let texture = new cc.Texture2D();
                    texture.initWithElement(image);
                    texture.handleLoadedTexture();
                    let sp = new cc.SpriteFrame(texture);
                    pointNode.setScale(pointNode.width / sp.getOriginalSize().width);
                    pointNode.getComponent(cc.Sprite).spriteFrame = sp;
                } catch (e) {
                    cc.log("加载远程图标失败,错误信息为", e);
                    pointNode.active = false;
                }
            };
            image.src = remoteUrl;
        }

    },

    // 将node的层级调整为Parent下最高级
    reZorderToTop(node) {
        let parent = node.parent;
        let childrenLen = parent.children.length;
        node.setLocalZOrder(childrenLen);
    }
    ,
}
;