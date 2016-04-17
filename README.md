# json.filed
Framework for processing of JSON file

## Core concept
JSON file as variable in program which runs on node.js

## Use case
+ what
    + read, write and process JSON files
    + share JSON files between nodes
    + collect contents of multiple JSON file into a JSON file.
    + and so on.
+ when
    + Applications needs to store data, but DBMS is not the case.
    + Server handling JSON
    + IoT device write and read JSON
    + Scripts handling JSON files on a node
    + Handle JSON from several sources
        + JSON from file
        + JSON from url
        + JSON from listened event
    + and so on.


# hello world
    var jf = require('json.filed');

    jf.filed('./data.json')
    .write( { msg: 'hello world.'} )
    .read( json => { console.log( json.msg ) } )
    .exec();
[how to use ...](./document/how2use.md)

# Deferred
Read and write file and so on is executed in [deferred manner](./document/HowDeferred.md) to make best use of node.js.

# Reference
See [this page](./document/reference.md)

# Examples
See [this page](./document/examples.md)
