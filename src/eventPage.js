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

let darenPageUrl = [];
let VSCtab;

let VTHpage=1,
    VTHpagesize=10,
    VTHtotalpage=0;
let ep = new Eventproxy();
ep.tail('postFinishAll',async function(postFinishAll){
  //await post(postFinishAll);
  util.sleep(1000)
  // if(VTHpage<VTHtotalpage){
  if(VTHpage<3){
    VTHpage+=1;
    fetchFinishAllData(VTHpage,VTHpagesize)
  }else{
    VTHpage=1;
    VTHtotalpage=0;
    waitForVerifyOfmy();
  }
})
ep.tail('postMyVerification',async (postMyVerification)=>{
  //await post(postMyVerification);
  util.sleep(1000)
  if(VTHpage<VTHtotalpage){
  // if(VTHpage<10){
    VTHpage+=1;
    waitForVerifyOfmy(VTHpage,VTHpagesize)
  }else{
    VTHpage=1;
    VTHtotalpage=0;
    rejectedOfmy();
  }
})
ep.tail('postMyRejection',async (postMyRejection)=>{
  //await post(postMyRejection);
  util.sleep(1000)
  // if(VTHpage<VTHtotalpage){
  if(VTHpage<3){
    VTHpage+=1;
    rejectedOfmy(VTHpage,VTHpagesize)
  }else{
    VTHpage=1;
    VTHtotalpage=0;
    // rejectedOfmy(); //todo:fetch userlist data;
    nopayData(); //test
  }
})
ep.tail('postDetailPage',function(postDetailPage){
  console.log('ll function')
})
ep.tail('postNopay',function(postNopay){
  //await post(postNopay);
  util.sleep(1000)
  if(VTHpage<VTHtotalpage){
  // if(VTHpage<3){
    VTHpage+=1;
    nopayData(VTHpage,VTHpagesize)
  }else{
    VTHpage=1;
    VTHtotalpage=0;
    // rejectedOfmy();
  }
})
// chrome.browserAction.onClicked.addListener(function(tab) {
//   main();
// });
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting == 'vTHEmission'){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      VSCtab = tabs.length ? tabs[0].id: null;
      checkIdentify().then(res=>{
        if(res.status==0){
          fetchFinishAllData(VTHpage,VTHpagesize)
        }
        if(res.status==999){
          chrome.tabs.sendRequest(VSCtab,{
            greeting:'v-notLogin'
          },function(response){})
        }
      })
    });
  }
})

// v-mission third mission
let checkIdentify=()=>{
  return new Promise((resolve,reject)=>{
    $.ajax({
      url:'https://v.taobao.com/micromission/check_identity.do?_ksTS=1557732288829_45',
      success(response){
        resolve(JSON.parse(response))
      },
      error(err){
        reject(err);
      }
    })
  })
}
let function_fetchData = (param,emitFunName,url)=>{
  url=url?url:'https://v.taobao.com/micromission/req/get_micro_mission_daren_merchant_by_status.do';
  $.ajax({
    url,
    data:param,
    success:async function(data){
      let _data= JSON.parse(data);
      if(_data.status==0){
        VTHtotalpage=_data.data.result?_data.data.result.pagination.totalPage:VTHtotalpage;
        //todo 详情页
        //https://v.taobao.com/micromission/get_mission_detail_info.do?mission_id=15947767153&_ksTS=1557823555405_17
        if(param.micro_mission_status&&param.micro_mission_status==-1){
          for(let i=0;i<_data.data.result.microMissions.length;i++){
            let id=_data.data.result.microMissions[i].microSubmissions[0].id;
            await $.ajax({
              url:`https://v.taobao.com/micromission/get_mission_detail_info.do?mission_id=${id}&_ksTS=1557823555405_17`,
              success(data){
                console.log('detail page',JSON.parse(data));
                ep.emit('postDetailPage',JSON.parse(data))//post detail page data
              }
            })
          }
        }
        console.log('emit next')
        ep.emit(emitFunName,_data.data.result)
      }else{
        ep.emit(emitFunName,{})
      }
    },
    error(err){
      ep.emit(emitFunName,{})
    }
  })
}
let fetchFinishAllData = (page=1,pageSize=VTHpagesize)=>{
    let param = {
      current_page:page,
      pageSize:pageSize,
      micro_mission_status:-1,
      _tb_token_:'5731ae673367e',
      _ksTS:'1557802041473_69',
      _output_charset:'UTF-8',
      _input_charset:'UTF-8'
    };
    function_fetchData(param,'postFinishAll')
}
let waitForVerifyOfmy = (page=1,pageSize=VTHpagesize)=>{
  let param = {
    current_page:page,
    pageSize,
    micro_mission_status:0,
    query_type:0,
    owner_status:1,
    _tb_token_:'5731ae673367e',
    _ksTS:'1557813941516_97',
    _output_charset:'UTF-8',
    _input_charset:'UTF-8'
  };
  function_fetchData(param,'postMyVerification')
}
let rejectedOfmy = (page=1,pageSize=VTHpagesize)=>{
  let param = {
    current_page:page,
    pageSize,
    micro_mission_status:2,
    query_type:0,
    owner_status:1,
    _tb_token_:'5731ae673367e',
    _ksTS:'1557813941516_97',
    _output_charset:'UTF-8',
    _input_charset:'UTF-8'
  };
  function_fetchData(param,'postMyRejection')
}
let fetchDarenList = ()=>{
  $.ajax({
    url:'',
    data:'',
    success(data){
      ep.emit('',idLIST)//
    },
    error(){

    }
  })
}
let nopayData =  (page=1,pageSize=VTHpagesize)=>{
  let param = {
    current_page:page,
    pageSize:pageSize,
    micro_mission_status:0,
    _tb_token_:'5731ae673367e',
    _ksTS:'1557802041473_69',
    _output_charset:'UTF-8',
    _input_charset:'UTF-8'
  };
  function_fetchData(param,'postNopay','https://v.taobao.com/micromission/req/get_micro_mission_by_statusv2.do')
}
