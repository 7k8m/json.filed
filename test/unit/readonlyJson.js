'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';

var testValue = { msg: "value from 1st IO." };
var testValue2 = { msg: "written to write only json" };

describe('Json file with read only permission ', function () {
  it('can be read in read executer', function (done) {

    jf
    .filed( testFilePath )
    .io( testValue )
    .pass( () => {
      fs.chmod(
        testFilePath,
        '444',
        err => {

          jf
          .filed( testFilePath )
          .read( ( obj ) => { expect( obj ).to.be.eql( testValue ); } )
          .pass ( () => {
            fs.chmod(
              testFilePath,
              '755',
              err => { done(); });
            return null;
          } )
          .exec();

        }
      )
    } ).exec();
  });
});
