var jf = require('json.filed');

jf.filed('./data.json').io(
  (json) => {
  console.log(json.msg); // previous wrote greeting, 'hello'
  json.msg = 'good after noon world.'; // next greeting
  return json;
}).exec();
