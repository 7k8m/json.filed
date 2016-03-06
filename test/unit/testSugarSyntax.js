'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';

var testValue = { msg: "value from 1st IO." };

describe('Sugar syntax ', function () {
  it('works without error.', function (done) {

    jf
    .filed( testFilePath )
    .io( testValue )
    .pass()
    .pass( obj => { expect( obj ).to.eql( testValue ) } )
    .filter( true )
    .copy( testFile2Path )
    .filter( (obj,filePath) => { return filePath == testFile2Path } )
    .pass(( obj, filePath) => { expect( filePath ).to.eql( testFile2Path ) } )
    .pass( () => { done() } )
    .exec();

  });
});
