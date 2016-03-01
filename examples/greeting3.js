var jf = require('json.filed');

jf.filed('./data.json')
.io(
  (json) => {
  console.log(json.msg);// previous wrote greeting, 'good afternoon'
  json.msg = 'good night world.';
  // return json;
}).exec();
