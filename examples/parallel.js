var jf = require('json.filed');

var msg;

jf.filed('./data.json')
.parallel(

  jf.filed('./data1.json')
  .write( { msg:'hello' } ),

  jf.filed('./data2.json')
  .write( { msg:'world' } ) )

.calledback(
  (obj, filePath, callback) =>
  {
    jf.filed('./data1.json')
    .read(
      ( obj1 ) => {
        jf.filed('./data2.json')
        .read(
          ( obj2 ) => {
            callback( { msg: obj1.msg + " " + obj2.msg } );
          }
        ).exec();
      }
    ).exec();
  }
)
.pass( ( obj ) => { console.log( obj.msg ) } )
.exec();
