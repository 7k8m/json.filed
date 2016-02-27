var jf = require('json.filed');

jf.filed( './hello.json' )
.io( function( obj, filePath) {
    return {msg: 'hello' };
  }
).calledback(
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
  function(obj, filePath){
    console.log(obj.msg);
  }
).exec();
