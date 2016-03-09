'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';

const collectedFilePath = './' + Math.random() + '.json';

describe('Collect function', function () {
  it('should work without error', function (done) {

    jf.filed( [ testFilePath, testFile2Path ] ).io(
      function( obj, filePath) {
        return { file: filePath };
      }
    )
    .collect(
      function(obj){
        return obj;
      },
      collectedFilePath,
      function(err){ console.log(err); }
    )
    .pass(( obj ) => {

      expect( obj.length ).to.be.equal(2);

      expect(
        obj[0].file == testFilePath ||
        obj[0].file == testFile2Path ).to.be.equal( true );
      expect(
        obj[1].file == testFilePath ||
        obj[1].file == testFile2Path ).to.be.equal( true );

      expect( obj[0].file != obj[1].file ).to.be.equals(true);

      done() } )
    .exec();
  });
});
