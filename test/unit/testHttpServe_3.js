'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    http = require('http');

let testPath = './' + Math.random() + '.json';
let testValue = { msg: "hello world" };


describe('HttpServe function ', function () {
  this.timeout(10000);
  it('should responds 405 error other than GET', function (done) {

    let httpServer = jf.httpServer();
    httpServer.listen( 8083 );

    jf
    .filed( testPath )
    .io( ()=> { return testValue } )
    .httpServe( () => '/test.json')
    .pass(() =>{
      const req =
        http.request(
          { host: 'localhost',
            port: 8083,
            path: '/test.json',
            method: 'POST'
          },
          (res) => {
            expect( res.statusCode ).to.eql( 405 ); //405 Method Not Allowed
            done();
          }
        );
      req.end();
    })
    .exec();

  });



});
