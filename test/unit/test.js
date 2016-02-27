'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

describe('filed( obj ).io(function(){}).exec', function () {
    it('should be a function', function () {
        expect(jf.filed( "filePath" ).io(function(){}).exec).to.be.a('function');
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
    ).exec();
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
      ).exec();

    setTimeout(
      function(){
        jf.filed( testFile2Path ).io( function( obj ) {
          expect(obj).to.eql(updatedValue);
          done();
        }).exec();
      },
      10);
    })

});

const testFile3Path = './' + Math.random() + '.json';
var initialValue = { msg: 'initial' };
describe('The value function does not return ', function () {
  it('should not be written.', function (done) {
    jf.filed( testFile3Path ).io(
      function( obj ) {
        return initialValue;
      }).exec();

    setTimeout(
      function(){
        jf.filed( testFile3Path ).io(
          function( obj ) {
            expect(obj).to.eql(initialValue);
            obj.msg = "this value is not written."
            //return obj
          }).exec();
      },
      10
    );

    setTimeout(
      function(){
        jf.filed( testFile3Path ).io(
          function( obj ) {
            expect(obj).to.eql(initialValue);
            done();
          }).exec();
        },
        20
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
    ).exec();

    setTimeout(
      function(){
        jf.filed( testFile4Path ).io(
          function( obj ) {
            expect(obj).to.eql(initialValue);
            obj.msg = "this value is not written also."
            return null
          }).exec();
      },
      10
    );

    setTimeout(
      function(){
        jf.filed( testFile4Path ).io(
          function( obj ) {
            expect(obj).to.eql(initialValue);
            done();
          }).exec();
        },
        20
      );

  });
});

describe('Null file Path', function () {
  it('should cause JsonFiledError', function (done) {
    try{
      jf.filed( null ).exec();
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
      ).exec();

    setTimeout(
      function(){
        jf.filed( testFile5Path ).io(
          function( obj ) {
            expect(obj).to.eql( value_in_xson );
            done();
          }).exec();
      },
      10);
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
      ).exec();

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

          }).exec();
      },
      100);
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
      ).exec();

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

          }).exec();
      },
      100);
    })

});

describe('File parameter', function () {
  it('can\'t be number', function () {

    try{
      jf.filed( 0 ).io(
          function( obj, filePath ) {
            return { path: filePath};
          }
      ).exec();
    }catch(error){
      expect( error ).to.be.an.instanceof( jf.JsonFiledError );
    }
  });
});

const testFile8Path = './' + Math.random() + '.JSON';

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
      100);
    })

});

const testFile9Path = './' + Math.random() + '.json';

const test9msg = "all messages are same"

const testFile9LinkedPath_1 = './' + Math.random() + '.json';
const testFile9LinkedPath_2 = './' + Math.random() + '.json';

describe('linked files ', function () {
  it('should have same values', function (done) {
    jf.filed( testFile9Path ).io(
        function( obj, filePath ) {
          return { msg:  test9msg };
        }
      ).exec();

    setTimeout(
      function(){
        jf.filed( testFile9Path ).link( function( obj, filePath ) {
          return [ testFile9LinkedPath_1, testFile9LinkedPath_2 ];
        }).exec();
      },
      100);

    var count = 0;
    setTimeout(
      function(){
        jf.filed( [testFile9LinkedPath_1, testFile9LinkedPath_2] ).io( function( obj, filePath ) {
          expect( obj.msg ).to.eql( test9msg );
          count ++;
          if(count == 2) done();
        }).exec();
      },
      200);
    })

});

const testFile10Path = './' + Math.random() + '.json';

describe('Function that return no object', function () {
  it('should not cause error in link', function (done) {
    jf.filed( testFile10Path ).io(
        function( obj, filePath ) {
          return { msg:  "hello" };
        }
      ).exec();

    setTimeout(
      function(){
        jf.filed( testFile10Path ).link( function( obj, filePath ) {
          //return no object
        }).exec();
      },
      100);

    setTimeout(
      function(){
        done();
      },
      200
    );

  })

});

const testFile11Path = './' + Math.random() + '.json';
const test11msg = { msg: "received by pass"};
describe('Pass ', function () {
  it('should receives former process', function (done) {
    jf.filed( testFile11Path ).io(
        function( obj, filePath ) {
          return test11msg;
        }
      ).exec();

    setTimeout(
      function(){
        jf.filed( testFile11Path ).pass( function( obj, filePath ) {
            expect(obj).to.eql( test11msg );
            done();
        }).exec();
      },
      100);
    });

});

describe('filed( obj ).io(function(){}).io(function(){}).exec', function () {
    it('should be a function', function () {
        expect(jf.filed( "filePath" ).io(function(){}).io(function(){}).exec).to.be.a('function');
    });
});
