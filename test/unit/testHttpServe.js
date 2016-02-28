'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    http = require('http');

let testPath = './' + Math.random() + '.json';
let testValue = { msg: "hello world" };


describe('HttpServe function ', function () {
  this.timeout(10000);
  it('should serve JSON from local web server.', function (done) {

    jf
    .filed( testPath )
    .io( ()=> { return testValue } )
    .httpServe( () => '/test.json')
    .exec();

    setTimeout(
      function(){
        done();
      },
      5000);

    jf
    .download( 'http://localhost:8080/test.json', testPath )
    .pass( ( data ) => { expect( data ).to.eql(testValue) } )
    .pass( () => {  done(); } )
    .exec();

  });



});
