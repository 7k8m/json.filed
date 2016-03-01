'use strict';

var jf = require('../../'),
    expect    = require('chai').expect;


var testValue_1 = { msg: "test value 1" };
var testValue_2 = { msg: "test value 2" };

describe('Filed instance ', function () {
  it('can be shared different executer', function (done) {

    let randomNameJsonFile =
      jf.filed( ( function * (){
          yield './' + Math.random() + '.json'; }));

    var filePath1;
    randomNameJsonFile
    .io( function( obj, filePath ) {
      filePath1 = filePath;
      return testValue_1 })
    .pass( () => {

      var filePath2;
      randomNameJsonFile
      .io( function( obj, filePath ) {
        filePath2 = filePath;
        return testValue_2 })
      .pass(
        () => {

           console.log( filePath1 );
           jf.filed( filePath1 )
           .io( (obj ) => { expect( obj ).to.eql( testValue_1 )})
           .pass( () => {

               console.log( filePath2 )
               jf.filed( filePath2 )
               .io(( obj ) => { expect( obj ).to.eql( testValue_2 )})
               .pass( () => { done(); })
               .exec(); })
            .exec(); })
      .exec(); })
  .exec(); })
});
