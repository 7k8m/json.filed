'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

describe('filed( obj )', function () {
    it('should be a function', function () {
        expect(jf.filed( "filePath" ).io).to.be.a('function');
    });
});

const testFilePath = './' + Math.random() + '.json';
describe('The initialValue', function () {
  it('should be equal to defined in json.filed.', function (done) {
    jf.filed( testFilePath ).io(
      function( obj ) {
        expect(obj).to.eql(jf.initialValue());
        done();
      }
    );
  });
});


const testFile2Path = './' + Math.random() + '.json';
var updatedValue = { msg: 'updated' };
describe('The updated value', function () {
  it('should be read again as updated.', function (done) {
    jf.filed( testFile2Path ).io(
        function( obj ) {
          return updatedValue;
        }
      );

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

const testFile3Path = './' + Math.random() + '.json';
var initialValue = { msg: 'initial' };
describe('The value function does not return ', function () {
  it('should not be written.', function (done) {
    jf.filed( testFile3Path ).io(
      function( obj ) {
        return initialValue;
      });

    setTimeout(
      function(){
        jf.filed( testFile3Path ).io(
          function( obj ) {
            expect(obj).to.eql(initialValue);
            obj.msg = "this value is not written."
            //return obj
          });
      },
      1000
    );

    setTimeout(
      function(){
        jf.filed( testFile3Path ).io(
          function( obj ) {
            expect(obj).to.eql(initialValue);
            done();
          });
        },
        1000
      );

  });
});


const testFile4Path = './' + Math.random() + '.json';
describe('Function return null', function () {
  it('does not make json to be written.', function (done) {
    jf.filed( testFile4Path).io(
      function( obj ) {
        return initialValue;
      }
    );

    setTimeout(
      function(){
        jf.filed( testFile4Path ).io(
          function( obj ) {
            expect(obj).to.eql(initialValue);
            obj.msg = "this value is not written also."
            return null
          });
      },
      1000
    );

    setTimeout(
      function(){
        jf.filed( testFile4Path ).io(
          function( obj ) {
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
      jf.filed( null );
    }catch(e){
      expect(e).to.be.an.instanceof( jf.JsonFiledError );
      done();
    }
  });
});

const testFile5Path = './' + Math.random() + '.xson';
var value_in_xson = { msg: "format is json" };
describe('File with extension neither json nor bson ', function () {
  it('should be json.', function (done) {
    jf.filed( testFile5Path ).io(
        function( obj ) {
          return value_in_xson;
        }
      );

    setTimeout(
      function(){
        jf.filed( testFile5Path ).io(
          function( obj ) {
            expect(obj).to.eql( value_in_xson );
            done();
          });
      },
      1000);
    })

});

var testFilePath6_1 = './' + Math.random() + '.json';
var testFilePath6_2 = './' + Math.random() + '.json';

function * testFile6 () {
    yield testFilePath6_1;
    yield testFilePath6_2;
}

describe('File parameter', function () {
  it('can be generator', function (done) {

    jf.filed( testFile6() ).io(
        function( obj, filePath ) {
          return { path: filePath};
        }
      );

    var i = 0;
    setTimeout(
      function(){
        jf.filed( testFile6() ).io(
          function( obj, filePath ) {

            expect(obj.path).to.eql( filePath );
            i ++;
            if(i == 2){
              done();
            }

          });
      },
      1000);
    })

});

var testFilePath7_1 = './' + Math.random() + '.json';
var testFilePath7_2 = './' + Math.random() + '.json';

describe('File parameter', function () {
  it('can be array', function (done) {

    jf.filed( [testFilePath7_1,testFilePath7_2] ).io(
        function( obj, filePath ) {
          return { path: filePath};
        }
      );

    var i = 0;
    setTimeout(
      function(){
        jf.filed( testFile6() ).io(
          function( obj, filePath ) {

            expect(obj.path).to.eql( filePath );
            i ++;
            if(i == 2){
              done();
            }

          });
      },
      1000);
    })

});
