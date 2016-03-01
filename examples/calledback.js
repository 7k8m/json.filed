var jf = require('json.filed');

jf.filed( './hello.json' )
.io( { msg: 'hello' } )
.calledback(
  function(obj, filePath, callback){

    //nested json.filed process here.
    jf.filed( filePath )
    .pass(
      function(obj, filePath){
        obj.msg = obj.msg + " world";
        callback( obj );
      }
    ).exec();

  }
).pass(
  (obj) => { console.log(obj.msg) }
).exec();
