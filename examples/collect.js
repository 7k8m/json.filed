var jf = require('json.filed');

var msg;

jf.filed('./data.json')
.parallel(
  jf.filed('./data1.json').write( { msg:'hello' } ),
  jf.filed('./data2.json').write( { msg:'world' } ) )
.pass(
  () =>
  {
    jf
    .filed( [ './data1.json', './data2.json' ] )
    .collect( obj => obj, './data3.json' )
    .pass( ( obj ) => { console.log( obj ) } )
    .exec();
  }
)
.exec();
