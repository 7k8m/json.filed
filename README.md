# json.filed
library for deferred processing of JSON file 

## Use case
+ read, write and process JSON file
+ share JSON files between nodes
+ and so on.

# hello world
    var jf = require('json.filed');

    jf.filed('./data.json')
    .write( { msg: 'hello world.'} )
    .read( json => { console.log( json.msg ) } )
    .exec();
[how to use ...](./how2use.md)

# Reference
See [this page](./reference.md)
