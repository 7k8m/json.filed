'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
var testValue = { msg: "value from previous IO." };
describe('Chained IO function', function () {
  it('should receive filePath and value which previous IO function passed and returned', function (done) {
    jf.filed( testFilePath ).io(
      function( obj, filePath) {
        return testValue;
      }
    ).io(
      function(obj, filePath){
          expect( filePath ).to.eql( testFilePath );
          expect( obj ).to.eql( testValue );
          done();
      }
    ).exec();
  });
});


const testFile2Path = './' + Math.random() + '.json';
var test2_1Value = { msg: "value from 1st IO." };
var test2_2Value = { msg: "value from 2nd IO." };
describe('Value last chained IO function returned', function () {
  it('should be read in next IO function', function (done) {
    jf.filed( testFile2Path ).io(
      function( obj, filePath) {
        return test2_1Value;
      }
    ).io(
      function( obj, filePath){
        return test2_2Value;
      }
    ).exec();

    setTimeout(
      function(){
        jf.filed( testFile2Path ).io( function( obj ) {
          expect(obj).to.eql(test2_2Value);
          done();
        }).exec();
      },
      100);

  });
});


const testFile3Path = './' + Math.random() + '.json';

var test3Value = { msg: "value from previous IO." };

describe('Chained link function', function () {
  it('should receive previous returned value of IO', function (done) {
    jf.filed( testFile3Path ).io(
      function( obj, filePath) {
        return test3Value;
      }
    ).link(
      function(obj, filePath){
          expect( filePath ).to.eql( testFile3Path );
          expect( obj ).to.eql( test3Value );
          done();
      }
    ).exec();
  });
});

const testFile4Path = './' + Math.random() + '.json';

const testFile4_1Path = './' + Math.random() + '.json';
const testFile4_2Path = './' + Math.random() + '.json';

var test4Value = { msg: "test value of 4." };

describe('Chained link function', function () {
  it('should be read in other IO process', function (done) {
    jf.filed( testFile4Path ).io(
      function( obj, filePath) {
        return test4Value;
      }
    ).link(
      function(obj, filePath){
        return [testFile4_1Path, testFile4_2Path];
      }
    ).exec();

    var count = 0;
    setTimeout(
      function(){
        jf.filed( [ testFile4Path, testFile4_1Path, testFile4_2Path] ).io( function( obj ) {
          expect(obj).to.eql(test4Value);
          count ++;
          if ( count == 3 ) done();
        }).exec();
      },
      100);

  });
});


const testFile5_1Path = './' + Math.random() + '.json';
const testFile5_2Path = './' + Math.random() + '.json';
var test5Value = { msg: "test 5 value" };
describe('Value received by link proces in 1st', function () {
  it('should be read in next IO function', function (done) {
    jf.filed( testFile5_1Path ).io(
      function( obj, filePath) {
        return test5Value;
      }
    ).exec();

    setTimeout(
      function(){
        jf.filed( testFile5_1Path ).link( function( obj, filePath) {
          return testFile5_2Path;

        }).io(function(obj, filePath){
          expect(filePath).to.eql(testFile5_2Path);
          expect(obj).to.eql(test5Value);
          done();
        }).exec();

      },
      100);

  });
});

const testFile6Path = './' + Math.random() + '.json';
var test6Value = { msg: "test 6 value" };
describe('Link process which does not link any', function () {
  it('should not cause chained process', function (done) {
    jf.filed( testFile6Path ).io(
      function( obj, filePath) {
        return test6Value;
      }
    ).exec();

    var count = 0;
    setTimeout(
      function(){
        jf.filed( testFile6Path ).link( function( obj, filePath) {

          expect(filePath).to.eql(testFile6Path);
          expect(obj).to.eql(test6Value);

          return null;

        }).io(function(obj, filePath){
          count ++; //If test goes ringht, not executed.
        }).exec();

      },
      100);

    setTimeout(
      function(){
        expect(count).to.equal( 0 );
        done();
      },
      100);

  });
});
