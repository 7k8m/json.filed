'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs'),
    path = require('path');

const obj1 = { msg: 'This is 1' };
const obj2 = { msg: 'This is 2' };
const objToIgnore = { msg: 'ignored' };

describe('Event executer ', function () {
  it('works without error', function (done) {

  let executing =
    jf
    .event(
      function( receive, stop ){
      },
      function( obj ) { return './' + Math.random() + '.json'; } ,
      function( err ){ console.log(err); }
    )
    .collect(
      function(obj){
        expect( obj[0] ).to.be.eql( obj1 );
        expect( obj[1] ).to.be.eql( obj2 );
        expect( obj.length ).to.be.equal( 2 );
        done();

        return obj;

      },
      './' + Math.random() + '.json',
      function(err){ console.log(err); }
    )
    .exec();


    setTimeout(() => {
      executing.receive( obj1 );

      setTimeout(() => {

        executing.receive( obj2 );
        executing.stop();

        executing.receive( objToIgnore );

      }, 200 );
    }, 200 );

  });
});
