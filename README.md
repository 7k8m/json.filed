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

## chaining
````
jf.filed( file )
.io( function( json, filePath ) { your code to process json here } )
.link( function( json, filePath )) { your another code to proces json here} )
````

io and link can be chained as above.


## binary format (bson) support
