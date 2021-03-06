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
      100);
  });

});

const testPath_3 = './' + Math.random() + '.json';
const testPath_4 = './' + Math.random() + '.json';

describe('Copy functions ', function () {
  it('should create multiple copied file', function (done) {

    var copySuccessCount = 0;
    jf.filed( testPath_1 )
    .copy(
      function(obj, filePath){
        return [ testPath_3, testPath_4 ];
      }
    ).pass(
      function(o,filePath){
          expect( o ).to.eql( testValue );
          copySuccessCount ++;

          if(copySuccessCount == 2) done();

        }
    ).exec();
  });
});
