'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

describe('bFiled( obj )', function () {
    it('should be a function', function () {
        expect(jf.bFiled).to.be.a('function');
    });
});

const testFilePath = './' + Math.random() + '.bson';
describe('The initialValue', function () {
  it('should be equal to defined in json.filed.', function (done) {
    jf.bFiled( testFilePath, function( obj ) {
        expect(obj).to.eql(jf.initialValue());
        done();
    });
  });
});


const testFile2Path = './' + Math.random() + '.bson';
var updatedValue = { msg: 'updated' };
describe('The updated value', function () {
  it('should be read again as updated.', function (done) {
    jf.bFiled( testFile2Path, function( obj ) {
      return updatedValue;
    });

    setTimeout(
      function(){
        jf.bFiled( testFile2Path, function( obj ) {
          expect(obj).to.eql(updatedValue);
          done();
        });
      },
      1000);
    })

});

const testFile3Path = './' + Math.random() + '.bson';
var initialValue = { msg: 'initial' };
describe('The value function does not return ', function () {
  it('should not be written.', function (done) {
    jf.bFiled( testFile3Path, function( obj ) {
      return initialValue;
    });

    setTimeout(
      function(){
        jf.bFiled( testFile3Path, function( obj ) {
          expect(obj).to.eql(initialValue);
          obj.msg = "this value is not written."
          //return obj
        });
      },
      1000
    );

    setTimeout(
      function(){
        jf.bFiled( testFile3Path, function( obj ) {
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
      jf.bFiled( null, function( obj ) {
      });
    }catch(e){
      expect(e).to.be.an.instanceof( jf.JsonFiledError );
      done();
    }
  });
});
