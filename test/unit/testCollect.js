'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';
const testFile3Path = './' + Math.random() + '.json';

const collectedFilePath = './' + Math.random() + '.json';

const objToAdd = { msg: 'added by collect executer' };

describe('Collect function', function () {
  it('should work without error', function (done) {

    jf.filed( [ testFilePath, testFile2Path ] ).io(
      function( obj, filePath) {
        return { file: filePath };
      }
    )
    .filter( obj => obj.file != testFile3Path )
    .collect(
      function(obj){
        expect( obj.length ).to.be.equal(2);
        obj[2] = objToAdd;
        return obj;
      },
      collectedFilePath,
      function(err){ console.log(err); }
    )
    .pass(( obj ) => {

      expect( obj.length ).to.be.equal(3);

      expect(
        obj[0].file == testFilePath ||
        obj[0].file == testFile2Path ).to.be.equal( true );
      expect(
        obj[1].file == testFilePath ||
        obj[1].file == testFile2Path ).to.be.equal( true );

      expect( obj[0].file != obj[1].file ).to.be.equal(true);

      expect( obj[2] ).to.be.eql( objToAdd );

      jf
      .filed( testFilePath )
      .pass( obj =>{ expect(obj.file).to.be.equal( testFilePath ) } )
      .pass( () => {
        jf
        .filed( testFile2Path )
        .pass(
          obj => {
            expect(obj.file).to.be.equal( testFile2Path )
            done();
          } )
        .exec();
      } ).exec();
    } )
    .exec();
  });
});
