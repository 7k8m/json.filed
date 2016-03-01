var jf = require('json.filed');

jf.filed(['./hello.json','./😄.json'])
.io( {msg: filePath } }).exec(); // write 1st greeting to data.json
