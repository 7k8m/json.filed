'use strict';
var jf = require('json.filed');
var http = require('http');

let receiver =
  jf.event( () => {}, () => './received.json' )
  .exec();

var server = http.createServer();
server.on(
  'request',
  function ( request, response) {
    receiver.receive( { url : request.url } );

    response.writeHead(200);
    response.end();
  } );
server.listen(8888);
