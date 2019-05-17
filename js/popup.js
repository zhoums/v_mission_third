$(function() {
  $("#check_v").on("click", () => {
    chrome.runtime.sendMessage({
      greeting: "vTHEmission",
    }, function(response) {
      console.log('response');
    });
  })
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.greeting == 'popupTips') {
      $('#drtip').html(request.text)
    }
  })
})
