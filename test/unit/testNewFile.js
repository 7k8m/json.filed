'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
describe('The initialValue', function () {
  it('should be equal to defined in json.filed.', function (done) {
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
