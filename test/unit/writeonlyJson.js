'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';

var testValue = { msg: "value from 1st IO." };
var testValue2 = { msg: "written to write only json" };

describe('Json file with write only permission ', function () {
  it('can be written in write executer.', function (done) {

    jf
    .filed( testFilePath )
    .io( testValue )
    .pass( () => {
      fs.chmod(
        testFilePath,
        '222',
        err => {

          jf
          .filed( testFilePath )
          .write( testValue2 )
          .write ( () => {
            fs.chmod(
              testFilePath,
              '755',
              err => {
                jf
                .filed( testFilePath )
                .pass( ( obj ) => {
                  expect(obj).to.be.eql( testValue2 );
                  done();
                } ).exec();
              });
            return null;
          } )
          .exec();

        } ) } ).exec();

  });
});
