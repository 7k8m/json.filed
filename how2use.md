# Install
    npm install json.filed


# Load module
    var jf = require( 'json.filed' );


# Locate path to file
    var jsonfile = jf.filed( '/path/to/jsonFile' );


# Read
    jsonfile
    .read( ( json ) => { < your code > } )
    .exec();

For example :

    .read( ( json ) => { console.log( json.msg ) } )

Result :

    $ node exampleOnHow2Use.js
    hello world


# Write
     jsonfile
     .write( <json object to write > )
     .exec();


For example :

     .write( { msg: 'good after noon' } )

Result :

    $ cat data.json
    {"msg":"good after noon"}

[Too easy ? See _2 too...](./how2use_2.md)<br/>
[Reference ...](/reference.md)
