let willbeServer = 'http://47.107.35.8:8281/spider-oper';
// console.log(process.env.NODE_ENV,willbeServer)
if (process.env.NODE_ENV == "development") {
  willbeServer = 'http://spider.ittun.com/spider-oper'
} else if (process.env.NODE_ENV == 'local') {
  willbeServer = 'http://spider.ittun.com/spider-oper'
}
let config = {
  token: 'KE923jddudk3FYjWedkHH',
  willbeServer: willbeServer
}

export default config;
