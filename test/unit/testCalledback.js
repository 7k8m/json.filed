'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let testPath = './' + Math.random() + '.json';
var testValue = { msg: Math.random().toString() };
var new_testValue = { msg: Math.random().toString() };

describe('called back function ', function () {
  it('should hand JSON passed in callback function to next executer', function (done) {

    jf.filed( testPath )
    .io(
      function( obj, filePath) {
        return testValue;
      }
    ).calledback(
      function(obj, filePath, callback){
        setTimeout(
          function(){
            console.log("called back user process")
            callback(new_testValue);
          },
          10);
      }
    ).pass(
      function(obj, filePath){
        expect(obj).to.eql(new_testValue);
        done();
      }
    ).exec();

  });

  setTimeout(
    function(){
    },
    20);

});

let testPath_2 = './' + Math.random() + '.json';
var testValue_2 = { msg: Math.random().toString() };

describe('called back function ', function () {
  it('should not suspend program nor continue chained process if callback function is not called.', function (done) {

    jf.filed( testPath_2 )
    .io(
      function( obj, filePath) {
        return testValue_2;
      }
    ).calledback(
      function(obj, filePath){

      }
    ).pass(
      function(obj, filePath){
        throw new Error("Should not reach here.");
      }
    ).exec();

    setTimeout(
      function(){
        setTimeout(
          function(){
            done();
          },
          100);
      },
      100);



  });


});
