var formData;
var xhr;
var start_time;
var start_file_index;

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

var allowed_types = typesFromServer;

reset_upload();
bind_events();

function xhr_upload(){
	start_time = Date.now();
	start_file_index = 0;
	
	formData = new FormData();
	try{
		xhr = new XMLHttpRequest();
	}catch(e){
		try{
			xhr = new ActiveXObject("Msxml2.XMLHTTP.6.0"); //IE6 or Older
		}catch(e){
			try{
				xhr =new ActiveXObject("Msxml2.XMLHTTP.3.0");
			}catch(e){
				try{
					xhr = new ActiveXObject("Microsoft.XMLHttp");
				}catch(e){
					
				}
			}
		}
	}

	var onProgress = function(e){
		var progress = Math.floor(100 * e.loaded / e.total);
		calculate_eta(e.loaded, e.total);
	    file_progress_bar.progressbar({value: progress});
	};
	
	var onError = function(e) {
		file_information.html(e.target.responseText);
	};
	
	var onLoad = function(e){
		if(e.target.responseText=='Upload Complete'){
			reset_upload();
			file_information.html(e.target.responseText);
			file_progress_bar.progressbar({value: 100});
			xhr = null;
			formData = null;
		}
	};
	
	var onLoadStart = function(e){
		file_information.html('Uploading '+file_name_input[0].files[0].name+"...");
	};
	
	formData.append('file_name_input', file_name_input[0].files[0]);
	xhr.addEventListener('error', onError, false);
	xhr.addEventListener('load', onLoad, false);
	xhr.upload.addEventListener('progress', onProgress, false);
	xhr.addEventListener('loadstart', onLoadStart, false);
	xhr.open('post', 'http://hostFromServer/upload', true);
	xhr.send(formData);
}

function xhr_cancel(){
	try{
		xhr.abort();
		reset_upload();
	}catch(e){
		
	}
}

function calculate_eta(file_index, file_size){
  var delta_ms = Date.now() - start_time;
  var rate = (file_index- start_file_index) / delta_ms; 
  var remaining_ms = (file_size - file_index) / rate; 
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

function validate(){
	if(allowedTypes!='undefined'){
		allowed_types = allowedTypes;
	}

	var parts = file_name_input[0].files[0].name.split('.');
	var ext = parts[parts.length-1];
	  
	//Check for valid file type
	var ary = allowed_types.split('|');
	var test = ext in oc(ary);
	if (!test) {
		reset_upload();
		file_information.html("You are not allowed to upload this type of file.");
		return;
	}
	
	if(file_name_input[0].files[0].size > maxFileSize){
		reset_upload();
		file_information.html("This file is too large to upload...");
		return;
	}
}

function oc(a){
  var o = {};
  for(var i=0;i<a.length;i++)
  {
    o[a[i]]='';
  }
  return o;
};

function bind_events(){
   // Start upload button
   file_upload_button.bind('click', function (e) {
    file_buttons.hide();
    file_cancel_button.show();
    xhr_upload();
    return false; 
  });
   
  file_browse_button.bind('click', function (e) { 
	  file_name_input.click();
	  return false;
  });
  
  file_name_input.bind('change', function(e) {
      file_information.html(file_name_input[0].files[0].name);
      file_progress.html('');
      file_buttons.hide();
      file_browse_button.show();
      file_upload_button.show();
      file_progress_bar.progressbar({value:0});
      validate();
    });
  
   file_cancel_button.bind('click', function(e){
	  xhr_cancel();
	  return false;
   });
}