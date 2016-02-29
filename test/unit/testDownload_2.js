'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    http = require('http');

var count = 0;
function testValue(){
  count ++;
  return { num: count }
}

let server = http.createServer(
  (request, response) => {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end( JSON.stringify( testValue() ) );
}).listen(8081);

describe('Download function ', function () {
  this.timeout(10000);
  it('should download JSON from web server for each exec()', function (done) {

    let downloadedJson =
      jf.download(
        'http://localhost:8081',
        function * (){ yield './' + Math.random() + '.json'; } );

    downloadedJson
    .io( ( json ) => { expect( json.num ).to.equal( 1 ) })
    .pass( () => {
      downloadedJson
      .io( ( json ) => { expect( json.num ).to.equal( 2 ) })
      .pass( () => {
        done();
        server.close();
      } )
      .exec();
    })
    .exec();

    setTimeout(
      function(){
      },
      100);

  });



});
