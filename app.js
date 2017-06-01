/**
 * @fileOverview 微信小程序的入口文件
 */

var qcloud = require('./vendor/qcloud-weapp-client-sdk/index');
var config = require('./config');
// 显示繁忙提示
var showBusy = text => wx.showToast({
  title: text,
  icon: 'loading',
  duration: 10000
});

// 显示成功提示
var showSuccess = text => wx.showToast({
  title: text,
  icon: 'success'
});

// 显示失败提示
var showModel = (title, content) => {
  wx.hideToast();

  wx.showModal({
    title,
    content: JSON.stringify(content),
    showCancel: false
  });
};

App({
  /**
   * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
   */
  globalData: {
    userInfo: null,
    clientModel: '',
    clientUserid: '',
    clientVersion: '',
    clientSystem: '',
    clientPlatform: '',
    clientSDKVersion: '',
    welcome: '进入巧遇游'
  },
  onLaunch() {
    qcloud.setLoginUrl(config.service.loginUrl);

  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      qcloud.login({
        success(result) {
          //showSuccess('登录成功');
          console.log('登录成功', result);
          that.globalData.userInfo = result;
          typeof cb == "function" && cb(that.globalData.userInfo);

        },
        fail(error) {
          showModel('登录失败', error);
          console.log('登录失败', error);
        }
      });

    }
  }, 
  addGlobalData:function(){
    // wx.request({
    //   url: config.service.testUrl,
    //   data: {
    //     userid: 10000018
    //   },
    //   header: {
    //     'userid': app.globalData.userInfo.userid,
    //     'model': app.globalData.clientModel,
    //     'version': app.globalData.clientVersion,
    //     'system': app.globalData.clientSystem,
    //     'platform': app.globalData.clientPlatform,
    //     'SDKVersion': app.globalData.clientSDKVersion
    //   },
    //   success: function (res) {
    //     console.log(res.data)
    //   }
    // })
  },
  clearSession:function() {
    // 清除保存在 storage 的会话信息
    qcloud.clearSession();
    showSuccess('会话已清除');
  }


});