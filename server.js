#!/usr/bin/env node

var server = require('node-upload'),
	lst = require('long-stack-traces');

var host = '192.168.1.100';
//var port = 123456;
var options = {
		  maxFileSize: 20990000
		, origins: 'tareq.com||bd-server.com'
	};

server.listen(host, options);