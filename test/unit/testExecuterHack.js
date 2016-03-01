'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';

var testValue = { msg: "value from 1st IO." };

describe('User Function ', function () {
  it('emit error for correct executer', function (done) {

    var i = 0;
    function sharedFunction ( json, filePath, executer ) {
      i ++;
      executer.emit('error',new Error('error:' + i));
    }

    jf
    .filed( testFilePath )
    .pass( sharedFunction,
      function( err ){ expect( err.message ).to.equal('error:1')  })
    .pass( sharedFunction,
      function( err ){ expect( err.message ).to.equal('error:2') })
    .pass( () => { done(); } )
    .exec();

  });
});
