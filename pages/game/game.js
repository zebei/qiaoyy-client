"use strict";

// 引入 co 和 promisify 帮助我们进行异步处理
const co = require('../../lib/co.js');
const promisify = require('../../lib/promisify.js');

// 生成随机用户 ID
const uuid = require('../../lib/uuid.js');

// 支持 SocketIO
const WxSocketIO = require('../../lib/wxsocket.io.js');

// 小程序配置
const appConfig = require('../../config.js');

// 需要使用的微信 API，转成返回 Promise 的接口
const login = promisify(wx.login);
const getUserInfo = promisify(wx.getUserInfo);
const getSystemInfo = promisify(wx.getSystemInfo);

// 获得小程序实例
const app = getApp();

// 定义页面
Page({
  data: {
    // 是否已经和服务器连接并且完成 hello-hi 交流
    connected: false,

    // 游戏是否进行中
    playing: false,

    // 当前游戏状态
    gameState: "uninitialized",

    // 当前需要展示的游戏信息
    gameInfo: "",

    // 开始游戏按钮文本
    startButtonText: "开始",

    //「我」的信息，包括昵称、头像、分数、选择
    myName: "",
    myAvatar: null,
    myScore: 0,
    myStreak: 0,
    myChoice: Math.floor(Math.random() * 10000) % 3 + 1,

    //「你」的信息
    youHere: false,
    yourName: "",
    yourAvatar: null,
    yourScore: 0,
    yourStreak: 0,
    yourChoice: 1,
    yourMove: 0,

    // 取得胜利的是谁
    win: null
  },

  // 页面显示后，进行登录和链接，完成后开始启动游戏服务
  onShow: co.wrap(function* () {
    try {
      yield this.login();
      yield this.connect();
    } catch (error) {
      console.error('error on login or connect: ', error);
    }
    this.setData({
      myScore: app.globalData.userInfo.score
    });
    this.serve();
  }),

  // 微信登录后获得用户信息
  login: co.wrap(function* () {
    // this.setData({ gameInfo: "正在登陆" });
    // const loginResult = yield login();
    // const userInfo = yield getUserInfo();
    const { nickName, avatarUrl } = app.globalData.userInfo;
    this.setData({ myName: nickName, myAvatar: avatarUrl })
  }),
  connect: co.wrap(function* () {
    var that = this;
    wx.connectSocket({
      url: 'ws://localhost:12306/websocket?userid=' + app.globalData.userInfo.userId,
     
    })
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！');
      // wx.sendSocketMessage({
      //   data: "1113333"
      // });
      that.setData({ gameInfo: "准备", connected: true });
    })
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！')
    })
  }),
  

  // 开始进行游戏服务
  serve: co.wrap(function* () {
    const socket = this.socket;
    var that=this;
    wx.onSocketMessage(function (res) {
      console.log('收到服务器内容：' + res.data)
      if (JSON.parse(res.data).code == app.globalData.sysCode.STONE_START) {
        //start开始游戏逻辑
        const result = JSON.parse(res.data).data;
        const you = result.roomUsers.find(user => user.Id !== app.globalData.userInfo.userId);
        console.log(you);
        that.setData({
          youHere: true,
          yourName: you.nickName,
          yourAvatar: you.avatarUrl,
          yourScore: you.score,
          playing: true,
          gameInfo: "准备"
        });

        let gameTime = result.gameTime;
        clearInterval(that.countdownId);
        that.countdownId = setInterval(() => {
          if (gameTime > 0) {
            that.setData({ gameInfo: --gameTime });
          } else {
            clearInterval(this.countdownId);
          }
        }, 1000);
        //发送用户选择
        var tempData = {
          operation: "changeChoice",
          choice: that.data.myChoice,
          userId: app.globalData.userInfo.userId,
        }
        var sendData = {
          game: app.globalData.apiCode.stone,
          data: tempData
        };
        wx.sendSocketMessage({
          data: JSON.stringify(sendData)
        });
      } else if (JSON.parse(res.data).code == app.globalData.sysCode.STONE_END) {
        //end游戏结算逻辑
        // 清除计时器
        clearInterval(that.countdownId);
        var result = JSON.parse(res.data).data;
          // 双方结果
        const myResult = result.find(x => x.userid == app.globalData.userInfo.userId);
        const yourResult = result.find(x => x.userid != app.globalData.userInfo.userId);

          // 本局结果
          let gameInfo, win = 'nobody';
          if (myResult.roundScore == 0 && yourResult.roundScore == 0) {
            gameInfo = '平局';
          }
          else if (myResult.roundScore > 0) {
            gameInfo = '胜利';
            win = 'me';
          }
          else {
            gameInfo = '失误';
            lose = true;
            win = 'you'
          }

          // 更新到视图
          that.setData({
            gameInfo,
            myScore: myResult.totalScore,
           // myStreak: myResult.winStreak,
            yourChoice: yourResult.choice,
            yourScore: yourResult.totalScore,
           // yourStreak: yourResult.winStreak,
            gameState: 'finish',
            win,
            startButtonText: win == 'you' ? "不服" : "再来",
            done: true
          });

          setTimeout(() => that.setData({ playing: false }), 1000);
      }
    });
   
  }),

  // 点击开始游戏按钮，发送加入游戏请求
  startGame: co.wrap(function* () {
    if (this.data.playing) return;
    const socket = this.socket;
    let myChoice = this.data.myChoice
    console.log(app.globalData.userInfo.userId);
    var tempData = {
      operation: "join",
      choice: myChoice,
      userId: app.globalData.userInfo.userId,
    }
    var sendData = {
      game: app.globalData.apiCode.stone,
      data: tempData
    };
    wx.sendSocketMessage({
      data: JSON.stringify(sendData)
    });
    this.setData({
      playing: false,
      done: false,
      gameInfo: '正在寻找玩伴...'
    });

  }),

  // 点击手势，更新选择是石头、剪刀还是布
  switchChoice(e) {
    console.log("1111");
    if (this.data.playing) return;
    let myChoice = this.data.myChoice + 1;
    if (myChoice == 4) {
      myChoice = 1;
    }
    this.setData({ myChoice });
    //发送用户改变选项消息
    var tempData = {
      operation: "changeChoice",
      choice: myChoice,
      userId: app.globalData.userInfo.userId,
    }
    var sendData = {
      game: app.globalData.apiCode.stone,
      data: tempData
    };
    wx.sendSocketMessage({
      data: JSON.stringify(sendData)
    });
  }
});
