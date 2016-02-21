'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testPath_1 = './' + Math.random() + '.json';
const testPath_2 = './' + Math.random() + '.json';

var testValue = { msg: Math.random().toString() };

describe('Copy functions ', function () {
  it('should create copied file', function (done) {

    jf.filed( testPath_1 )
    .io(
      function( obj, filePath) {
        return testValue;
      }
    ).copy(
      function(obj, filePath){
        return testPath_2;
      }
    ).exec();

    setTimeout(
      function(){
        jf.filed( testPath_2 )
        .io( function( o ) {
          expect( o ).to.eql( testValue );
          done();
        }).exec();
      },
      1000);
  });

});

const testPath_3 = './' + Math.random() + '.json';
const testPath_4 = './' + Math.random() + '.json';

describe('Copy functions ', function () {
  it('should create multiple copied file', function (done) {

    jf.filed( testPath_1 )
    .copy(
      function(obj, filePath){
        return [ testPath_3, testPath_4 ];
      }
    ).exec();

    setTimeout(
      function(){
        jf.filed( testPath_3 )
        .pass( function( o ) {
          expect( o ).to.eql( testValue );

          jf.filed( testPath_4 )
          .pass( function( o ) {
            expect( o ).to.eql( testValue );
            done();
            
          }).exec();

        }).exec();
      },
      1000);
  });

});
