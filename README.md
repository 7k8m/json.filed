# json.filed
library to read/write json from/to file

## module
    var jf = require('json.filed')

## functions
* filed
````
jf.filed( filePath, function( json ) { your code to process json here } )
````
----

+ `filePath` is path to read and/or write.
    + File format is bson when `.bson`, json when `.json` or `others`.
+ `function( json ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `return json` from function, written to the file.
        + Nothing written, if return no object.

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

## binary format (bson) support
### greeting.binary.js
     var jf = require('json.filed');

    jf.filed('./data.bson',function(bson) {
      return {msg: 'hello world.'}; // write 1st greeting to data.bson
    });
