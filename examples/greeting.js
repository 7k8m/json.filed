var jf = require('json.filed');

jf.filed('./data.json')
.write( { msg: 'hello world.'} ).exec(); // write 1st greeting to data.json
