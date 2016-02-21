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
.io( function( json, filePath ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where I/O json from/to.
    + `return json` from function, written to the file of `filePath` parameter.
        + Nothing written, if return no object.

### copy
````
.copy( function( json, filePath ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    + `return newPath` from function, file of incoming `filePath` copied to newPath
        + newPath is string or iterator
            + if string, filePath.
            + if iterator, above filePath is iterated.
        + Nothing copied,if return no object.


### link
````
.link( function( json, filePath ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    + `return newPath` from function, file of incoming `filePath` linked to newPath
        + newPath is string or iterator
            + if string, filePath.
            + if iterator, above filePath is iterated.
        + Nothing newly linked,if return no object.

### pass
````
.pass( function( json, filePath ) { your code to process json here } )
````

+ `function( json, filePath ) { ... }` is where process json.
    + json from file is passed to function as a `json` parameter
    + `filePath` is where json from.
    + result of process does not affect execution of pass, and pass just continues next.

## chaining
````
jf.filed( file )
.io( function( json, filePath ) { your code to process json here } )
.link( function( json, filePath )) { your another code to proces json here} )
.pass( function( json, filePath )) { your another code to process json here} )
````

io,link and pass can be chained as above.


## binary format (bson) support
