# json.filed
library to read/write json from/to file

## module
    var jf = require('json.filed')

## functions
### filed
````
jf.filed( file )
````
----

+ `file`
    + file is string or generator
        + if string, file is path to read and/or write.
            + File format is bson when `.bson`, json when `.json` or `others`.
        + if generator, above path is generated.

### io
````
jf.filed( file ).io( function( json, filePath ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where I/O json from/to.
    + `return json` from function, written to the file of `filePath` parameter.
        + Nothing written, if return no object.

## examples

### greeting.js
    var jf = require('json.filed');

    jf.filed('./data.json').io( function(json) {
      return {msg: 'hello world.'}; // write 1st greeting to data.json
    });

### greeting2.js
    var jf = require('json.filed');

    jf.filed('./data.json').io( function(json) {
      console.log(json.msg); // previous wrote greeting, 'hello'
      json.msg = 'good after noon world.'; // update msg
      return json; // return to write json file
    });

### greeting3.js
    var jf = require('json.filed');

    jf.filed('./data.json').io( function(json) {
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

### greetings.js
　　　　var jf = require('json.filed');
　　　　
　　　　jf.filed(['./hello.json','./😄.json']).io( function(json,filePath) {
　　　　  return {msg: filePath }; // write 1st greeting to data.json
　　　　});


    $ node greetings.js
    $ cat hello.json
    {"msg":"./hello.json"}
    $ cat 😄.json 
    {"msg":"./😄.json"}


## binary format (bson) support
### greeting.binary.js
     var jf = require('json.filed');

    jf.filed('./data.bson').io( function(bson) {
      return {msg: 'hello world.'}; // write 1st greeting to data.bson
    });
