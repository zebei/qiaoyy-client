//index.js
//获取应用实例
var app = getApp()
 var config = require('../../config');
Page({
  data: {
    motto: app.globalData.welcome,
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoadHome')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    }),
      wx.getSystemInfo({
        success: function (res) {
          console.log(res.model)
          console.log(res.pixelRatio)
          console.log(res.windowWidth)
          console.log(res.windowHeight)
          console.log(res.language)
          console.log(res.version)
          console.log(res.platform)
          console.log(res.SDKVersion);
          console.log(res.system);

          app.globalData.clientModel = res.model;
          app.globalData.clientVersion = res.version;
          app.globalData.clientSystem = res.system;
          app.globalData.clientModel = res.platform;
          app.globalData.clientSDKVersion = res.SDKVersion;
        }
      });
  },
  doTest:function(){
    console.log('doTest init');
    wx.request({
      url: config.service.testUrl, 
      data: {
        userid: 10000018
      },
      header: {
        'userid': this.data.userInfo.userid,
        'model': app.globalData.clientModel,
        'version':app.globalData.clientVersion,
        'system':app.globalData.clientSystem,
        'platform':app.globalData.clientPlatform,
        'SDKVersion':app.globalData.clientSDKVersion
      },
      success: function (res) {
        console.log(res.data)
      }
    })
  }
})
