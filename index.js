/*
Copyright (c) 2016, Tomohito Nakayama. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

'use strict';

const fs = require('fs');
const bson = require('bson');
const BSON = new bson.BSONPure.BSON();

const initialValue = {};

const JB_JSON = 'j';
const JB_BSON = 'b';

module.exports = {};

module.exports.initialValue =
  function() { return initialValue; };

module.exports.filed =
  function( filePath, processOfFiledJson){
    filedCore( filePath, processOfFiledJson, JB_JSON );
  };

module.exports.bFiled =
  function( filePath, processOfFiledBson){
    filedCore( filePath, processOfFiledBson, JB_BSON );
  };


function filedCore( filePath, processOfFiledJson, jb){

  if(filePath == null){
    throw new JsonFiledError( 'Path to file object is needed.' );
  }

  fs.open(
    filePath,
    'r+',
    (err,fd) => {

      if( ! err ){
        //file to read exists.

        //read from file and process
        fs.readFile(
          fd,
          encoding(jb),
          (err, data) => {

            fs.close(fd);
            if (err) throw new JsonFiledError('IOError Failed to read file.');

            apply(
              processOfFiledJson,
              decode( data, jb ),
              filePath,
              function(){}, // no need to close filePath
              jb
            );
          }
        );

      }else{
        //file to read does not exists.

        //create file with initial value and process json.
        fs.open(
          filePath,
          'w+',
          (err,fd) => {

            if(err) throw new JsonFiledError('IOError Failed to create file.') ;

            //save to file and apply process.
            save(
              initialValue,
              fd,
              function(){
                //apply process
                apply(
                  processOfFiledJson,
                  initialValue,
                  fd,
                  function(){// close descriptor.
                    fs.close( fd );
                  },
                  jb
                );
              },
              jb
            );

          }
        );
      }
    }
  )
};


//apply process function to json.
function apply( process, json, file, afterApply, jb ){

  var result = process(json);

  if(result != undefined && result != null){
    //if result returned, upate json file to result.
    save(
      result,
      file,
      afterApply, //executed after saved.
      jb
    );

  }else{
    afterApply();

  }

}

//file can be either of file path and descriptor
function save( data, file, afterSaved, jb ){
  fs.writeFile(
    file,
    encode(data,jb),
    encoding(jb),
    (err)=>{
      if (err) throw new JsonFiledError('IOError failed to save json');
      afterSaved();//file is closed in afterSaved, if needed.
    }
  );
}

function encoding( jb ){
  if( jb == JB_BSON ) return null;
  else if( jb == JB_JSON ) return 'utf8';
  else throw new JsonFiledError('encoding: jb must be JSON or BSON');
}

function decode( obj, jb ){
  if( jb == JB_BSON ) return BSON.deserialize(obj);
  else if ( jb == JB_JSON ) return JSON.parse(obj);
  else throw new JsonFiledError('decode: jb must be JSON or BSON');
}

function encode( obj, jb ){
  if( jb == JB_BSON ) return BSON.serialize( obj, false, true, false);
  else if( jb == JB_JSON ) return JSON.stringify( obj );
  else throw new JsonFiledError('encode: jb must be JSON or BSON');
}

function JsonFiledError(msg){
  this.msg = msg;
};

module.exports.JsonFiledError = JsonFiledError;
