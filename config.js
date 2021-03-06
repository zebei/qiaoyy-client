/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
// var host = '10491410.qcloud.la';

// var config = {

//     // 下面的地址配合云端 Demo 工作
//     service: {
//         host,

//         // 登录地址，用于建立会话
//         loginUrl: `https://${host}/login`,

//         // 测试的请求地址，用于测试会话
//         requestUrl: `https://${host}/user`,

//         // 测试的信道服务地址
//         tunnelUrl: `https://${host}/tunnel`,
//     }
// };

// var host = 'localhost:22306';
// var sockethost ='localhost:12306';
var host = '123.206.6.223:22306';
var sockethost ='123.206.6.223:12306';
var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `http://${host}/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `http://${host}/user`,

        // 测试的信道服务地址
        tunnelUrl: `http://${host}/tunnel`,

        testUrl: `http://${host}/test/test`,
        websocketUrl: `wss://${sockethost}/`,

        
        
    }
    
};


module.exports = config;