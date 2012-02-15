$(document).ready(function() {
	var container = $('.file_uploader');
	var file_progress_bar = container.find(".file_progress_bar");
	var file_progress = container.find('.file_progress');
	var file_information = container.find('.file_information');
	var file_upload_button = container.find('.file_upload_button');
	var file_browse_button = container.find('.file_browse_button');
	var file_pause_button = container.find('.file_pause_button');
	var file_cancel_button = container.find('.file_cancel_button');
	var file_resume_button = container.find('.file_resume_button');
	var file_reupload_button = container.find('.file_reupload_button');
	var file_name_input = container.find('.file_name_input');
	var file_buttons = container.find(':button');
		  
	file_buttons.hide();
	file_browse_button.show();
	cancelled_upload = false;
	paused_upload = false;
	file_information.html('');
	file_progress.html('');
	file_progress_bar.progressbar({value:0});
});

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

	//Check for valid file type
	var ary = allowed_types.split('|');
	var test = ext in oc(ary);
	if (!test) {
		reset_upload();
		file_information.html("You are not allowed to upload this type of file.");
		return;
	}
	
	if(file_name_input[0].files && file_name_input[0].files[0] && file_name_input[0].files[0].fileSize){
		if(file_name_input[0].files[0].fileSize > maxFileSize){
			reset_upload();
			file_information.html("This file is too large to upload...");
			return;
		}
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