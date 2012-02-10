function WebSocketFileUploader(file_container, block_size) 
{

  // Initialize

  var uploader = this;
  var cancelled_upload;
  var paused_upload;

  var wsc;
 // var reader = new FileReader();
  var blob;
  
  var start_time;

  var file = new Array();
  //var file['file['index']'];
  //var file['start_file_index'];

  var fc = $(file_container);
  var file_progress_bar = fc.find('.file_progress_bar');
  var file_progress = fc.find('.file_progress');
  var file_information = fc.find('.file_information');
  var file_upload_button = fc.find('.file_upload_button');
  var file_browse_button = fc.find('#browse_button_div');
  var file_pause_button = fc.find('.file_pause_button');
  var file_cancel_button = fc.find('.file_cancel_button');
  var file_resume_button = fc.find('.file_resume_button');
  var file_reupload_button = fc.find('.file_reupload_button');
  var file_name_input = fc.find('.file_name_input');
  var file_buttons = fc.find(':button');


  // Privileged

  this.initialize = function()
  {
    //if (!supported()) return false;
    reset_upload();
    bind_events();
    return true;
  }

  this.upload_complete = function() {
	wsc.close();
    wsc=null;
    file_buttons.hide();
    file_browse_button.show();
    file_progress.html('');
    file_information.html(file['name']+' Uploaded.')
  }

  this.upload_cancelled = function() {
    // to be overriden
  }


  // Private

  function reset_upload() 
  {
    file_buttons.hide();
    file_browse_button.show();
    cancelled_upload = false;
    paused_upload = false;
    file_information.html('');
    file_progress.html('');
    file_progress_bar.progressbar({value:0});
  }

  function error(message) 
  {
    reset_upload();
    file_information.html(message);
  }
  
  function onabort(event) 
  {
    error('File upload aborted');
    reader.abort();
  }

  function onerror(event)
  {
    switch(event.target.error.code) {
      case event.target.error.NOT_FOUND_ERR:
        error('File not found');
        break;
      case event.target.error.NOT_READABLE_ERR:
        error('File is not readable');
        break;
      case event.target.error.ABORT_ERR:
        error('File upload aborted');
        break;
      default:
        error('An error occurred reading the file.');
    };
  }

  function deliver_slice(data)
  {
	var edata = window.btoa(data);
	return wsc.send("upload=>"+edata.length+"||"+edata);
  }

  function calculate_eta()
  {
    var delta_ms = Date.now() - start_time;
    var rate = (file['index']- file['start_file_index']) / delta_ms; 
    var remaining_ms = (file['size'] - file['index']) / rate; 
    var delta_hr = parseInt(Math.floor(remaining_ms/3600000));
    remaining_ms -= delta_hr*3600000;
    var delta_min = parseInt(Math.floor(remaining_ms/60000));
    remaining_ms -= delta_min*60000;
    var delta_sec = parseInt(Math.floor(remaining_ms/1000));
    if (delta_sec>10) delta_sec = parseInt(Math.floor(delta_sec/10)*10);
    var eta = "";
    if (delta_sec>0) eta = delta_sec + " secs";
    if (delta_min>0) eta = delta_min + " mins";
    if (delta_hr>0) eta = delta_hr + " hours";
    if (delta_ms>5000) file_progress.html(eta);  
  }
  
  function update_progress_bar()
  {
    var progress = Math.floor(100 * file['index'] / file['size']);
    file_progress_bar.progressbar({value: progress});
  }
  
  function read_file(){
    if (file.webkitSlice) {
    	blob = file.webkitSlice();
    } else if (file.mozSlice) {
    	blob = file.mozSlice();
    }else{
    	blob = file.Slice();
    }
  }

  function read_slice(start, length) 
  {
	  deliver_slice(blob);
  }
  
  function onloadstart(){
	  file_information.html('Uploading '+file['name']+' ...');  
  }
  
  function onloadend(event) 
  { 
	// Deliver block
    if (deliver_slice(event.target.result) == false) {
	    error('Error delivering data to server');
	    return;
	  }
    
    file['index'] += block_size;
    if(file['index']>file['size']){
    	file['index'] = file['size'];
    }
    
    calculate_eta();

    update_progress_bar();

    if (file['index']>=file['size']) {
      // Upload complete
      uploader.upload_complete();
	}
  }

  function begin_upload() 
  {
    file_buttons.hide();
    file_browse_button.css('display', 'none');
    file_pause_button.show();
    file_cancel_button.show();
    file_progress.html('');
    
    start_time = Date.now();
    file['start_file_index'] = file['index'];
    if (paused_upload) {
      paused_upload = false;
    } else {
      var result = wsc.send("command=>upload||"+file['name']+"||"+file['size']+"||"+file['index']);   
      if (!result) error('Failed to send data to server');
    }
  
    read_slice(file['index'], block_size);
  }

  function handle_file_exists_response(size) 
  {
    file['index'] = size;
    file_buttons.hide();
    file_browse_button.show();
    file_reupload_button.show();
    if (file['index']<file['size']) {
      file_resume_button.show();
      file_progress.html('Upload incomplete');
    } else {    
      file_progress.html('File exists');
    }
    update_progress_bar();
  }
  
  function receive_message(message)
  {
    var args = message.data.split(/=>/);
    var control = args.shift();
    var params = args[0].split('||');

    // parse response
    if (control.match(/^response$/i)) {
      var query = params.shift();
      if (query=='exist') {
        file['index'] = 0;
        var size = parseInt(params.shift());
        if (size>0) handle_file_exists_response(size);
      }
      if (query=='upload') {
        var size = parseInt(params.shift());
wsc.send("command=>stop");
return;
        if (!paused_upload && !cancelled_upload && size==file['index'] && file['index']<file['size']) {
          read_slice(file['index'], block_size);
        }	
    
	    // User paused upload
	    if (paused_upload) file_progress.html('');

	    // User cancelled upload
	    if (cancelled_upload) {  
	      reset_upload();
	      file_progress.html('');
	      wsc.send("command=>stop");
	      uploader.upload_cancelled();
	    }
	    
	    //Chunk size mismatch, so Resend the chunk
	    if(size != file['index']){
	    	file['index'] = size;
		    //File Size Mismatch
		    if(file['index']>file['size']){
		    	error('File size mismatch');
		    }else{
		    	read_slice(file['index'], block_size);
		    }
	    }else{
		    //File Size Mismatch
		    if(file['index']>file['size']){
		    	error('File size mismatch');
		    }
	    }
      }
    }

    // handle errors from server      
    if (control.match(/^error$/i)) {
      error(args[0]);           
    }
  }

  function query_file()
  {
      if(allowedTypes!='undefined'){
      	wsc.send("command=>allowedTypes||"+allowedTypes);
      }
	  wsc.send("query=>exist||"+file['name']+"||"+file['size']);
  }

  function connect_websocket()
  {
    if (!wsc) {
      var host = "ws://"+hostFromServer;
      wsc = new WebSocketClient(host);   
      if (!wsc.initialize()) {
	      error('Failed to connect to websocket server at '+host);
	      return false;
	    }
      wsc.socket.onmessage = receive_message;
      wsc.socket.onopen = query_file;
    } else {
      query_file();
    }
    return true;
  }
  
  this.fileSelected = function(fileName, fileSize, fileData){
      file['name'] = fileName;
      file['size'] = fileSize;
      blob = fileData;
      //var byteArray = new Uint8Array(fileData);
 //console.log(byteArray);     
   //   for (var i = 0; i < byteArray.byteLength; i++) { 
    //	  blob += byteArray[i];
     // }
console.log(blob);
      file_information.html(file['name']);
      file_progress.html('');
      file_buttons.hide();
      file_browse_button.show();
      file_upload_button.show();
      file_progress_bar.progressbar({value:0});
      connect_websocket();
      
      return true;
  }
  
  function bind_events()
  {
    // Start upload button
     file_upload_button.bind('click', {uploader: this}, function (e) {
      begin_upload();
      return false; 
    });

    // Reupload button
     file_reupload_button.bind('click', {uploader: this}, function (e) {
      file['index'] = 0;
      begin_upload();
      return false; 
    });

    // Cancel upload button
    file_cancel_button.bind('click', {uploader: this}, function (e) { 
      reset_upload();
      file_progress.html('Canceling...');
      cancelled_upload=true;
      return false;
    });

    // Pause upload button
    file_pause_button.bind('click', {uploader: this}, function (e) { 
      paused_upload=true;
      file_cancel_button.hide();
      file_pause_button.hide();
      file_resume_button.show();
      file_progress.html('');
      return false;
    });

    // Resume upload button
    file_resume_button.bind('click', {uploader: this}, function (e) { 
      begin_upload();
      return false;
    });
  }

}
