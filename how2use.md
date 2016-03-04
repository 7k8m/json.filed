# Before use
     let jf = require( 'json.filed' );

Required module of json.filed is loaded.


# Locate path to file
     var jsonfile = jf.filed( '/path/to/jsonFile' );
   
A path to json file is specified.
Features of json.filed is exposed via above `jsonfile`.


# Read
     jsonfile
     .read( ( json ) => { < your code > } )
     .exec();

The json value is read to `json` parameter of function as above.
Write your code to use `json` value in braces.

For example, suppose `json` as `{ msg: 'hello world' }`:

     .read( ( json ) => { console.log( json.msg ) } )


# Write
     jsonfile
     .write( <json object to write > )
     .exec();

Write is easier than read !
Just place JSON object to be written in 2nd parentheses.

For example, suppose writing msg, 'good after noon' :

     .write( { msg: 'good after noon' } )
 
[More examples ...](./examples.md)
