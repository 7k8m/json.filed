'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let pathToFind = './' + Math.random() + '.json';

function * testPath(){
  for(i = 0; i < 100; i ++){
    if( i != 21 )
      yield './' + Math.random() + '.json';
    else {
      yield pathToFind;
    }
  }
}

var testValue = { msg: Math.random().toString() };

describe('Filter functions ', function () {
  it('should only pass true returned JSON.', function (done) {

    jf.filed( testPath)
    .io(
      function( obj, filePath) {
        return testValue;
      }
    ).filter(
      function(obj, filePath){
        return filePath == pathToFind;
      }
    ).pass(
      function(obj, filePath){
        expect(filePath).to.eql(pathToFind);
      }
    )

    setTimeout(
      function(){
        done();
      },
      1000);
  });

});
