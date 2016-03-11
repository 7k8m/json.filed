'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs'),
    path = require('path');

const testFilePath = './' + Math.random() + '.json';

const testFilePath1 = './' + Math.random() + '.json';
const testFilePath2 = './' + Math.random() + '.json';

var testValue = { msg: "value from 1st IO." };

describe('Chained IO function', function () {
  it('should receive filePath and value which previous IO function passed and returned', function (done) {

    var filePathMap = new Map([[ path.resolve( testFilePath2 ),true]]);

    jf.filed( testFilePath )
    .io(
      function( obj, filePath){
          expect( filePath ).to.eql( path.resolve( testFilePath ) );
          return testValue;
        }
      ).copy(
        function( obj, filePath){

          expect( filePath ).to.eql( path.resolve( testFilePath ) );
          expect( obj ).to.eql( testValue );

          return [testFilePath1];
        }
      ).filter(
        function(obj,filePath){
          return filePath == path.resolve( testFilePath1 );
        }
      ).link(
        function( obj, filePath){
          expect( filePath ).to.eql( path.resolve( testFilePath1 ) );
          expect( obj ).to.eql( testValue );

          return [testFilePath2];
        }
      ).filter(
        function( obj,filePath){
          return filePath == path.resolve( testFilePath2 );
        }
      ).pass(
        function( obj, filePath){
          expect( filePath ).to.eql( path.resolve( testFilePath2 ) );
          expect( obj ).to.eql( testValue );
          filePathMap.delete(filePath);

          if(filePathMap.size == 0)
            done();
        }
      ).exec();


  });
});
