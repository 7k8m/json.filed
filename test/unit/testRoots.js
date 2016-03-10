'use strict';

var jf = require('../../'),
    expect    = require('chai').expect,
    fs = require('fs'),
    http = require('http');

const testFilePath = './' + Math.random() + '.json';
const testFile2Path = './' + Math.random() + '.json';
const testFile3Path = './' + Math.random() + '.json';
const testFile4Path = './' + Math.random() + '.json';

const collectedToFilePath = './' + Math.random() + '.json';

const testValue = { msg: 'hello world' };

let server = http.createServer( (request, response) => {
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end( JSON.stringify( testValue ) );
}).listen(8080);

describe('Roots executer ', function () {
  it('should work without error', function (done) {

    jf.roots(
      [ jf.filed( testFilePath ),
        jf.roots(
          [ jf.filed( testFile2Path ),
            jf.newFile( testFile3Path ) ] ),
        jf.download( 'http://localhost:8080/', testFile4Path) ],
      ( err ) => { console.log( err ) }
    )
    .io( (obj,filePath) => {

      if( filePath == testFile4Path ) {
        expect( obj ).to.be.eql( testValue );
      }

      return { file: filePath }

    } )
    .collect( obj => {
      expect( obj.length ).to.be.equal(4);
      done();
    },
    collectedToFilePath )
    .exec();
  });
});
