'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';

var testValue = { msg: "value from 1st IO." };
var test2Value = { msg: "value from 2nd IO." };
var test3Value = { msg: "value from 3rd IO." };

describe('Chained IO function', function () {
  it('should receive filePath and value which previous IO function passed and returned', function (done) {
    
    jf.filed( testFilePath ).io(
      function( obj, filePath) {
        return testValue;
      }
    ).io(
      function( obj, filePath){
          expect( filePath ).to.eql( testFilePath );
          expect( obj ).to.eql( testValue );
          return test2Value;
      }
    ).io(
      function( obj, filePath){
        expect( filePath ).to.eql( testFilePath );
        expect( obj ).to.eql( test2Value );
        return test3Value;
      }
    ).io(
      function( obj, filePath){
        expect( filePath ).to.eql( testFilePath );
        expect( obj ).to.eql( test3Value );
      }
    ).exec();

    setTimeout(
      function(){
        jf.filed( testFilePath ).io( function( obj ) {
          expect( obj ).to.eql(test3Value);
          done();
        }).exec();
      },
      1000);

  });
});
