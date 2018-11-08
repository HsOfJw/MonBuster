module.exports = {
    initDropSpeed: 1.5,//初始掉落的速度
    addSpeed_1: 0,
    addSpeed_2: 0,
    addSpeed_3: 0,

    pumpkinDownDistance: 4,//南瓜掉落每帧的位移

    customVec_y: 0,
    //时间间隔
    timeInterval_1: 0,
    timeInterval_2: 0,
    timeInterval_3: 0,

    setPumpDownDistance(speed) {

        if (speed >= 1.3) {
            if (speed === 1.5) {
                this.customVec_y = 118;
            } else if (speed === 1.4) {
                this.customVec_y = 119;
            } else if (speed === 1.3) {
                this.customVec_y = 116;
            }
            return parseFloat((2.8 - speed).toFixed(2));
        } else if (speed >= 1.1) {
            if (speed === 1.2) {
                this.customVec_y = 118;
            } else if (speed === 1.1) {
                this.customVec_y = 115;
            }
            return parseFloat((2.85 - speed).toFixed(2));
        } else {
            switch (speed) {
                case 1:
                    this.customVec_y = 111;
                    return 1.85;
                case 0.9:
                    this.customVec_y = 113;
                    return 2.1;
                case 0.8:
                    this.customVec_y = 113;
                    return 2.35;
                case 0.7:
                    this.customVec_y = 113;
                    return 2.7;
                case 0.6:
                    this.customVec_y = 115;
                    return 3.1;
                case 0.5:
                    this.customVec_y = 112;
                    return 3.7;
                case 0.4:
                    this.customVec_y = 115;
                    return 4.6;
                case 0.3:
                    this.customVec_y = 114;
                    return 6;
                default:
                    console.log("当前速度不再程序设定范围内");
            }
        }
    }


};