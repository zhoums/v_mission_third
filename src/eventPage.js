// 入口
import config from './config'
import util from './util'
import Eventproxy from 'eventproxy'
import {
  darenCateTypeList,
  darenFansCountList,
  darenRoleList,
  vedioCateType,
  cateType,
  TWCateTypeList,
  darenChannel
} from './config'
// console.log('safd',vedioCateType,cateType)
//设置refer
let agentVersion = navigator.userAgent.toLowerCase().match(/chrome\/[\d.]+/gi).toString().match(/[\d]{1,}/g);
let bigVersion = Number(agentVersion[0]);

let kui = bigVersion >= 72 ? ["blocking", "requestHeaders", "extraHeaders"] : ["blocking", "requestHeaders"];
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    if (details.type === 'xmlhttprequest') {
      var exists = false;
      for (var i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'Referer') {
          exists = true;
          details.requestHeaders[i].value = 'https://v.taobao.com/';
          break;
        }
      }

      if (!exists) {
        details.requestHeaders.push({
          name: 'Referer',
          value: 'https://v.taobao.com/'
        });
      }

      return {
        requestHeaders: details.requestHeaders
      };
    }
  }, {
    urls: ['https://*.taobao.com/*']
  }, kui
);

let missionFlag = false;

let darenPageUrl = [];
let VSCtab;

let VTHpage = 1,
  VTHpagesize = 10,
  VTHtotalpage = 0;
let ep = new Eventproxy();

// chrome.browserAction.onClicked.addListener(function(tab) {
//   main();
// });
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting == 'vTHEmission') {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      VSCtab = tabs.length ? tabs[0].id : (VSCtab || null);
      checkIdentify().then(res => {
        if (missionFlag) {
          alert('已有任务在执行， 请先完成后再执行新任务。')
          return;
        }
        if (res.status == 0) {
          missionFlag = true;
          fetchFinishAllData(VTHpage, VTHpagesize)
        }
        if (res.status == 999) {
          chrome.tabs.sendRequest(VSCtab, {
            greeting: 'v-notLogin'
          }, function(response) {})
        }
      })
    });
  }
  if (request.greeting == 'vTHEmission_w') {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      VSCtab = tabs.length ? tabs[0].id : (VSCtab || null);
      checkIdentify().then(res => {
        console.log('missionFlag', missionFlag)
        if (missionFlag) {
          alert('已有任务在执行， 请先完成后再执行新任务。')
          return;
        }
        if (res.status == 0) {
          missionFlag = true;
          waitForVerifyOfmy()
        }
        if (res.status == 999) {
          chrome.tabs.sendRequest(VSCtab, {
            greeting: 'v-notLogin'
          }, function(response) {})
        }
      })
    });
  }
  if (request.greeting == 'vTHEmission_r') {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      VSCtab = tabs.length ? tabs[0].id : (VSCtab || null);
      checkIdentify().then(res => {
        if (missionFlag) {
          alert('已有任务在执行， 请先完成后再执行新任务。')
          return;
        }
        if (res.status == 0) {
          missionFlag = true;

          rejectedOfmy()
        }
        if (res.status == 999) {
          chrome.tabs.sendRequest(VSCtab, {
            greeting: 'v-notLogin'
          }, function(response) {})
        }
      })
    });
  }
  if (request.greeting == 'vTHEmission_p') {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      VSCtab = tabs.length ? tabs[0].id : (VSCtab || null);
      checkIdentify().then(res => {
        if (missionFlag) {
          alert('已有任务在执行， 请先完成后再执行新任务。')
          return;
        }
        if (res.status == 0) {
          missionFlag = true;
          nopayData()
        }
        if (res.status == 999) {
          chrome.tabs.sendRequest(VSCtab, {
            greeting: 'v-notLogin'
          }, function(response) {})
        }
      })
    });
  }
})

