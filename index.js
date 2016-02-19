/*
Copyright (c) 2016, Tomohito Nakayama. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

'use strict';

const fs = require('fs');
const path = require('path');
const bson = require('bson');
const BSON = new bson.BSONPure.BSON();

const initialValue = {};

const JB_JSON = 'j';
const JB_BSON = 'b';

module.exports = {};

module.exports.initialValue =
  function() { return initialValue; };

module.exports.filed = function (file) { return new filed (file); }

function filed( file ){

  if(file == null){
    raiseError( 'File is needed.' );
  }

  this.io = function( userProcess ){
    execute(file, io, userProcess);
  }

  this.link = function( userProcess ){
    execute(file, link, userProcess);
  }

};

function execute( file, filedProcess, userProcess){
  let itr = pathIterator( file );
  for( let filePath of itr ){
    filedProcess(filePath, userProcess, calcJb(filePath));
  }
}

function pathIterator( file ){
  if ( typeof file == 'string' ){
    return singlePath(file);

  } else if ( file[ Symbol.iterator ] ) {
    return file;

  }else{
    raiseError( 'Failed to create path Iterator' );

  }
}

function * singlePath( file ){
  yield file;
}

function io( filePath, userProcess, jb){

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
            if (err) raiseError('IOError Failed to read file.');

            apply(
              userProcess,
              decode( data, jb ),
              filePath,
              function(){}, // no need to close filePath
              jb,
              filePath,
              save
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

            if(err) raiseError('IOError Failed to create file.') ;

            //save to file and apply process.
            save(
              initialValue,
              fd,
              function(){
                //apply process
                apply(
                  userProcess,
                  initialValue,
                  fd,
                  function(){// close descriptor.
                    fs.close( fd );
                  },
                  jb,
                  filePath,
                  save
                );
              },
              jb
            );

          }
        );
      }
    }
  );

}

function link( filePath, userProcess, jb){

  fs.open(
    filePath,
    'r+',
    (err,fd) => {

      if( ! err ){
        //link only when file exists.

        //read from file and process
        fs.readFile(
          fd,
          encoding(jb),
          (err, data) => {

            fs.close(fd);
            if (err) raiseError('IOError Failed to read file.');

            apply(
              userProcess,
              decode( data, jb ),
              filePath,
              function(){}, // closed already and no need to close
              jb,
              filePath,
              fsLink

            );
          }
        );
      }
    }
  );

}

//apply process function to json.
function apply( process, json, file, closeFile, jb, filePath, postProcess){

  var result = process(json,filePath);

  if(result != undefined && result != null){
    //if result returned, executePostProcess
    postProcess(
      result,
      file,
      closeFile, //executed after saved.
      jb,
      filePath
    );

  }else{
    closeFile();

  }

}

//file can be either of file path and descriptor
function save( data, file, closeFile, jb, filePath){

  try{
    fs.writeFile(
      file,
      encode(data,jb),
      encoding(jb),
      (err)=>{
        closeFile();//file is closed in afterSaved, if needed.
        if (err) raiseError('IOError failed to save json');

      }
    );
  }catch(error){
    closeFile();
    throw raiseError("failed in save", error);
  }
}

function fsLink( linkPath, file, closeFile, jb, originalFilePath){ //"fs" is to avoid name conflict.

  //link runs only after file was closed. closeFile is passed as compatibility of postProcess interface
  //closeFile();
  let itr = pathIterator( linkPath );
  for(let newFilePath of itr ){
    fs.link(
      originalFilePath,
      newFilePath,
      function(err){
        if(err) raiseError("Failed to link from " + originalFilePath + " to " + newFilePath,err);
      }
    );
  }

}

function encoding( jb ){
  if( jb == JB_BSON ) return null;
  else if( jb == JB_JSON ) return 'utf8';
  else raiseError('encoding: jb must be JSON or BSON');
}

function decode( obj, jb ){
  if( jb == JB_BSON ) return BSON.deserialize(obj);
  else if ( jb == JB_JSON ) return JSON.parse(obj);
  else raiseError('decode: jb must be JSON or BSON');
}

function encode( obj, jb ){
  if( jb == JB_BSON ) return BSON.serialize( obj, false, true, false);
  else if( jb == JB_JSON ) return JSON.stringify( obj );
  else raiseError('encode: jb must be JSON or BSON');
}

function calcJb( filePath ){

  switch( path.extname( filePath ).toLowerCase() ){

    case ".bson":
      return JB_BSON;

    case ".json":
    default:
      return JB_JSON;

  }
}

function JsonFiledError(msg,innerError){
  this.msg = msg;
  this.innerError = innerError;
};

function raiseError(msg,innerError){
  throw new JsonFiledError(msg,innerError);
}

module.exports.JsonFiledError = JsonFiledError;
