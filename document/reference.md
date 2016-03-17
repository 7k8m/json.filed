# Module
    var jf = require('json.filed')

# Executers
## Root executers
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

+ object exposes `file()` function which returns value specified `file` parameter above.


### newFile
````
jf.newFile( file )
````
----

+ `file`
    + file is string or iterator
        + if string, file is path to read and/or write.
            + File format is bson when `.bson`, json when `.json` or `others`.
        + if iterator, above path is iterated.
    + if a file for the path exists already, error is raised.

+ object exposes `file()` function which returns value specified `file` parameter above.

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

+ object exposes `url()` function which returns value specified `url` parameter above.
+ object exposes `file()` function which returns value specified `file` parameter above.

### roots
````
jf.roots( <array of root executers> )
````
----

+ `<array of root executers> `
    + array whose element is root executer
        + when executing, those elements works as one root executer.  


## Child executers
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
+ As syntactic sugar, object typed other than function is wrapped as function, as hello world above.

### in
````
.in( function( json, filePath, executer ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where I/O json from/to.
    + `executer` is an event emitter and can be used in error handling
+ As syntactic sugar, object typed other than function is wrapped as function, as hello world above.
+ As syntactic sugar, `read` instead of `in` is prepared.

### out
````
.out( function( filePath, executer ) { your code to process json here } )
````

+ `function( filePath ) { ... }` is where process json.
    + `filePath` is where I/O json from/to.
    + `return json` from function, written to the file of `filePath` parameter.
        + Nothing written, if return no object.
    + `executer` is an event emitter and can be used in error handling
+ As syntactic sugar, object typed other than function is wrapped as function, as hello world above.
+ As syntactic sugar, `write` instead of `out` is prepared.

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
+ As syntactic sugar, object typed other than function is wrapped as function.

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
+ As syntactic sugar, object typed other than function is wrapped as function.

### filter
````
.filter( function( json, filePath, executer ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    + function return `true` and chained process executed, otherwise chained process not executed for that `json`.
    + `executer` is an event emitter and can be used in error handling
+ As syntactic sugar, object typed other than function is wrapped as function.

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

### httpServe
````
.httpServe( function( json, filePath, executer ) { your code to process json. call callback to here } )
````

+ `function( json, filePath ) { ... }` is where to process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    +  return value from function is registered as `pathname` to httpServer
        + httpServer responds json when the `pathname` is requested.
    + `executer` is an event emitter and can be used in error handling
+ As syntactic sugar, object typed other than function is wrapped as function.

#### httpServer
`jf.httpServer()` creates and returns httpServer.
Code as next starts web server to listen with port 8080.
````
let httpServer = jf.httpServer();
httpServer.listen( 8080 );
````

### parallel
````
.parallel( <chained json.filed executers>, <chained json.filed executers> .... )
````

+ `<chained json.filed executers>` are chains of executers started from filed or download.
    + Each executers are executed and when all execcuters are finished, next executer of parallel starts
    + `.exec` functions of each chain are called inside parallel. So do not call `.exec` in argument.

## Other executers
### collect
````
.collect( function( json, filePath, executer ) { your code to process json here }, collectFilePath )
````

+ `function( json, filePath ) { ... }` is where process json.
    + jsons from parent executers are concatenated as array and passed to function as a `json` parameter
    + `filePath` is where I/O concatenated json from/to.
    + `return json` from function, written to the file of `filePath` parameter.
        + Nothing written, if return no object.
    + `executer` is an event emitter and can be used in error handling
+ `collectFilePath` is file path where collected jsons are wriiten to

# Chaining
````
jf.filed( file )
.io( function( json, filePath ) { your code to process json here } )
.copy( function( json, filePath ) { your another code to process json here } )
.link( function( json, filePath ) { your another code to process json here } )
.filter( function( json, filePath ) { your another code to process json here } )
.pass( function( json, filePath ) { your another code to process json here } )
````

executers can be chained as above.

# Error handling
## Error listener of executer
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

## DefaultEmitter
Error captured not in each executer is emitted by defaultEmitter and can be handled by error listener of defaultEmitter
````
var jf = require( 'json.filed' )
jf.defaultEmitter.removeAllListeners( 'error' ); //default error listener of defaultEmitter kills process. Remove them to keep running.
jf.defaultEmitter.on(
  'error',
  function( err ){ your code to handle error here }
).exec();
````

# Binary format (bson) support
