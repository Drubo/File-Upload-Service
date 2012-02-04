**Information about the Service**
***

This service uses **Node JS** for the server. There are two servers integrated with this service. **File Upload** server and **Static File** server. Static File requested from the browser will be served by this server and this server can handle File Upload also.

This server will handle the following types of Upload:

1.  WebSocket
2.  Flash based WebSocket & FileAPI support for those browsers that do not provide support for WebSocket but provide Support for Flash 10.0 or higher.
3.  Xhr long Polling
4.  iFrame Support.

Currently only the first two types are supported. We are working on the support the other two types.