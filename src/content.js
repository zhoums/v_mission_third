 chrome.extension.onRequest.addListener(
   function(request, sender, sendResponse) {
     if (request.greeting == 'v-notLogin') {
       console.log('v-notLogin')
       alert('Please login first!')
     }
     if (request.greeting == 'popupTips') {
       if ($('#drtip').length) {
         $('#drtip').html(request.text)
       } else {
         $("body").prepend('<div id="drtip" style="position:fixed; top:5px;right:45%; padding:10px; border:1px solid #f50; background:rgba(130,20,20,.2);z-index:100000;">' + request.text + '</div>')
       }
     }
   });
 $(function() {})
