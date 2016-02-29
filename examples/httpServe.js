'use strict';
// easy JSON server
var jf = require('json.filed');

let hello = jf.filed('./hello.json');

hello.httpServe( () => { return '/greeting'; } )
.exec();

jf.httpServer().listen( 8080 );
// http://localhost:8080/greeting
