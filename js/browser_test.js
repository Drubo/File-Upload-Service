window.onload = function() {
	  function loadScript(file){
	      var head      = document.getElementsByTagName('head')[0];
	      var script    = document.createElement('script');
	      script.type   = 'text/javascript';
	      var result = '?';
	      if (!("WebSocket" in window)){
	        if(!("MozWebSocket" in window)){
	          result += 'webSocket=false&';
	        }else{
	          result += 'webSocket=true&';
	        }
	      }else{
	        result += 'webSocket=true&';
	      }

	      //alert(FlashDetect.major);
	      if(FlashDetect.versionAtLeast(10)){
	    	  result += 'flash=true&';
	      }else{
	    	  result += 'flash=false&';
	      }
	      
	      var support={"XHRsendAsBinary":false,"XHRupload":false,"fileReader":false,"formData":false};
	      var s_xhr=new XMLHttpRequest();
	      support.XHRsendAsBinary=("sendAsBinary" in s_xhr);
	      support.XHRupload=("upload" in s_xhr);
	      try{ // firefox,chrome
	        support.fileReader = !!new FileReader();
	      }catch(e){};
        try{ // firefox,chrome
	        support.formData = !!new FormData();
	      }catch(e){};
	      
	      if(!support.fileReader){
	    	  result += 'fileReader=false&';
	      }else{
	    	  result += 'fileReader=true&';
	      }
        if(!support.formData){
	        result += 'formData=false&';
	      }else{
	        result += 'formData=true&';
	      }
	      if(!support.XHRupload){
	        result += 'iframe=true&';
	        result += 'xhr_polling=false';
	      }else{
	        result += 'iframe=false&';
	        result += 'xhr_polling=true';
	      }
	      
	      script.src = file+result;  
	        
	      script.onload = script.onreadystatechange = function() {
	        // prevent memory leak in IE
	        //head.removeChild(script);
	        script.onload = null;
	      };
	      head.appendChild(script);
	  }
	  
	  loadScript('http://192.168.1.100:12345/client.js');
	  
	  function enableEvent(file){
		  var head      = document.getElementsByTagName('head')[0];
	      var script    = document.createElement('script');
	      script.type   = 'text/javascript';
	      script.src = file;
	      script.onload = script.onreadystatechange = function() {
		     // prevent memory leak in IE
		     //head.removeChild(script);
		     script.onload = null;
		  };
		  head.appendChild(script);
	  }
	  
	  enableEvent('http://192.168.1.100:12345/event.js');
}