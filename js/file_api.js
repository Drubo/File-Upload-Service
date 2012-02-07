(function() {
	var logger;
	if (window.console && window.console.log && window.console.error) {
	  // In some environment, console is defined but console.log or console.error is missing.
	  logger = window.console;
	} else {
	  logger = {log: function(){ }, error: function(){ }};
	}
	
	FileReader.__initialized = false;
	FileReader.__flash = null;
	FileReader.__tasks = [];
	
	var fileName = '';
	var fileSize = '';
	var fileData = '';
	
	/**
	   * Loads WebSocketMain.swf and creates WebSocketMain object in Flash.
	   */
	FileReader.__initialize = function() {
	  if (FileReader.__initialized) return;
	  FileReader.__initialized = true;

	  if (FileReader.__swfLocation) {
	    // For backword compatibility.
	    window.FILE_API_SWF_LOCATION = FileReader.__swfLocation;
	  }
	  if (!window.FILE_API_SWF_LOCATION) {
	    logger.error("[FileReader] set FILE_API_SWF_LOCATION to location of FileAPI.swf");
	    return;
	  }

	 //var container = document.createElement("div");
	  container = $("#browse_botton_div");
	    // Hides Flash box. We cannot use display: none or visibility: hidden because it prevents
	    // Flash from loading at least in IE. So we move it out of the screen at (-100, -100).
	    // But this even doesn't work with Flash Lite (e.g. in Droid Incredible). So with Flash
	    // Lite, we put it at (0, 0). This shows 1x1 box visible at left-top corner but this is
	    // the best we can do as far as we know now.
	 // container.style.position = "absolute";
	  container.css("top", "5px");
	  container.css("left", "5px");
	  container.css("position", "relative");
	  var holder = document.createElement("div");
	  holder.id = "fileReaderFlash";
	  container.html(holder);
	  //document.body.appendChild(container);
	  // See this article for hasPriority:
	  // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
	  swfobject.embedSWF(
	    FILE_API_SWF_LOCATION,
	    "fileReaderFlash",
	    "70" /* width */,
	    "25" /* height */,
	    "10.0.0" /* SWF version */,
	    null,
	    null,
	    {hasPriority: true, swliveconnect : true, allowScriptAccess: "always"},
	    null,
	    function(e) {
	      if (!e.success) {
	        logger.error("[FileReader] swfobject.embedSWF failed");
	      }
	    }
	  );
	  //FileReader.__onFlashInitialized();
	};
	  
	/**
	 * Called by Flash to notify JS that it's fully loaded and ready
	 * for communication.
	 */
	FileReader.__onFlashInitialized = function() {
	  // We need to set a timeout here to avoid round-trip calls
	  // to flash during the initialization process.
	  setTimeout(function() {
		FileReader.__flash = document.getElementById("fileReaderFlash");
		FileReader.__flash.setDebug(!!window.FILE_API_DEBUG);
	    for (var i = 0; i < FileReader.__tasks.length; ++i) {
	      FileReader.__tasks[i]();
	    }
	    FileReader.__tasks = [];
	  }, 0);
	};
	
	// Called by Flash.
	FileReader.__log = function(message) {
	  logger.log(decodeURIComponent(message));
	};
	
	// Called by Flash.
	FileReader.__getData = function(file_data){
		fileData = file_data;
	};
	
	FileReader.__getSize = function(file_size){
		fileSize = file_size;
	};

	FileReader.__getName = function(file_name){
		fileName = file_name;
	};
	
	FileReader.__takeAction = function(){
		window.wsfu.fileSelected(fileName, fileSize, fileData);
	}
	// Called by Flash.
	FileReader.__error = function(message) {
	  logger.error(decodeURIComponent(message));
	};
	  
	FileReader.__addTask = function(task) {
	  if (FileReader.__flash) {
	    task();
	  } else {
		FileReader.__tasks.push(task);
	  }
	};
	  
	/**
	 * Test if the browser is running flash lite.
	 * @return {boolean} True if flash lite is running, false otherwise.
	 */
	FileReader.__isFlashLite = function() {
	  if (!window.navigator || !window.navigator.mimeTypes) {
	    return false;
	  }
	  var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
	  if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
	    return false;
	  }
	  return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false;
	};
	  
	if (!window.FILE_API_DISABLE_AUTO_INITIALIZATION) {
	  // NOTE:
	  //   This fires immediately if file_api.js is dynamically loaded after
	  //   the document is loaded.
	  swfobject.addDomLoadEvent(function() {
		FileReader.__initialize();
	  });
	}
})();