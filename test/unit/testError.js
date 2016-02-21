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
        throw {msg:"intended error"};
        return testValue;
      },
      function(err){
        console.error(err);
        done();
      }
    ).filter(
      function(obj, filePath){
        if (filePath == pathToFind)
          return true;
        else if(filePath == pathToNotFind)
          return false;
      },
      function(err){
        console.error(err);
      }
    ).pass(
      function(obj, filePath){
        expect(filePath).to.eql(pathToFind);
      },
      function(err){
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
