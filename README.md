# json.filed
library to read/write json from/to file

## example
### greeting.js
    var jf = require('json.filed');

    jf.filed('./data.json',function(json) {
      return {msg: 'hello world.'}; // write 1st greeting to data.json
    });

### greeting2.js
    var jf = require('json.filed');

    jf.filed('./data.json',function(json) {
      console.log(json.msg); // previous wrote greeting, 'hello'
      json.msg = 'good after noon world.'; // update msg
      return json; // return to write json file
    });

### greeting3.js
    var jf = require('json.filed');

    jf.filed('./data.json',function(json) {
      console.log(json.msg);// previous wrote greeting, 'good afternoon'
      json.msg = 'good night world.'; // update msg
      // not write this time, because I'm sleepy 😴
      // return json;
    });

### Above scripts are executed as ...
    $ node greeting.js
    $ node greeting2.js
    hello world.
    $ node greeting3.js
    good after noon world.
    $ cat data.json
    {"msg":"good after noon world."}
