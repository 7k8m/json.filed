'use strict'
let jf = require('json.filed');
let path = require('path');

var count = 0;
jf.filed( './msg01.json' )
.write( { msg: 'Hello World Bye World' } )
.pass(
  () => {
    jf.filed( './msg02.json' )
    .write( { msg: 'Hello json.filed Goodbye json.filed' } )
    .pass(
      () =>{

        jf.filed([ './msg01.json', './msg02.json' ])
        .pass( ( msgObj, filePath ) => {
            //Map phase
            for( let word of msgObj.msg.split(' ')){
              shuffler.receive( { key : word, value: 1 });
              count ++;
            }
          }
        ).collect(
          () => { shuffler.stop(); },
          './collect_1.json'
        ).exec();
      }
    ).exec();
  }
).exec();

var c = 0;
let shuffler =
  jf.event(
    ()=>{},
    () => {
      c ++;
      return './' + c + '.json' } )
  .collect( ( kvArray ) => {
      var obj = {};
      for( let kv of kvArray ){
        if( ! obj[ kv.key ] ) obj[ kv.key ] = [];
        obj[kv.key].push(kv.value);
      }
      return obj; },
    './collect_2.json' )
  .pass( (collectedObj, filePath ) => {
    for( let word in collectedObj ){
      reducer.receive( { key: word, value: collectedObj[word] });
    }
    reducer.stop();
  })
  .exec();

let reducer =
  jf.event(
    () => {},
    ( obj ) => { return './' + obj.key + '.json'} )
  .io( obj => {
      //Reduce phase
        var sum = 0;
        for( let c of obj.value ){
          sum = sum + c;
        }
        return { key: obj.key, value: sum };
    }
  )
  .collect( obj => obj, './answer.json' )
  .exec();
