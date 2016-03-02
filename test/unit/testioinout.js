'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';

var testValue = { msg: "value from 1st IO." };

describe('in and out ', function () {
  it('works without error.', function (done) {

    jf
    .filed( testFilePath )
    .out( testValue )
    .pass( ( obj, filePath ) => { expect(obj).to.eql(testValue) } )
    .out( ( filePath ) => { expect(filePath).to.eql(testFilePath) } )
    .in( { msg: "ignored." } )
    .pass((obj, filePath ) => { expect(obj).to.eql(testValue)})
    .pass( () => { done() } )
    .exec();

  });
});
