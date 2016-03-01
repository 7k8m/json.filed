var jf = require('json.filed');

jf.filed(['./hello.json','./😄.json'])
.io( ( obj,filePath ) => { msg: filePath } ).exec(); // write 1st greeting to data.json
