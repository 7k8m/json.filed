var jf = require('json.filed');

jf.filed('./data.bson')
.io( { msg: 'hello world.'} ).exec(); // write 1st greeting to data.bson
