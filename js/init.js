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