'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

describe('bFiled( obj ).io(function(){}).exec', function () {
    it('should be a function', function () {
        expect(jf.filed("file").io(function(){}).exec).to.be.a('function');
    });
});

const testFilePath = './' + Math.random() + '.bson';
describe('The initialValue', function () {
  it('should be equal to defined in json.filed.', function (done) {
    jf.filed( testFilePath ).io( function( obj ) {
        expect(obj).to.eql(jf.initialValue());
        done();
    }).exec();
  });
});


const testFile2Path = './' + Math.random() + '.bson';
var updatedValue = { msg: 'updated' };
describe('The updated value', function () {
  it('should be read again as updated.', function (done) {
    jf.filed( testFile2Path ).io( function( obj ) {
      return updatedValue;
    }).exec();

    setTimeout(
      function(){
        jf.filed( testFile2Path ).io( function( obj ) {
          expect(obj).to.eql(updatedValue);
          done();
        }).exec();
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
    }).exec();

    setTimeout(
      function(){
        jf.filed( testFile3Path).io( function( obj ) {
          expect(obj).to.eql(initialValue);
          obj.msg = "this value is not written."
          //return obj
        }).exec();
      },
      1000
    );

    setTimeout(
      function(){
        jf.filed( testFile3Path).io( function( obj ) {
          expect(obj).to.eql(initialValue);
          done();
        }).exec();
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
    }).exec();

    setTimeout(
      function(){
        jf.filed( testFile4Path).io( function( obj ) {
          expect(obj).to.eql(initialValue);
          obj.msg = "this value is not written also."
          return null
        }).exec();
      },
      1000
    );

    setTimeout(
      function(){
        jf.filed( testFile4Path).io( function( obj ) {
          expect(obj).to.eql(initialValue);
          done();
        }).exec();
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
      ).exec();

    setTimeout(
      function(){
        jf.filed( testFile8Path ).io( function( obj, filePath ) {
          expect( obj.path ).to.eql( testFile8Path );
          done();
        }).exec();
      },
      1000);
    })

});

const serializedFunctionFilePath = './serializedFunction.' + Math.random() + '.bson';
const hello = 'hello';

describe('Serialized function ', function () {
  it('can be executed.', function (done) {
    jf.filed( serializedFunctionFilePath )
    .io(
        function( obj, filePath ) {
          return { say: function( greeting ){ return greeting; } };
        }
      ).exec();

    setTimeout(
      function(){
        jf.filed( serializedFunctionFilePath )
        .io( function( obj ) {
          expect( obj.say( hello ) ).to.eql( hello );
          done();
        }).exec();
      },
      1000);
    })

});
