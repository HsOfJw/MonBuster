let BKTools = require("BKTools");
let Global = require("Global");
/**
 * post 请求
 * @param {*} url 
 * @param {*} data 
 * @param {*} callBack 
 */
function post(url, data, callBack) {
  BKTools.log("请求地址:" + url);
  BKTools.log("请求参数:" + data);
    let stringBuf="";
    for( let k in data ){
        if(stringBuf==""){
            stringBuf+=k+"=";
            stringBuf+=data[k];
        }else{
            stringBuf+="&"+k+"=";
            stringBuf+=data[k];
        }
    }
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    let status = xhr.status;
    if (xhr.readyState == 4 && status == 200) {
      let responseBody = xhr.responseText;
      BKTools.log("响应的结果：" + responseBody);
      //封装返回数据
        let emptyObj={};
        emptyObj.data=JSON.parse(responseBody);
      callBack(status, emptyObj);
    }
  };
  xhr.open("POST", url, true);
  xhr.send(stringBuf);
}

/**
 * get请求
 * @param {*} url 
 * @param {*} data 
 * @param {*} callBack 
 */
function get(url, data, callBack) {
  BKTools.log("请求地址:" + url);
  BKTools.log("请求参数:" + data);
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    let status = xhr.status;
    if (xhr.readyState == 4 && status == 200) {
      let responseBody = xhr.responseText;
      BKTools.log("响应的结果：" + responseBody);
      callBack(status, JSON.parse(responseBody));
    }
  };
  xhr.open("GET", url + "?params=" + encodeURIComponent(data), true);
  xhr.send();
}

/**
 * 登录请求参数
 */
function setLoginData() {
  let loginObj = {};
  loginObj.accounttype = 4;
  loginObj.gameID = Global.gameId;
  loginObj.openid = Global.openId;
  loginObj.platform = Global.platform;
  loginObj.sex = Global.sex;
  loginObj.nickName = Global.nickName;
  loginObj.osVersion = Global.osVersion;
  if (Global.inviter) {
    loginObj.inviter = Global.inviter;
  }
  return JSON.stringify(loginObj);
}

function doLogin(callBack) {
  let URL = Global.URL.BASE_URL + Global.URL.LOGIN;
  let params = setLoginData();
  get(URL, params, function (status, response) {
    let code = -1;
    if (status == 200) {
      code = 0;
      if (response && response.code == 0) {
        Global.WEB_SOCKET.URL = response.data.serverAddress;
        Global.WEB_SOCKET.TOKEN = response.data.token;
      }
    }
    callBack(code);
  });
}

module.exports = {
  post: post, //post请求
  get: get, //get请求
  doLogin: doLogin,
};