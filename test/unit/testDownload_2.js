'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    http = require('http');

var count = 0;
function testValue(){
  count ++;
  return { num: count }
}

http.createServer(
  (request, response) => {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end( JSON.stringify( testValue() ) );
}).listen(8080);

describe('Download function ', function () {
  this.timeout(10000);
  it('should download JSON from web server for each exec()', function (done) {

    let downloadedJson =
      jf.download(
        'http://localhost:8080',
        function * (){ yield './' + Math.random() + '.json'; } );

    downloadedJson
    .io( ( json ) => { expect( json.num ).to.equal( 1 ) }).exec();

    setTimeout(
      function(){
      },
      100);

    downloadedJson
    .io( ( json ) => { expect( json.num ).to.equal( 2 ) })
    .pass( () => { done(); } )
    .exec();

  });



});
