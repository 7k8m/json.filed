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

[Other examples ...](./examples.md)

# Install
    npm install json.filed

# Reference
See [this page](./reference.md)
