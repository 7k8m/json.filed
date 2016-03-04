# json.filed
Processor / library of json file

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

# Install
    npm install json.filed

# Reference
See [this page](./reference.md)
