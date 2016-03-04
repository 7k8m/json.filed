'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
describe('newFile executer', function () {
  it('should create new file and if already exists, raise error.', function (done) {
    jf
    .newFile( testFilePath )
    .io(
      function( obj ) {
        expect(obj).to.eql(jf.initialValue());
      }
    )
    .pass( () => {
      jf
      .newFile(
        testFilePath,
        function( err ){
          expect( err ).to.be.an.instanceof( jf.JsonFiledError );
          done();
        }
      )
      .exec();
    })
    .exec();
  });
});
