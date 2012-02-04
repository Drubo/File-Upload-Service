(function() {
	if(!!new FileReader()){
		//go ahead
	}else{
		return;
	}
	
	var logger;
	if (window.WEB_SOCKET_LOGGER) {
	  logger = WEB_SOCKET_LOGGER;
	} else if (window.console && window.console.log && window.console.error) {
	  // In some environment, console is defined but console.log or console.error is missing.
	  logger = window.console;
	} else {
	  logger = {log: function(){ }, error: function(){ }};
	}
	
	FileReader = function(filePath){
		var self = this;
		self.__id = FileReader.__nextId++;
		FileReader.__instances[self.__id] = self;
		
		self.__createTask = setTimeout(function() {
		  FileReader.__addTask(function() {
		    self.__createTask = null;
		    FileReader.__flash.create(self.__id, filePath);
		  });
		}, 0);
	};
})();