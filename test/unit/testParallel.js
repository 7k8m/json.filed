'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let testPath = './' + Math.random() + '.json';
var testValue = { msg: Math.random().toString() };

let testPath2 = './' + Math.random() + '.json';
var testValue2 = { msg: Math.random().toString() };

let testPath3 = './' + Math.random() + '.json';
var testValue3 = { msg: Math.random().toString() };

describe('Parallel process ', function () {
  it('works without error', function (done) {

    var countParalelled = 0;
    jf.filed( testPath )
    .io(
      function( obj, filePath) {
        return testValue;
      }
    ).parallel(

      jf.filed( testPath2 )
      .write( testValue2 )
      .pass( () => { countParalelled ++ } ) ,

      jf.filed( testPath3 )
      .write( testValue3 )
      .pass( () => { countParalelled ++ } )

    ).pass(
      function(obj, filePath){
        expect(countParalelled).to.equal(2);
        done();
      }
    ).exec();

  });

  setTimeout(
    function(){
    },
    100);


});
