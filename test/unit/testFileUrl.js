'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';
const testUrl = 'http://example.com/' + Math.random() + '.json';
const testFile3Path = './' + Math.random() + '.json';

var testValue = { msg: "value from 1st IO." };

describe('File and url ', function () {
  it('can be gotten from filed,newFile,download', function (done) {

    let f = jf.filed( testFilePath );
    let n = jf.newFile( testFile2Path );
    let d = jf.download( testUrl, testFile3Path);

    expect(f.file()).to.be.equals( testFilePath );
    expect(n.file()).to.be.equals( testFile2Path );
    expect(d.url()).to.be.equals( testUrl );
    expect(d.file()).to.be.equals( testFile3Path );
    done();

  });
});
