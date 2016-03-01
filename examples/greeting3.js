var jf = require('json.filed');

jf.filed('./data.json')
.io(
  (json) => {
  console.log(json.msg);// previous wrote greeting, 'good afternoon'
  json.msg = 'good night world.';
  // not write this time, because I'm sleepy 😴
  // return json;
}).exec();
