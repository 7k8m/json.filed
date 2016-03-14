# json.filed
library for deferred processing of JSON file 

## Use case
+ what
    + read, write and process JSON files
    + share JSON files between nodes
    + collect contents of multiple JSON file into a JSON file.
    + and so on.
+ when
    + Applications needs to store data, but DBMS is not the case.
    + Scripts handling JSON files on a node
    + and so on.


# hello world
    var jf = require('json.filed');

    jf.filed('./data.json')
    .write( { msg: 'hello world.'} )
    .read( json => { console.log( json.msg ) } )
    .exec();
[how to use ...](./how2use.md)

# Deferred ...?
Yes, deferred ! <br/>
Read and write file and so on is executed in defferred manner to make best use of node.js.

# Reference
See [this page](./reference.md)
