'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let testPath1 = './' + Math.random() + '.json';
let testPath2 = './' + Math.random() + '.json';

var testValue = { msg: Math.random().toString() };

let errorObj = { msg: 'intended error' }

describe('Copy from deleted file path', function () {
  it('should be handled as error of the copy executer.', function (done) {

    jf.filed( testPath1 )
    .io(
      function( obj, filePath) {
        return { msg: 'copied from deleted file Path' };
      }
    ).pass(
      function(obj, filePath){
        fs.unlinkSync(filePath);//unlink file.
      }
    ).copy(
      function(obj, filePath, executer){
        return testPath2; // copy from unlinked file.
      },
      function(err){
        console.log( err );
        done();
      }
    ).exec();

  });

});


describe('Copy to same file path', function () {
  it('should be handled as error of the copy executer.', function (done) {

    jf.filed( testPath1 )
    .io(
      function( obj, filePath) {
        return { msg: 'copied to same file Path' };
      }
    ).copy(
      function(obj, filePath, executer){
        return testPath1; // copy to same file path.
      },
      function(err){
        console.log( err );
        done();
      }
    ).exec();

  });

});
