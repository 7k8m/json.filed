'use strict';

var jf = require('../../'),
    expect    = require('chai').expect;

describe('Constructing roots executer with null rootExecuters ', function () {
  it('causes error', function (done) {

  let roots =
    jf.roots(
      null,
      (err) => {
        expect(err.msg).to.eql('rootsExecuters must not be null.');
        done();
      } );
  });
});