// v-mission third mission
ep.tail('postFinishAll', async function(postFinishAll) {
  util.sleep(200)
  postToWillbe(postFinishAll, '1').finally(() => {
    if (VTHpage < VTHtotalpage) {
      // if (VTHpage < 3) {
      VTHpage += 1;
      fetchFinishAllData(VTHpage, VTHpagesize)
    } else {
      VTHpage = 1;
      VTHtotalpage = 0;
      // missionFlag = false;
      fetchMissionIdList(VTHpage, VTHpagesize, 1)
      // waitForVerifyOfmy(); //test api1 cancel waitForVerifyOfmy now
    }
  })
})
ep.tail('postMyVerification', async (postMyVerification) => {
  util.sleep(200)
  postToWillbe(postMyVerification, '2').finally(() => {
    if (VTHpage < VTHtotalpage) {
      // if(VTHpage<10){
      VTHpage += 1;
      waitForVerifyOfmy(VTHpage, VTHpagesize)
    } else {
      VTHpage = 1;
      VTHtotalpage = 0;

      // rejectedOfmy();
      fetchMissionIdList(VTHpage, VTHpagesize, 2)
    }
  })

})
ep.tail('postMyRejection', async (postMyRejection) => {
  util.sleep(200)
  postToWillbe(postMyRejection, '3').finally(() => {
    if (VTHpage < VTHtotalpage) {
      // if (VTHpage < 3) {
      VTHpage += 1;
      rejectedOfmy(VTHpage, VTHpagesize)
    } else {
      VTHpage = 1;
      VTHtotalpage = 0;
      // missionFlag = false;
      // rejectedOfmy(); //todo:fetch userlist data;
      // nopayData(); //test
      fetchMissionIdList(VTHpage, VTHpagesize, 3)
    }
  })

})
ep.tail('postNopay', async function(postNopay) {
  util.sleep(200)
  postToWillbe(postNopay, '4').finally(() => {
    // util.sleep(100)
    if (VTHpage < VTHtotalpage) {
      // if (VTHpage < 3) {
      VTHpage += 1;
      nopayData(VTHpage, VTHpagesize)
    } else {
      VTHpage = 1;
      VTHtotalpage = 0;
      // missionFlag = false;
      fetchMissionIdList(VTHpage, VTHpagesize, 4); //取missionIdList
      // end
    }
  })
})
ep.tail('postDetail', async function(pageDetail) {
  let turn = pageDetail.pageLast;
  let code = pageDetail.code;
  delete pageDetail.pageLast;
  delete pageDetail.code;
  util.sleep(200)
  postDetailToWillbe(pageDetail).finally(() => {
    // util.sleep(5000)
    if (VTHpage <= VTHtotalpage) {
      // if (VTHpage < 3) {
      if (turn) {
        VTHpage += 1;
        // alert(VTHpage)
        fetchMissionIdList(VTHpage, VTHpagesize, code)
      }
    } else {
      VTHpage = 1;
      VTHtotalpage = 0;
      missionFlag = false;
      chrome.tabs.sendRequest(VSCtab, {
        greeting: "popupTips",
        text: `数据已经全部爬完了`
      }, function(response) {})
      // chrome.runtime.sendMessage({
      //   greeting: "popupTips",
      //   text: `数据已经全部爬完了`
      // }, function(response) {})
      // end
    }
  })
})

