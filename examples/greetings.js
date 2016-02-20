var jf = require('json.filed');

jf.filed(['./hello.json','./😄.json']).io( function(json,filePath) {
  return {msg: filePath }; // write 1st greeting to data.json
}).exec();
