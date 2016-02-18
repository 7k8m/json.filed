'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

describe('filed( obj )', function () {
    it('should be a function', function () {
        expect(jf.filed).to.be.a('function');
    });
});

const testFilePath = './' + Math.random() + '.json';
describe('The initialValue', function () {
  it('should be equal to defined in json.filed.', function (done) {
    jf.filed( testFilePath, function( obj ) {
        expect(obj).to.eql(jf.initialValue());
        done();
    });
  });
});


const testFile2Path = './' + Math.random() + '.json';
var updatedValue = { msg: 'updated' };
describe('The updated value', function () {
  it('should be read again as updated.', function (done) {
    jf.filed( testFile2Path, function( obj ) {
      return updatedValue;
    });

    setTimeout(
      function(){
        jf.filed( testFile2Path, function( obj ) {
          expect(obj).to.eql(updatedValue);
          done();
        });
      },
      1000);
    })

});

const testFile3Path = './' + Math.random() + '.json';
var initialValue = { msg: 'initial' };
describe('The value function does not return ', function () {
  it('should not be written.', function (done) {
    jf.filed( testFile3Path, function( obj ) {
      return initialValue;
    });

    setTimeout(
      function(){
        jf.filed( testFile3Path, function( obj ) {
          expect(obj).to.eql(initialValue);
          obj.msg = "this value is not written."
          //return obj
        });
      },
      1000
    );

    setTimeout(
      function(){
        jf.filed( testFile3Path, function( obj ) {
          expect(obj).to.eql(initialValue);
          done();
        });
      },
      1000
    );
    
  });
});

describe('Null file Path', function () {
  it('should cause JsonFiledError', function (done) {
    try{
      jf.filed( null, function( obj ) {
      });
    }catch(e){
      expect(e).to.be.an.instanceof( jf.JsonFiledError );
      done();
    }
  });
});
