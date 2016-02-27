# json.filed
Processor of json file

## Module
    var jf = require('json.filed')

## Executers
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


### download
````
jf.download( url, file )
````
----

+ `url`
    + specify url from download json
+ `file`
    + file is string or iterator
        + if string, file is path to write downloaded JSON.
        + if iterator, above path is iterated.


### io
````
.io( function( json, filePath, executer ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where I/O json from/to.
    + `return json` from function, written to the file of `filePath` parameter.
        + Nothing written, if return no object.
    + `executer` is an event emitter and can be used in error handling

### copy
````
.copy( function( json, filePath, executer ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    + `return newPath` from function, file of incoming `filePath` copied to newPath
        + newPath is string or iterator
            + if string, filePath.
            + if iterator, above filePath is iterated.
        + Nothing copied,if return no object.
    + `executer` is an event emitter and can be used in error handling

### link
````
.link( function( json, filePath, executer ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    + `return newPath` from function, file of incoming `filePath` linked to newPath
        + newPath is string or iterator
            + if string, filePath.
            + if iterator, above filePath is iterated.
        + Nothing newly linked,if return no object.
    + `executer` is an event emitter and can be used in error handling

### filter
````
.filter( function( json, filePath, executer ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    + function return `true` and chained process executed, otherwise chained process not executed for that `json`.
    + `executer` is an event emitter and can be used in error handling

### pass
````
.pass( function( json, filePath, executer ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    + result of process does not affect execution of pass, and pass just continues next.
    + `executer` is an event emitter and can be used in error handling

### calledback
````
.calledback( function( json, filePath, callback, executer ) { your code to process json. call callback to here } )
````

+ `function( json, filePath, callback ) { ... }` is where to process json, and call asynchronous function like setTime /readFile with callback.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    +  when `callback` is called, process of next executor begins.
        + `callback` is called  `callback(data)`. Here `data` is a json which is saved to file and passed to next executor.
    + `executer` is an event emitter and can be used in error handling

## Chaining
````
jf.filed( file )
.io( function( json, filePath ) { your code to process json here } )
.copy( function( json, filePath ) { your another code to process json here} )
.link( function( json, filePath ) { your another code to process json here} )
.filter( function( json, filePath ) { your another code to process json here} )
.pass( function( json, filePath ) { your another code to process json here} )
````

io,copy and link and filter and pass can be chained as above.

## Error handling
### Error listener of executer
Error captured in each executer can be handled in error listener of executer
````
jf.filed(
  file,
  function( err ) { your code to handle error here } )
.io(
  function( j, f ) { ... },
  function( err ) { your code to handle error here } ).exec();
````

Each executer is emitter and you can send error to them.
````
.pass(
  function( j, f, executer) {
    executer.emit('error', {msg: "some of error" } )
  },
  function( err ) { your code to handle error here } ).exec();
````

### DefaultEmitter
Error captured not in each executer is emitted by defaultEmitter and can be handled by error listener of defaultEmitter
````
var jf = require( 'json.filed' )
jf.defaultEmitter.removeAllListeners( 'error' ); //default error listener of defaultEmitter kills process. Remove them to keep running.
jf.defaultEmitter.on(
  'error',
  function( err ){ your code to handle error here }
).exec();
````

## Binary format (bson) support
