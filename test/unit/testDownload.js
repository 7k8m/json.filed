'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let testPath = './' + Math.random() + '.json';

describe('Download function ', function () {
  this.timeout(10000);
  it('should download JSON from internet.', function (done) {

    jf.download(
      {
        method: "GET",
        uri: 'https://api.github.com/repos/7k8m/json.filed/commits/076aff7302cae3046955de13af41b1be90f41f03',
        headers: {
          'User-Agent': 'jsonfiled'
        }
      },
      testPath )
    .pass(
      function(obj, filePath){
        expect(obj.commit.author.name).to.eql( "Tomohito Nakayama" );
        done();
      }
    ).exec();

  });

  setTimeout(
    function(){
    },
    100);

});
