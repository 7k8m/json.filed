'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    http = require('http');

let testPath = './' + Math.random() + '.json';
let testValue = { msg: "hello world" };


describe('HttpServe function ', function () {
  this.timeout(10000);
  it('should serve JSON from local web server.', function (done) {

    let httpServer = jf.httpServer();
    httpServer.listen( 8084 );


    jf
    .filed( testPath )
    .io( ()=> { return testValue } )
    .httpServe( () => '/test.json')
    .httpServe( () => '/test2.json')
    .exec();


    jf
    .download( 'http://localhost:8084/test.json', './' + Math.random() + '.json' )
    .pass( ( data ) => { expect( data ).to.eql(testValue) } )
    .pass( () => {

      jf
      .download( 'http://localhost:8084/test2.json', './' + Math.random() + '.json' )
      .pass( ( data ) => { expect( data ).to.eql(testValue) } )
      .pass( () => {
        done();
        httpServer.close();
      } )
      .exec();

    } )
    .exec();
  
  });



});
