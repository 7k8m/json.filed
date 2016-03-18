'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs'),
    path = require('path');

const obj1 = { msg: 'This is 1' };
const obj2 = { msg: 'This is 2' };

describe('Event executer ', function () {
  it('works without error', function (done) {

    jf
    .event(
      function( receiveListner, stopListener ){

        setTimeout(() => {
          receiveListner( obj1 );

          setTimeout(() => {

            receiveListner( obj2 );
            stopListener();

          }, 200 );
        }, 200 );

      },
      function( obj ) { return './' + Math.random() + '.json'; } ,
      function( err ){ console.log(err); }
    )
    .collect(
      function(obj){
        expect( obj[0] ).to.be.eql( obj1 );
        expect( obj[1] ).to.be.eql( obj2 );
        done();
      },
      './' + Math.random() + '.json',
      function(err){ console.log(err); }
    )
    .exec();
  });
});
