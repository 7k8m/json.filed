'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
var testValue = { msg: "value from previous IO." };
describe('Pass function', function () {
  it('should receive filePath and value which previous IO function passed and returned', function (done) {
    jf.filed( testFilePath ).io(
      function( obj, filePath) {
        return testValue;
      }
    ).pass(
      function(obj, filePath){
          expect( filePath ).to.eql( testFilePath );
          expect( obj ).to.eql( testValue );
          done();
      }
    ).exec();
  });
});

const testFilePath2 = './' + Math.random() + '.json';
var testValue2 = { msg: "value from previous Link." };

const testFilePath2_1 = './' + Math.random() + '.json';
const testFilePath2_2 = './' + Math.random() + '.json';

describe('Pass IO function', function () {
  it('should receive filePath which previous link function returned', function (done) {

    jf.filed( testFilePath2 ).io(
      function( obj, filePath) {
        return testValue2;
      }
    ).exec();

    setTimeout(
      function(){

        const fileMap = new Map([[testFilePath2_1,true],[testFilePath2_2,true]]);

        jf.filed( testFilePath2 ).link(
          function( obj, filePath) {
            return [testFilePath2_1, testFilePath2_2];
          }
        ).pass(
          function(obj, filePath){
              expect( obj ).to.eql( testValue2 );
              fileMap.delete(filePath);
              if(fileMap.size == 0){
                done();
              }
          }
        ).exec();
    },1000);
  });
});

const testFilePath3 = './' + Math.random() + '.json';
var testValue3 = { msg: "value from previous pass." };
describe('Pass function', function () {
  it('should receive filePath from previous pass received.', function (done) {
    jf.filed( testFilePath3 ).io(
      function( obj, filePath) {
        return testValue3;
      }
    ).pass(
      function(obj, filePath){
          expect( filePath ).to.eql( testFilePath3 );
          expect( obj ).to.eql( testValue3 );
      }
    ).pass(
      function(obj, filePath){
          expect( filePath ).to.eql( testFilePath3 );
          expect( obj ).to.eql( testValue3 );
          done();
      }
    ).exec();
  });
});
