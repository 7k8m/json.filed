'use strict';

let jf = require('json.filed');
let fs = require('fs');
let path = require('path');

fs.readdir( '/Users/tmnk/Documents/runJsonFiled', function( err,files ){
  let jsonFiles =
    jf.filed(
      files.filter(
        ( filePath ) => filePath.toLowerCase().endsWith('.json')
      )
    );

  jsonFiles.httpServe( ( obj, filePath ) => '/' + path.basename( filePath ) )
  .exec();

} );

jf.httpServer().listen( 8080 );
// http://localhost:8080/<jsonfilename>