let checkIdentify = () => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: 'https://v.taobao.com/micromission/check_identity.do?_ksTS=1557732288829_45',
      success(response) {
        resolve(JSON.parse(response))
      },
      error(err) {
        reject(err);
      }
    })
  })
}
let function_fetchData = (param, emitFunName, url) => {
  url = url ? url : 'https://v.taobao.com/micromission/req/get_micro_mission_daren_merchant_by_status.do';
  util.sleep(200)
  $.ajax({
    url,
    data: param,
    success: async function(data) {
        let _data = JSON.parse(data);
        if (_data.status == 0) {
          VTHtotalpage = _data.data.result ? _data.data.result.pagination.totalPage : VTHtotalpage;
          ep.emit(emitFunName, _data.data.result)
        } else {
          ep.emit(emitFunName, {})
        }
      },
      error(err) {
        ep.emit(emitFunName, {})
      }
  })
}
let fetchFinishAllData = (page = 1, pageSize = VTHpagesize) => {
  let param = {
    current_page: page,
    pageSize: pageSize,
    micro_mission_status: -1,
    _tb_token_: '5731ae673367e',
    _ksTS: '1557802041473_69',
    _output_charset: 'UTF-8',
    _input_charset: 'UTF-8'
  };
  chrome.tabs.sendRequest(VSCtab, {
    greeting: "popupTips",
    text: `正在爬取“交付中&已完成”第${page}页数据。。。`
  }, function(response) {})
  // chrome.runtime.sendMessage({
  //   greeting: "popupTips",
  //   text: `正在爬取“交付中&已完成”第${page}页数据。。。`
  // }, function(response) {})
  function_fetchData(param, 'postFinishAll')
}
let waitForVerifyOfmy = (page = 1, pageSize = VTHpagesize) => {
  let param = {
    current_page: page,
    pageSize,
    micro_mission_status: 0,
    query_type: 0,
    owner_status: 1,
    _tb_token_: '5731ae673367e',
    _ksTS: '1557813941516_97',
    _output_charset: 'UTF-8',
    _input_charset: 'UTF-8'
  };
  chrome.tabs.sendRequest(VSCtab, {
    greeting: "popupTips",
    text: `正在爬取“待接单”第${page}页数据。。。`
  }, function(response) {})
  // chrome.runtime.sendMessage({
  //   greeting: "popupTips",
  //   text: `正在爬取“待接单”第${page}页数据。。。`
  // }, function(response) {})
  function_fetchData(param, 'postMyVerification')
}
let rejectedOfmy = (page = 1, pageSize = VTHpagesize) => {
  let param = {
    current_page: page,
    pageSize,
    micro_mission_status: 2,
    query_type: 0,
    owner_status: 1,
    _tb_token_: '5731ae673367e',
    _ksTS: '1557813941516_97',
    _output_charset: 'UTF-8',
    _input_charset: 'UTF-8'
  };
  chrome.tabs.sendRequest(VSCtab, {
    greeting: "popupTips",
    text: `正在爬取“被拒绝”第${page}页数据。。。`
  }, function(response) {})
  // chrome.runtime.sendMessage({
  //   greeting: "popupTips",
  //   text: `正在爬取“被拒绝”第${page}页数据。。。`
  // }, function(response) {})
  function_fetchData(param, 'postMyRejection')
}
let fetchMissionIdList = (page = 1, pageSize = 10, code) => {
  if (!code) {
    alert("Mission id is null")
    return;
  }
  chrome.tabs.sendRequest(VSCtab, {
    greeting: "popupTips",
    text: `正在爬取“详情页”第${page}页数据。。。。`
  }, function(response) {})
  // chrome.runtime.sendMessage({
  //   greeting: "popupTips",
  //   text: `正在爬取“详情页”第${page}页数据。。。。`
  // }, function(response) {})
  util.sleep(200)
  $.ajax({
    url: `${config.willbeServer}/tb/v_payment/get_v_payment_ids.wb`,
    data: {
      page,
      pageSize,
      code
    },
    headers: {
      "token": config.token
    },
    success: async function(data) {
        if (data.status == 0) {
          VTHtotalpage = data.result.maxPage;
          await fetchPageDetail(data.result.list, code); //todo 确认参数
        }

      },
      error(err) {
        alert('获取任务ID失败，请重新开始！')
      }
  })
}
let fetchPageDetail = (idList, code) => {
  idList.forEach((item, key) => {
    $.ajax({
      url: `https://v.taobao.com/micromission/get_mission_detail_info.do?mission_id=${item.missionId}&_ksTS=1557823555405_17`,
      success: function(data) {
        data = JSON.parse(data);
        if (key == idList.length - 1) {
          data.data.detail["pageLast"] = true;
        } else {
          data.data.detail["pageLast"] = false;
        }
        data.data.detail["code"] = code;
        if (!!data.data.detail) {
          ep.emit('postDetail', data.data.detail)
        }

      }
    })
    util.sleep(200)
  })
}
let nopayData = (page = 1, pageSize = VTHpagesize) => {
  let param = {
    current_page: page,
    pageSize: pageSize,
    micro_mission_status: 0,
    _tb_token_: '5731ae673367e',
    _ksTS: '1557802041473_69',
    _output_charset: 'UTF-8',
    _input_charset: 'UTF-8'
  };
  // console.log(`正在爬取“待我付款”数据第${page}页。`)
  chrome.tabs.sendRequest(VSCtab, {
    greeting: "popupTips",
    text: `正在爬取“待我付款”第${page}页数据。。。`
  }, function(response) {})
  // chrome.runtime.sendMessage({
  //   greeting: "popupTips",
  //   // text: `正在爬取“待我付款”数据第${page}页。`
  //   text: `正在爬取“待我付款”第${page}页数据。。。`
  // }, function(response) {})
  function_fetchData(param, 'postNopay', 'https://v.taobao.com/micromission/req/get_micro_mission_by_statusv2.do')
}
let postToWillbe = async (param, code = "") => {
  return new Promise((resolve, reject) => {
    let _p = JSON.stringify(param);
    $.ajax({
      url: config.willbeServer + '/tb/v_payment/sync_v_payment.wb',
      beforeSend: function(XMLHttpRequest) {
        XMLHttpRequest.setRequestHeader("token", config.token);
      },
      type: 'post',
      data: {
        param: _p,
        code
      },
      success(response) {
        // console.log('post to willbe result:', response)
        resolve(null)
      },
      error(error) {
        reject(error)
      }
    })
  })
  // let _p = JSON.stringify(param);
  // await $.ajax({
  //   url: config.willbeServer + '/tb/v_payment/sync_v_payment.wb',
  //   beforeSend: function(XMLHttpRequest) {
  //     XMLHttpRequest.setRequestHeader("token", config.token);
  //   },
  //   type: 'post',
  //   data: {
  //     param: _p,
  //     code
  //   },
  //   success(response) {
  //     // console.log('post to willbe result:', response)
  //   },
  //   error(error) {
  //     console.log('--0000---', error)
  //   }
  // })
}
let postDetailToWillbe = (parma) => {
  return new Promise((resolve, reject) => {
    let _p = JSON.stringify(parma);
    $.ajax({
      url: config.willbeServer + '/tb/v_payment/sync_v_payment_detail.wb',
      beforeSend: function(XMLHttpRequest) {
        XMLHttpRequest.setRequestHeader("token", config.token);
      },
      type: 'post',
      data: {
        param: _p,
      },
      success(response) {
        // console.log('post to willbe result:', response)
        resolve(null)
      },
      error(error) {
        reject(error)
      }
    })
  })

}