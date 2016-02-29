'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    http = require('http');

let testPath = './' + Math.random() + '.json';
let testValue = { msg: "hello world" };

let server = http.createServer( (request, response) => {
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end( JSON.stringify( testValue ) );
}).listen(8080);

describe('Download function ', function () {
  this.timeout(10000);
  it('should download JSON from web server.', function (done) {

    jf.download( 'http://localhost:8080', testPath )
    .pass(
      function( obj, filePath ){
        expect( obj ).to.eql( testValue );
        done();
        server.close();
      }
    ).exec();

  });

  setTimeout(
    function(){
    },
    100);

});
