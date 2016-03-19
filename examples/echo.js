'use strict';
var jf = require('json.filed');
var http = require('http');

var server = http.createServer();
server.on(
  'request',
  function ( request, response ) {
    let receive =
      jf
      .event( function( receiveListener, stopListener) {
        receiveListener( { url : request.url } );
        },
        () => './received.json' )
      .pass( ( obj ) => {
        response.writeHead(200,{ 'Content-Type': 'text/json' });
        response.end( JSON.stringify(obj) );
      } )
      .exec();
    }
);

server.listen(8888);
