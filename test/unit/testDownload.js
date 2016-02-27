'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

let testPath = './' + Math.random() + '.json';

describe('called back function ', function () {
  this.timeout(10000);
  it('should hand JSON passed in callback function to next executer', function (done) {

    jf.download( 'https://api.github.com/repos/7k8m/json.filed/commits/076aff7302cae3046955de13af41b1be90f41f03', testPath )
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
