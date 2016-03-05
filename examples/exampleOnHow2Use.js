var jf = require( 'json.filed' );

var jsonfile = jf.filed( './data.json' );

jsonfile
.read( ( json ) => { console.log( json.msg ) } )
.exec();

jsonfile
.write( { msg: 'good after noon' } )
.exec();
