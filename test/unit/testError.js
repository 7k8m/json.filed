'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let testPath = './' + Math.random() + '.json';
var testValue = { msg: Math.random().toString() };

describe('Error ', function () {
  it('should be handled in error listener', function (done) {

    /*
    jf.defaultEmitter.removeAllListeners('error');
    jf.defaultEmitter.on(
      'error',
      function(err){
        console.error(err);
        done();
      }
    );
    */

    jf.filed( testPath )
    .io(
      function( obj, filePath) {
        //throw {msg:"intended error"};
        return testValue;
      },
      function(err){
        //console.error(err);
        done();
      }
    ).filter(
      function(obj, filePath){
        throw {msg:"intended error"};

        return true;
      },
      function(err){
        done();
        console.error(err);
      }
    ).pass(
      function(obj, filePath){
        //throw {msg:"intended error"};
        expect(filePath).to.eql(testPath);
      },
      function(err){
        done();
        console.error(err);
      }
    ).exec();

    setTimeout(
      function(){
        done();
      },
      1000);
  });

});
