# examples

## greeting.js
    var jf = require('json.filed');

    jf.filed('./data.json')
    .io( function(json) {
      return {msg: 'hello world.'}; // write 1st greeting to data.json
    }).exec();

## greeting2.js
    var jf = require('json.filed');

    jf.filed('./data.json')
    .io( function(json) {
      console.log(json.msg); // previous wrote greeting, 'hello'
      json.msg = 'good after noon world.'; // update msg
      return json; // return to write json file
    }).exec();

## greeting3.js
    var jf = require('json.filed');

    jf.filed('./data.json')
    .io( function(json) {
      console.log(json.msg);// previous wrote greeting, 'good afternoon'
      json.msg = 'good night world.'; // update msg
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
    .io( function(json,filePath) {
        return {msg: filePath }; // write 1st greeting to data.json
    }).exec();

## Above script are executed as ...
    $ node greetings.js
    $ cat hello.json
    {"msg":"./hello.json"}
    $ cat 😄.json
    {"msg":"./😄.json"}

## linked_hello.js
    var jf = require('json.filed');

    jf.filed('./hello.json')
    .io( function(json,filePath) {
      return {msg: "hello" }; }) // write 1st greeting to data.json
    .link( function(json,filePath){
      return 'linked_hello.json'
    }).exec();

## Above script are executed as ...
    $ node chained_greeting.js
    $ cat hello.json
    {"msg":"hello"}
    $ cat linked_hello.json
    {"msg":"hello"}


## calledback.js
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

## Above script are executed as ...
    $ node calledback.js
    hello world

## greeting.binary.js
    var jf = require('json.filed');

    jf.filed('./data.bson')
    .io( function(bson) {
      return {msg: 'hello world.'}; // write 1st greeting to data.bson
    }).exec();
