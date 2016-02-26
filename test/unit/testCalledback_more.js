'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let testPath = './' + Math.random() + '.json';
var testValue = { msg: Math.random().toString() };

var new_testValue = { msg: Math.random().toString() };

describe('Nested json.filed process ', function () {
  it('works without error', function (done) {

    jf.filed( testPath )
    .io(
      function( obj, filePath) {
        return testValue;
      }
    ).calledback(
      function(obj, filePath, callback){

        //nested json.filed process here.
        jf.filed( filePath )
        .io(function(obj, filePath){
          return new_testValue;
        })
        .pass(
          function(obj, filePath){
            callback( obj );
          }
        ).exec();

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
    100);


});
