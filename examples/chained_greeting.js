var jf = require('json.filed');

jf.filed('./hello.json')
.io( function(json,filePath) {
  return {msg: "hello" }; }) // write 1st greeting to data.json
.link( function(json,filePath){
  return 'linked_hello.json'
}).exec();
