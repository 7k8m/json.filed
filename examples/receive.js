'use strict';
var jf = require('json.filed');
var http = require('http');

var server = http.createServer();

let receive =
  jf.event( function( receiveListener, stopListener) {
    server.on(
      'request',
      function ( request, response) {
        receiveListener( { url : request.url } );
        response.writeHead(200);
        response.end();
      } );
    server.listen(8888);
  },
  () => './received.json' )
  .exec();
