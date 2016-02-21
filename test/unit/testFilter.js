'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let pathToFind = './' + Math.random() + '.json';
let pathToNotFind = './' + Math.random() + '.json';

function * testPath(){
  for(var i = 0; i < 100; i ++){
    if( i == 30 ){
      yield pathToFind;

    }else if( i == 49){
      yield pathToNotFind;

    }
    else
    {
      yield './' + Math.random() + '.json';
    }
  }
}

var testValue = { msg: Math.random().toString() };

describe('Filter functions ', function () {
  it('should only pass true returned JSON.', function (done) {

    jf.filed( testPath() )
    .io(
      function( obj, filePath) {
        return testValue;
      }
    ).filter(
      function(obj, filePath){
        if (filePath == pathToFind)
          return true;
        else if(filePath == pathToNotFind)
          return false;
      }
    ).pass(
      function(obj, filePath){
        expect(filePath).to.eql(pathToFind);
      }
    ).exec();

    setTimeout(
      function(){
        done();
      },
      1000);
  });

});
