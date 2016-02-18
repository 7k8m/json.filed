var jf = require('json.filed');

jf.filed('./data.json',function(json) {
  return {msg: 'hello world.'}; // write 1st greeting to data.json
});
