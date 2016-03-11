'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs'),
    path = require('path');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';

var testValue = { msg: "value from 1st IO." };
var testValue2 = { msg: "value from 2nd IO." };

describe('in and out ', function () {
  it('works without error.', function (done) {

    jf
    .filed( testFilePath )
    .out( testValue )
    .pass( ( obj, filePath ) => { expect(obj).to.eql(testValue) } )
    .out( ( filePath ) => { expect(filePath).to.eql(path.resolve( testFilePath ) ) } )
    .in( { msg: "ignored." } )
    .pass((obj, filePath ) => { expect(obj).to.eql(testValue)})
    .write( testValue2 )
    .read( obj => { expect( obj ).to.eql( testValue2 ) } )
    .pass( () => { done() } )
    .exec();

  });
});
