'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs'),
    path = require('path');

let testPath = './' + Math.random() + '.json';
let testPath2 = './' + Math.random() + '.json';
let testPath3 = './' + Math.random() + '.json';
var testValue = { msg: Math.random().toString() };
var new_testValue = { msg: Math.random().toString() };

describe('called back function ', function () {
  it('can be called multiple times with new file path', function (done) {

    var count = 0;
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
            callback( new_testValue, testPath );
            callback( new_testValue, testPath2 );
            callback( new_testValue, testPath3 );
          },
          10);
      }
    ).pass(
      function(obj, filePath){
        expect( path.resolve( testPath ) ==  filePath ||
                path.resolve( testPath2 ) == filePath ||
                path.resolve( testPath3 ) == filePath ).to.eql(true);
        expect(obj).to.eql(new_testValue);

        count ++;
        if( count == 3 ) done();

      }
    ).exec();

  });

  setTimeout(
    function(){
    },
    20);

});
