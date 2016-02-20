var jf = require('json.filed');

jf.filed('./data.bson').io( function(bson) {
  return {msg: 'hello world.'}; // write 1st greeting to data.bson
}).exec();
