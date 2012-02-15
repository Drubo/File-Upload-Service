var formData;
var xhr;
var start_time;
var start_file_index;

var fc = $('.file_uploader');
var file_progress_bar = fc.find('.file_progress_bar');
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
var upload_form = $('<form id="uploadForm" method="post" enctype="multipart/form-data">');
upload_form.append(file_name_input);
fc.append(upload_form);

var allowed_types = typesFromServer;
var filename, ext;

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
			upload_form.remove('.file_name_input');
			fc.remove('#uploadForm');
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
		xhr = null;
		formData = null;
		upload_form.remove('.file_name_input');
		fc.remove('#uploadForm');
		reset_upload();
	}catch(e){
		
	}
}

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
	  filename = file_name_input.val().toLowerCase().split(/[\\\/]/).pop();
	  ext = filename.split(".").pop();
      file_information.html(filename);
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