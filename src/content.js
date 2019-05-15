 chrome.extension.onRequest.addListener(
   function(request, sender, sendResponse) {
     if(request.greeting=='v-notLogin'){
       console.log('v-notLogin')
       alert('Please login first!')
     }
   });
 $(function() {
   chrome.runtime.sendMessage({
     greeting:'vTHEmission',
   }, function(response){});

 })
