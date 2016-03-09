# json.filed
library for deferred processing of JSON file 

## Use case
+ what
    + read, write and process JSON files
    + share JSON files between nodes
    + and so on.
+ when
    + Applications needs to store data but DBMS is too much.
    + Scripts handling JSON files on a node
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
