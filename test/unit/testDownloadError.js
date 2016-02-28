'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    http = require('http');

describe('Error of download function ', function () {
  this.timeout(10000);
  it('should be handled in error listener passed to download function', function (done) {

    jf.download(
      'XXXXXXXXXXXXXXXXXXXXX',
      './test.json',
      function(err){
        console.log(err);
        done();
      }
    ).exec();

  });

  setTimeout(
    function(){
    },
    100);

});
