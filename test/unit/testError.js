'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let testPath = './' + Math.random() + '.json';
var testValue = { msg: Math.random().toString() };

let errorObj = { msg: 'intended error' }

describe('Error ', function () {
  it('should be handled in error listener', function (done) {

    jf.defaultEmitter.removeAllListeners('error');
    jf.defaultEmitter.on(
      'error',
      function(err){
        expect(err.innerError).to.eql(errorObj);
      }
    );

    jf.filed( testPath )
    .io(
      function( obj, filePath) {
        throw errorObj;//handled by listener of executer
      },
      function(err){
        expect(err.innerError).to.eql(errorObj);
      }
    ).filter(
      function(obj, filePath){
        throw errorObj; //handled by defaultEmitter
      }
    ).pass(
      function(obj, filePath, executer){
        executer.emit( 'error', errorObj ); //user can explicitly make executer to emit error 
      },
      function(err){
        expect( err ).to.eql(errorObj);
        done();
      }
    ).exec();

  });

});
