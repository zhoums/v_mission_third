$(function() {
  $("#check_v_f").on("click", () => {
    chrome.runtime.sendMessage({
      greeting: "vTHEmission",
    }, function(response) {
      console.log('response');
    });
  })
  $("#check_v_w").on("click", () => {
    chrome.runtime.sendMessage({
      greeting: "vTHEmission_w",
    }, function(response) {
      console.log('response');
    });
  })
  $("#check_v_r").on("click", () => {
    chrome.runtime.sendMessage({
      greeting: "vTHEmission_r",
    }, function(response) {
      console.log('response');
    });
  })
  $("#check_v_p").on("click", () => {
    chrome.runtime.sendMessage({
      greeting: "vTHEmission_p",
    }, function(response) {
      console.log('response');
    });
  })
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting == 'popupTips') {
      console.log('TIPS', $('#drtip').length, request.text)
      $('#drtip').html(request.text)
    }
  })
})