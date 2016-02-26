'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let testPath = './' + Math.random() + '.json';
var testValue = { msg: Math.random().toString() };
var testValue2 = { msg: Math.random().toString() };

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
            callback(testValue2);
          },
          10);
      }
    ).pass(
      function(obj, filePath){
        expect(obj).to.eql(testValue2);
        done();
      }
    ).exec();

  });

  setTimeout(
    function(){
      callback(testValue2);
    },
    100);

});
