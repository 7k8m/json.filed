var jf = require('json.filed');

jf.bFiled('./data.bson',function(bson) {
  return {msg: 'hello world.'}; // write 1st greeting to data.json
});
