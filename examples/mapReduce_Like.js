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
        .calledback( ( msgObj, filePath, callback ) => {
            //Map phase
            for( let word of msgObj.msg.split(' ')){
              callback( { key : word, value: 1 }, './' + count + '.json');
              count ++;
            }
            callback();

          }
        )
        .filter( (obj,filePath) => {
          let basename = path.basename(filePath)
          return  basename != 'msg01.json' &&
                  basename != 'msg02.json'
          }
        )
        .collect( ( kvArray ) =>{
          var obj = {};
          for( let kv of kvArray ){
            if( ! obj[ kv.key ] ) obj[ kv.key ] = [];
            obj[kv.key].push(kv.value);
          }

          return obj;

        },'./collect.json' )
        .io( obj => {
          
            //Reduce phase
            for( let word in obj ){
              var sum = 0;
              for( let c of obj[word] ){
                sum = sum + c;
              }
              obj[word] = sum;
            }
            return obj;
          }
        ).exec();
      }
    ).exec();
  }
).exec();
