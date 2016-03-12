# examples

## greeting.js
    var jf = require('json.filed');

    jf.filed('./data.json')
    .write( { msg: 'hello world.'} ).exec(); // write 1st greeting to data.json

## greeting2.js
    var jf = require('json.filed');

    jf.filed('./data.json')
    .io(
      (json) => {
      console.log(json.msg); // previous wrote greeting, 'hello'
      json.msg = 'good after noon world.'; // next greeting
      return json;
    }).exec();

## greeting3.js
    var jf = require('json.filed');

    jf.filed('./data.json')
    .io(
      (json) => {
         console.log(json.msg);// previous wrote greeting, 'good afternoon'
         json.msg = 'good night world.';
         // not write this time, because I'm sleepy 😴  
         // return json;
    }).exec();


## Above scripts are executed as ...
    $ node greeting.js
    $ node greeting2.js
    hello world.
    $ node greeting3.js
    good after noon world.
    $ cat data.json
    {"msg":"good after noon world."}


## greetings.js
    var jf = require('json.filed');

    jf.filed(['./hello.json','./😄.json'])
    .io( ( obj,filePath ) => { msg: filePath } }).exec();


## Above script is executed as ...
    $ node greetings.js
    $ cat hello.json
    {"msg":"./hello.json"}
    $ cat 😄.json
    {"msg":"./😄.json"}

## linked_hello.js
    var jf = require('json.filed');

    jf.filed(['./hello.json','./linked_hello.json'])
    .io( ( obj,filePath ) => { msg: filePath } ).exec();


## Above script is executed as ...
    $ node chained_greeting.js
    $ cat hello.json
    {"msg":"hello"}
    $ cat linked_hello.json
    {"msg":"hello"}


## download.js
    'use strict';
     var jf = require('json.filed');

    jf.download(
    {
        method: "GET",
        uri: 'https://api.github.com/repos/7k8m/json.filed/commits/076aff7302cae3046955de13af41b1be90f41f03',
        headers: {
          'User-Agent': 'json.filed'
        }
    },
    './firstcommit.json' )
    .pass(
      ( obj ) => {
         console.log(obj.commit.message);
      }
    ).exec();

## Above script is executed as ...
    $ node download.js
    initial commit    


## httpServe.js
    use strict';
    var jf = require('json.filed');

    // easy JSON server
    let hello = jf.filed('./hello.json');
    hello.httpServe('/greeting' )
    .exec();

    jf.httpServer().listen( 8080 );
    // http://localhost:8080/greeting


## Above script is executed ad ...
    $ cat hello.json
    { "msg": "hello" }
    $ node httpServe.js &
    $ curl http://localhost:8080/greeting
    {"msg":"hello"}


## httpServe_2.js
    'use strict';

    let jf = require('json.filed');
    let fs = require('fs');
    let path = require('path');

    fs.readdir( <path to directory where json files exist> , function( err,files ){
      let jsonFiles =
        jf.filed(
          files.filter(
            ( filePath ) => filePath.toLowerCase().endsWith('.json')
          )
        );

      jsonFiles.httpServe( ( obj, filePath ) => '/' + path.basename( filePath ) )
      .exec();

    } );

    jf.httpServer().listen( 8080 );
    // http://localhost:8080/<jsonfilename>


## calledback.js
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

## Above script is executed as ...
    $ node calledback.js
    hello world

## parallel.js
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

## Above script is executed as ...
    $ node parallel.js
    hello world


## collect.js
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

## Above script is executed as ...
    $ node collect.js 
    [ { msg: 'world' }, { msg: 'hello' } ]
    $ cat data1.json
    {"msg":"hello"}
    $ cat data2.json
    {"msg":"world"}
    $ cat data3.json
    [{"msg":"world"},{"msg":"hello"}]

## Use in electron
[See this repository](https://github.com/7k8m/electron-quick-start)

## greeting.binary.js
    var jf = require('json.filed');

    jf.filed('./data.bson')
    .io( function(bson) {
      return {msg: 'hello world.'}; // write greeting to data.bson
    }).exec();
