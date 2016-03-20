# json.filed
library for deferred processing of JSON file

## Use case
+ what
    + read, write and process JSON files
        + JSON from file
        + JSON from url
        + JSON from listened event
    + share JSON files between nodes
    + collect contents of multiple JSON file into a JSON file.
    + and so on.
+ when
    + Applications needs to store data, but DBMS is not the case.
    + Server handling JSON
    + Scripts handling JSON files on a node
    + and so on.


# hello world
    var jf = require('json.filed');

    jf.filed('./data.json')
    .write( { msg: 'hello world.'} )
    .read( json => { console.log( json.msg ) } )
    .exec();
[how to use ...](./document/how2use.md)

# Deferred ...?
Yes, [deferred](./document/HowDeferred.md) ! <br/>
Read and write file and so on is executed in defferred manner to make best use of node.js.

# Reference
See [this page](./document/reference.md)

# Examples
See [this page](./document/examples.md)
