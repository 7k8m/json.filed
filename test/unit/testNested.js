'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testPath_1 = './' + Math.random() + '.json';
const testPath_2 = './' + Math.random() + '.json';

var testValue_1 = { msg: Math.random().toString() };
var testValue_2 = { msg: Math.random().toString() };

describe('Nested IO functions ', function () {
  it('should run', function (done) {

    jf.filed( testPath_1 ).io(
      function( obj, filePath) {
        return testValue_1;
      }
    ).io(
      function( obj, filePath){
          expect( filePath ).to.eql( testPath_1 );
          expect( obj ).to.eql( testValue_1 );

          jf.filed( testPath_2 ).io(
            function(){
              return obj;
            }
          ).exec();

          return testValue_2;

      }
    ).exec();

    setTimeout(
      function(){
        jf.filed( testPath_1 ).io( function( o1 ) {
          expect( o1 ).to.eql( testValue_2 );

          jf.filed( testPath_2 ).io( function ( o2 ){
            expect( o2 ).to.eql( testValue_1 );
            done();
          }).exec();

        }).exec();
      },
      100);

  });
});
