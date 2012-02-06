function WebSocketFileUploader(file_container, block_size) 
{

  // Initialize

  var uploader = this;
  var cancelled_upload;
  var paused_upload;

  var wsc;
  var reader = new FileReader();
  var blob;
  
  var start_time;

  var file;
  var file_index;
  var start_file_index;

  var fc = $(file_container);
  var file_progress_bar = fc.find('.file_progress_bar');
  var file_progress = fc.find('.file_progress');
  var file_information = fc.find('.file_information');
  var file_upload_button = fc.find('.file_upload_button');
  var file_browse_button = fc.find('.file_browse_button');
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
    file_information.html(file.name+' Uploaded.')
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
  
  function supported() 
  {
    if (window.File && window.FileReader && window.FileList && window.Blob) return true;
    error('File APIs are not fully supported in this browser.');
    return false;
    //support_for_older_browser();
    //return true;
  }
  
  function support_for_older_browser(){
	  var support={"XHRsendAsBinary":false,"XHRupload":false,"fileReader":false,"formData":false};
      var s_xhr=new XMLHttpRequest();
      support.XHRsendAsBinary=("sendAsBinary" in s_xhr);
      support.XHRupload=("upload" in s_xhr);
      try{ // firefox,chrome
    	support.fileReader = !!new FileReader();
    	support.formData = !!new FormData();
      }catch(e){};
      //end browser support
      var form=$("#uploadForm");
      
      if(!support.XHRupload){
    	  alert('Going to iframe Upload');
      }else{
    	  alert('I am using Xhr Uploading...');
      }
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
    var rate = (file_index- start_file_index) / delta_ms; 
    var remaining_ms = (file.size - file_index) / rate; 
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
    var progress = Math.floor(100 * file_index / file.size);
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
	reader.onabort = onabort;
    reader.onerror = onerror;
    reader.onloadend = onloadend;
    reader.onloadstart = onloadstart;
    
    var stop = start + length - 1;
    if (stop>(blob.size-1)) stop=blob.size-1;
    var corrected_length =  (stop - start) + 1;
    var end = start+corrected_length;
    if (blob.webkitSlice) {
    	var this_blob = blob.webkitSlice(start, end);
    } else if (blob.mozSlice) {
    	var this_blob = blob.mozSlice(start, end);
    }else{
    	var this_blob = blob.Slice(start, end);
    }
    reader.readAsBinaryString(this_blob);
  }
  
  function onloadstart(){
	  file_information.html('Uploading '+file.name+' ...');  
  }
  
  function onloadend(event) 
  { 
	// Deliver block
    if (deliver_slice(event.target.result) == false) {
	    error('Error delivering data to server');
	    return;
	  }
    
    file_index += block_size;
    if(file_index>file.size){
    	file_index = file.size;
    }
    
    calculate_eta();

    update_progress_bar();

    if (file_index>=file.size) {
      // Upload complete
      uploader.upload_complete();
	}
  }

  function begin_upload() 
  {
    file_buttons.hide();
    file_pause_button.show();
    file_cancel_button.show();
    file_progress.html('');
    
    start_time = Date.now();
    start_file_index = file_index;
    if (paused_upload) {
      paused_upload = false;
    } else {
      var result = wsc.send("command=>upload||"+file.name+"||"+file.size+"||"+file_index);   
      if (!result) error('Failed to send data to server');
    }
  
    read_slice(file_index, block_size);
  }

  function file_selected()
  {
    // Get the filename from the input field
    if (file_name_input == undefined) {
      error('No filename input in DOM');
      return false;  
    }
    var files = file_name_input[0].files;
    if (files.length == 0) {
      error('Please select a file!');
      return false;
    }
    file = files[0];
    return file.name;
  }
  
  function handle_file_exists_response(size) 
  {
    file_index = size;
    file_buttons.hide();
    file_browse_button.show();
    file_reupload_button.show();
    if (file_index<file.size) {
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
        file_index = 0;
        var size = parseInt(params.shift());
        if (size>0) handle_file_exists_response(size);
      }
      if (query=='upload') {
        var size = parseInt(params.shift());
        if (!paused_upload && !cancelled_upload && size==file_index && file_index<file.size) {
          read_slice(file_index, block_size);
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
	    if(size != file_index){
	    	file_index = size;
		    //File Size Mismatch
		    if(file_index>file.size){
		    	error('File size mismatch');
		    }else{
		    	read_slice(file_index, block_size);
		    }
	    }else{
		    //File Size Mismatch
		    if(file_index>file.size){
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
	  wsc.send("query=>exist||"+file_selected()+"||"+file.size);
  }

  function connect_websocket()
  {
    if (!file_selected()) return false;

    if (!wsc) {
      var host = "ws://"+hostFromServer;
      wsc = new WebSocketClient(host);   
      if (!wsc.initialize()) {
	      error('Failed to connect to websocket server at '+host);
	      return false;
    	  //support_for_older_browser();
	    }
      wsc.socket.onmessage = receive_message;
      wsc.socket.onopen = query_file;
    } else {
      query_file();
    }
    return true;
  }
  
  this.fileSelected = function(fileName, fileSize, fileData){
      //file.name = fileName;
      //file.size = fileSize;

      //file_information.html(file.name);
      file_progress.html('');
      file_buttons.hide();
      file_browse_button.show();
      file_upload_button.show();
      file_progress_bar.progressbar({value:0});
      //connect_websocket();
      //read_file();
      
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
      file_index = 0;
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
