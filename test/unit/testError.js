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

    jf.filed(null,
      function(err){
        expect(err.msg).to.eql('File must not be null.');
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


let testPath2 = './' + Math.random() + '.json';
describe('Error of link executer', function () {
  it('should be handled in error listener', function (done) {

    jf.filed( testPath2 )
    .io(
      function( obj, filePath) {
        return { msg: 'Test value.' };
      }
    ).link(
      function(obj, filePath, executer){
        executer.emit('error', errorObj );
      },
      function( err ){
        expect( err ).to.eql( errorObj );
        done();
      }
    ).exec();

  });

});

let testPath3 = './' + Math.random() + '.json';

describe('Error of copy executer', function () {
  it('should be handled in error listener', function (done) {

    jf.filed( testPath3 )
    .io(
      function( obj, filePath) {
        return { msg: 'Test value.' };
      }
    ).copy(
      function(obj, filePath, executer){
        executer.emit('error', errorObj );
      },
      function( err ){
        expect( err ).to.eql( errorObj );
        done();
      }
    ).exec();

  });

});
