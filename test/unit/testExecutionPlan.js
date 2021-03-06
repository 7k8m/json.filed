'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    path = require('path');

const testFilePath = './' + Math.random() + '.json';

var testValue1 = { msg: "test value 1" };
var testValue2 = { msg: "test value 2" };

describe('Chained operation ', function () {
  it('can be branched.', function (done) {

    let init =
      jf.filed( testFilePath )
      .io( function( obj, filePath){} )
      .pass( function(){

        let rootPart =
          jf.filed( testFilePath )
          .copy( function(){ return './' + Math.random() + '.json'; }, function( err ){ console.log(err) } )
          .filter( ( obj, filePath ) => filePath != path.resolve( testFilePath ) );

        rootPart
        .io( function( obj, filePath ) { return testValue1; } )
        .pass( function( obj, filePath ){
          expect( obj ).to.eql( testValue1 );

          rootPart
          .io( function( obj, filePath ) { return testValue2; } )
          .pass( function( obj, filePath ){
            expect( obj ).to.eql( testValue2 );
            done();
          } ).exec();

        } ).exec();

      })
      .exec();

  });
});
