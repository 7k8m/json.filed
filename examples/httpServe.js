'use strict';
var jf = require('json.filed');

// easy JSON server
let hello = jf.filed('./hello.json');
hello.httpServe('/greeting' )
.exec();

jf.httpServer().listen( 8080 );
// http://localhost:8080/greeting
