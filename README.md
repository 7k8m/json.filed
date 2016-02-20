# json.filed
Processor of json file

## module
    var jf = require('json.filed')

## functions
### filed
````
jf.filed( file )
````
----

+ `file`
    + file is string or iterator
        + if string, file is path to read and/or write.
            + File format is bson when `.bson`, json when `.json` or `others`.
        + if iterator, above path is iterated.

### io
````
jf.filed( file ).io( function( json, filePath ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where I/O json from/to.
    + `return json` from function, written to the file of `filePath` parameter.
        + Nothing written, if return no object.

### link
````
jf.filed( file ).link( function( json, filePath ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    + `return newPath` from function, file of incoming `filePath` linked to newPath
        + newPath is string or iterator
            + if string, filePath.
            + if iterator, above filePath is iterated.
        + Nothing newly linked,if return no object.

### chaining
````
jf.filed( file )
.io( function( json, filePath ) { your code to process json here } )
.link( function( json, filePath )) { your another code to proces json here} )
````

io and link can be chained as above.

## examples

### greeting.js
    var jf = require('json.filed');

    jf.filed('./data.json').io( function(json) {
      return {msg: 'hello world.'}; // write 1st greeting to data.json
    }).exec();

### greeting2.js
    var jf = require('json.filed');

    jf.filed('./data.json').io( function(json) {
      console.log(json.msg); // previous wrote greeting, 'hello'
      json.msg = 'good after noon world.'; // update msg
      return json; // return to write json file
    }).exec();

### greeting3.js
    var jf = require('json.filed');

    jf.filed('./data.json').io( function(json) {
      console.log(json.msg);// previous wrote greeting, 'good afternoon'
      json.msg = 'good night world.'; // update msg
      // not write this time, because I'm sleepy 😴
      // return json;
    }).exec();

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
    }).exec();

### Above scripts are executed as ...
    $ node greetings.js
    $ cat hello.json
    {"msg":"./hello.json"}
    $ cat 😄.json
    {"msg":"./😄.json"}

### linked_hello.js
    var jf = require('json.filed');

    jf.filed('./hello.json').io( function(json,filePath) {
      return {msg: "hello" }; // write 1st greeting to data.json
    }).link( function(json,filePath){
      return 'linked_hello.json'
    }).exec();

### Above scripts are executed as ...
    $ node chained_greeting.js
    $ cat hello.json
    {"msg":"hello"}
    $ cat linked_hello.json
    {"msg":"hello"}

## binary format (bson) support
### greeting.binary.js
     var jf = require('json.filed');

    jf.filed('./data.bson').io( function(bson) {
      return {msg: 'hello world.'}; // write 1st greeting to data.bson
    }).exec();
