var jf = require('json.filed');

jf.filed('./hello.json')
.io( { msg: "hello" } ) // write 1st greeting to data.json
.link( 'linked_hello.json' ).exec();
