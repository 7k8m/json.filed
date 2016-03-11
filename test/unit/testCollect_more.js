'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs'),
    path = require('path');

const onlyCollectedFilePath = './' + Math.random() + '_.json';
const testFilePath =
  function *() {
    for(var i = 0;i < 100; i ++){
      if( i == 90 ) yield onlyCollectedFilePath;
      else yield './' + Math.random() + '.json';
    }
  };

const collectedToFilePath = './' + Math.random() + '.json';

const objToAdd = { msg: 'added by collect executer' };

describe('Collect function', function () {
  it('should work without error even if there are many files filtered away.', function (done) {

    jf.filed( testFilePath() ).io(
      function( obj, filePath) {
        return { file: filePath };
      }
    )
    .filter( obj => obj.file == path.resolve( onlyCollectedFilePath ) )
    .collect(
      function(obj){
        expect( obj.length ).to.be.equal(1);
        expect(obj[0].file).to.be.equal( path.resolve ( onlyCollectedFilePath ) );
        done();
      },
      collectedToFilePath,
      function(err){ console.log(err); }
    )
    .exec();
  });
});
