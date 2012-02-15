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
var ___img=document.createElement("image");
___img.src="img/uploading.gif";

var frame = $( "<iframe style=\"display:none\" name=\"uploadIframe\" id=\"uploadIframe\"  />" );
var upload_form = $('<form id="uploadForm" method="post" enctype="multipart/form-data" />');
upload_form.append(file_name_input);
fc.append(upload_form);
var file_size_field = $('<input name="MAX_FILE_SIZE" value="maxFileSize" type="hidden" />');
upload_form.append(file_size_field);
$( "body:first" ).append( frame );

var filename, ext;
var allowed_types = typesFromServer;

upload_form.attr('action', 'http://hostFromServer/upload');
upload_form.attr("target","uploadIframe");

reset_upload();
bind_events();

function start_upload(){
	//$("#uploadForm")[0].submit();
	upload_form.submit();
	file_progress_bar.append(___img);
	//window.postMessage("Hi", "http://tareq.com");
}

function start_upload1(){
	var jqxhr = $.ajax({ 
			url: "http://hostFromServer/upload",
			type: "POST",
			data: $("#uploadForm").serialize(),
			beforeSend: function( xhr ) {
				xhr.setRequestHeader('Content-Type', 'multipart/form-data');
				xhr.setRequestHeader('Cache-Control', 'no-cache');
			}
		});
	//console.log($("#uploadForm").serialize());
	
	jqxhr.done(function(){
		//alert('in Done');
	}); 
	jqxhr.fail(function(){
		//alert('in Fail');
	}); 
	jqxhr.always(function(){
		//alert('in Always');
	}); 
	//jqxhr.send();
}

function bind_events(){
    // Start upload button
    file_upload_button.bind('click', {uploader: this}, function (e) {
    file_buttons.hide();
    file_cancel_button.show();
    start_upload();
  });
   
  file_browse_button.bind('click', {uploader: this}, function (e) { 
	  file_name_input.click();
	  return false;
  });
  
  file_name_input.bind('change', {uploader: this}, function(e) {
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
  
   file_cancel_button.bind('click', {uploader: this}, function(e){
	  
	  return false;
   });
}