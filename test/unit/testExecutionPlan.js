'use strict';

var jf = require('../../'),
    expect    = require('chai').expect;

const testFilePath = './' + Math.random() + '.json';

const copyFilePath1 = './' + Math.random() + '.json';
const copyFilePath2 = './' + Math.random() + '.json';

var testValue1 = { msg: "test value 1" };
var testValue2 = { msg: "test value 2" };

describe('Chained operation ', function () {
  it('can be branched.', function (done) {

    let init =
      jf.filed( testFilePath )
      .io( function( obj, filePath){} )
      .pass( function(){

        let rootPart =
          jf.filed( testFilePath );

        rootPart
        .copy( function(){ return copyFilePath1; }, function( err ){ console.log(err) } )
        .io( function( obj, filePath ) { return testValue1; } )
        .pass( function( obj, filePath ){
          expect( obj ).to.eql( testValue1 );
        } ).exec();

        rootPart
        .copy( function(){ return copyFilePath2; }, function( err ){ console.log(err) } )
        .io( function( obj, filePath ) { return testValue2; } )
        .pass( function( obj, filePath ){
          expect( obj ).to.eql( testValue2 );
        } ).exec();


      })
      .exec();

    setTimeout(
      function() {
        done();
      },
      100
    );


  });
});
