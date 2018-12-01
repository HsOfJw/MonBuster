window.GameMsgGlobal = {
    //游戏准备阶段
    gameReady_loading: {
        direct: "GameMsg_gameReady_direct",
        enterGame: "GameMsg_gameReady_enterGame",//执行正常的游戏逻辑
        enterLoginScene: "GameMsg_gameReady_enterLoginScene",//进入到loginScene
    },
    gameLoginScene: {
        startMatching: "GameMsg_gameLoginScene_startMatching",//开始匹配
        addGold_watchVideo: "GameMsg_gameLoginScene_addGold_watchVideo",//看视频添加金币
        refreshLevelList: "GameMsg_gameLoginScene_refreshLevelList",//已经领取段位奖励 刷新页面
        showLevelAward: "GameMsg_gameLoginScene_showLevelAward",//展示段位礼包
    },
    sceneDirect: {
        //  matching: 代表开始匹配  levelList 显示段位列表  "" 代表没有任何处理
        HomePageDirect: ""
    },
    mainScene: {
        victoryLayer: "GameMsg_gameLoginScene_victoryLayer",
        failLayer: "GameMsg_gameLoginScene_failLayer",

    }

}