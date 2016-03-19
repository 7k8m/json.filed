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
        let sourcer =
          jf.filed([ './msg01.json', './msg02.json' ])
          .pass( ( msgObj ) => {
            mapper.receive( msgObj );
          })
          .plan();

        sourcer.runtime.on('empty',() => { mapper.stop(); })
        sourcer.exec();
      }
    ).exec();
  }
).exec();

var c1 = 0;
let mapper =
  jf.event(
    () => {},
    () => {
      c1 ++;
      return './src' + c1 + '.json'
    })
  .pass( ( msgObj ) => {
    for( let word of msgObj.msg.split(' ')){
      shuffler.receive( { key : word, value: 1 });
      count ++;
    }
  })
  .plan();
mapper.runtime.on('empty',() => { shuffler.stop(); });
mapper.exec();

var c2 = 0;
let shuffler =
  jf.event(
    ()=>{},
    () => {
      c2 ++;
      return './' + c2 + '.json' } )
  .collect( ( kvArray ) => {
      var obj = {};
      for( let kv of kvArray ){
        if( ! obj[ kv.key ] ) obj[ kv.key ] = [];
        obj[kv.key].push(kv.value);
      }
      return obj; },
    './collect.json' )
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
