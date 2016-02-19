'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

describe('bFiled( obj ).io', function () {
    it('should be a function', function () {
        expect(jf.filed("file").io).to.be.a('function');
    });
});

const testFilePath = './' + Math.random() + '.bson';
describe('The initialValue', function () {
  it('should be equal to defined in json.filed.', function (done) {
    jf.filed( testFilePath ).io( function( obj ) {
        expect(obj).to.eql(jf.initialValue());
        done();
    });
  });
});


const testFile2Path = './' + Math.random() + '.bson';
var updatedValue = { msg: 'updated' };
describe('The updated value', function () {
  it('should be read again as updated.', function (done) {
    jf.filed( testFile2Path ).io( function( obj ) {
      return updatedValue;
    });

    setTimeout(
      function(){
        jf.filed( testFile2Path ).io( function( obj ) {
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
    jf.filed( testFile3Path).io( function( obj ) {
      return initialValue;
    });

    setTimeout(
      function(){
        jf.filed( testFile3Path).io( function( obj ) {
          expect(obj).to.eql(initialValue);
          obj.msg = "this value is not written."
          //return obj
        });
      },
      1000
    );

    setTimeout(
      function(){
        jf.filed( testFile3Path).io( function( obj ) {
          expect(obj).to.eql(initialValue);
          done();
        });
      },
      1000
    );

  });
});


const testFile4Path = './' + Math.random() + '.bson';
describe('Function return null', function () {
  it('does not make json to be written.', function (done) {
    jf.filed( testFile4Path).io( function( obj ) {
      return initialValue;
    });

    setTimeout(
      function(){
        jf.filed( testFile4Path).io( function( obj ) {
          expect(obj).to.eql(initialValue);
          obj.msg = "this value is not written also."
          return null
        });
      },
      1000
    );

    setTimeout(
      function(){
        jf.filed( testFile4Path).io( function( obj ) {
          expect(obj).to.eql(initialValue);
          done();
        });
      },
      1000
    );

  });
});

const testFile8Path = './' + Math.random() + '.BSON';

describe('Upper case file extension ', function () {
  it('should not affect result.', function (done) {
    jf.filed( testFile8Path ).io(
        function( obj, filePath ) {
          return { path: testFile8Path };
        }
      );

    setTimeout(
      function(){
        jf.filed( testFile8Path ).io( function( obj, filePath ) {
          expect( obj.path ).to.eql( testFile8Path );
          done();
        });
      },
      1000);
    })

});
