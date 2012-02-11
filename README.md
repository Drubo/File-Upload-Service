**Information about the Service**
***

This service uses **Node JS** for the server. There are two servers integrated with this service. **File Upload** server and **Static File** server. Static File requested from the browser is served by this server and this server can handle File Upload also.

This server will handle the following types of Upload:

1.  WebSocket
2.  Flash based WebSocket & FileAPI support for those browsers that do not provide support for WebSocket but provide Support for Flash 10.0 or higher.
3.  Xhr long Polling
4.  iFrame Support.


**Currently we can support the followings:**

1.  WebSocket
2.  Flash based WebSocket (Require Flash Player 10.0+)
3.  Xhr long Polling with progress bar


**Currently Supported Browsers:**

1.  Chrome 3 - 16

2.  FireFox 3.5, FireFox 4.0 - support for WebSockets disabled. To enable it [see here](http://techdows.com/2010/12/turn-on-websockets-in-firefox-4.html), FireFox 6.0 - prefixed `MozWebSocket`, FireFox 7.0 + 8.0 + 9.0 + 10.0 - prefixed: `MozWebSocket`, FireFox 11

3.  Safari 1.2+, 4, 5.0.0, 5.0.2, 5.1

4.  Opera 7.6+, Opera 11 - with support disabled. To enable it [see here](http://techdows.com/2010/12/enable-websockets-in-opera-11.html) (For WebSocket).

5.  IE 5, IE 5.5, IE 6, IE 7.x - IE 9.x, IE 10 - via Silverlight extension, IE 10 (from Windows 8 developer preview)

6.  Netscape 7+


**Current Work Flow:**

Checks if browser support `FileAPI`
	Checks if browser support `WebSocket`
		fallback to `Socket Based Upload`
	else
		Checks if browser support `Flash 10+`
			fallback to `Flash Based Upload`
		else
			Checks if browser support `Xhr Polling`
				fallback to `XHR Based Upload`
			else
				fallback to `iFrame Based Upload`
else
	fallback to `iFrame Based Upload`
