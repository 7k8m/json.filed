'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';


var testValue = { msg: "value from 1st IO." };

describe('filed with not existing file ', function () {
  it('can be continued with pass executer with out error.', function (done) {

    jf
    .filed( testFilePath )
    .pass( function() {} )
    .pass( function() {done()})
    .exec();

  });
});
