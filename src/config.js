let willbeServer = 'http://47.107.35.8:8281/spider-oper';
// console.log(process.env.NODE_ENV,willbeServer)
if (process.env.NODE_ENV == "development") {
  willbeServer = 'http://spider.ittun.com/spider-oper'
} else if (process.env.NODE_ENV == 'local') {
  willbeServer = 'http://spider.ittun.com/spider-oper'
}
let config = {
  token: 'KE923jddudk3FYjWedkHH',
  willbeServer: willbeServer,
  idItems:100,//获取id接口每页获取ID的条目数
  splitTimeOfDetailpage:200,//详情的每个详情页之间相隔 200毫秒
  splitTimeOfItempage:2000,//列表的每一页之间间隔2秒；
}

export default config;
