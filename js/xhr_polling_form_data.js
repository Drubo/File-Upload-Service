function xhr_upload(){
	var formData = new FormData();
	try{
		var xhr = new XMLHttpRequest();
	}catch(e){
		try{
			var xhr = new ActiveXObject("Microsoft.XMLHttp"); //IE6 or Older
		}catch(e){
			
		}
	}
	
	source.addEventListener('progress', function(e){console.log(e);}, false);
	
	var onProgress = function(e) {
	  console.log(e);
	  //if (e.lengthComputable) {
	    //var percentComplete = (e.loaded/e.total)*100;
	    //alert(percentComplete);
	  //}else{
		  //console.log('Unable to Compute Progress');
	  //}
	};

	var onError = function(e) {
	  // something went wrong with upload
	  //console.log(e);
	  //console.log('Error');
	};
	
	var onLoad = function(e){
		//console.log(e);
	};
	
	var onReady = function(e){
		//console.log(e);
	};
	
	formData.append('file_name_input', file_name_input[0].files[0]);
	xhr.addEventListener('error', onError, false);
	//xhr.addEventListener('progress', onProgress, false);
	xhr.addEventListener('load', onLoad, false);
	xhr.addEventListener('readystatechange', onReady, false);
	xhr.open('post', 'http://hostFromServer/upload', true);
	xhr.send(formData);
}

function xhr_cancel(){
	xhr.cancel(formData);
}

var fc = $('.file_uploader');
var file_progress_bar = fc.find('.file_progress_bar');
var upload_form = fc.find('#uploadForm');
var file_progress = fc.find('.file_progress');
var file_information = fc.find('.file_information');
var file_upload_button = fc.find('.file_upload_button');
var file_browse_button = fc.find('#browse_button_div');
var file_browse_button = fc.find('.file_browse_button');
var file_pause_button = fc.find('.file_pause_button');
var file_cancel_button = fc.find('.file_cancel_button');
var file_resume_button = fc.find('.file_resume_button');
var file_reupload_button = fc.find('.file_reupload_button');
var file_name_input = fc.find('.file_name_input');
var file_buttons = fc.find(':button');

//alert(file_name_input[0].files);

reset_upload();
bind_events();

function reset_upload(){
  file_buttons.hide();
  file_browse_button.show();
  file_browse_button.show();
  cancelled_upload = false;
  paused_upload = false;
  file_information.html('');
  file_progress.html('');
  file_progress_bar.progressbar({value:0});
}

function bind_events(){
  // Start upload button
   file_upload_button.bind('click', {uploader: this}, function (e) {
    file_buttons.hide();
    file_cancel_button.show();
    xhr_upload();
    return false; 
  });
   
  file_browse_button.bind('click', {uploader: this}, function (e) { 
	  file_name_input.click();
	  return false;
  });
  
  file_name_input.bind('change', {uploader: this}, function(e) {
      file_information.html(file_name_input[0].files[0].name);
      file_progress.html('');
      file_buttons.hide();
      file_browse_button.show();
      file_upload_button.show();
      file_progress_bar.progressbar({value:0});
    });
  
   file_cancel_button.bind('click', {uploader: this}, function(e){
	  xhr_cancel();
	  return false;
   });
}