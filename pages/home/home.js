//获取应用实例
var app = getApp()
var config = require('../../config');
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');
Page({
  data: {
    motto: app.globalData.welcome,
    userInfo: {}
  },
  onLoad: function () {
    console.log('onLoad init');
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    });
    wx.getSystemInfo({
      success: function (res) {
        app.globalData.clientModel = res.model;
        app.globalData.clientVersion = res.version;
        app.globalData.clientSystem = res.system;
        app.globalData.clientPlatform = res.platform;
        app.globalData.clientSDKVersion = res.SDKVersion;
      }
    });
  },
  clearLogin: function () {
    console.log('clearLogin');
    app.clearSession();
  },


  doTest: function () {
    wx.request({
      url: config.service.testUrl,
      data: {
        userid: 10000018
      },
      header: {
        'userid': app.globalData.userInfo.userId,
        'model': app.globalData.clientModel,
        'version': app.globalData.clientVersion,
        'system': app.globalData.clientSystem,
        'platform': app.globalData.clientPlatform,
        'SDKVersion': app.globalData.clientSDKVersion
      },
      success: function (res) {
        console.log(res.data)
      }
    })
  },
  gotogame:function(){
    wx.navigateTo({
      url: '../game/game'
    })
  },
  gotoindex: function () {
    wx.navigateTo({
      url: '../index/index'
    })
  }


})
