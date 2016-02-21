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

module.exports.filed = function (file) { return new filedExecuter (file); }

function createFieldExecuter(file){
  var executer = new filedExecuter(file);

}

function filedExecuter( file ){

  let thisExecuter = this;
  if(file == null){
    raiseError( 'File is needed.' );
  }

  this.executeChild = function(p1,p2){};

  this.io = addChildExecuterFunction(executerFactory(ioExecuter,thisExecuter),this);
  this.copy = addChildExecuterFunction(executerFactory(copyExecuter,thisExecuter),this);
  this.link = addChildExecuterFunction(executerFactory(linkExecuter,thisExecuter),this);
  this.pass = addChildExecuterFunction(executerFactory(passExecuter,thisExecuter),this);

  this.exec = function(){ filedExecute( file, thisExecuter.executeChild ); };

};

function ioExecuter( userProcess, root ){

  this.executeChild = function( p1,p2 ){};
  this.internalExec = function ( filePath, jb) {
    io(filePath, userProcess, jb, this.executeChild );
  }

  this.io = addChildExecuterFunction(executerFactory(ioExecuter,root),this);
  this.copy = addChildExecuterFunction(executerFactory(copyExecuter,root),this);
  this.link = addChildExecuterFunction(executerFactory(linkExecuter,root),this);
  this.pass = addChildExecuterFunction(executerFactory(passExecuter,root),this);

  this.exec = function(){ root.exec() };

}

function copyExecuter( userProcess, root){

  this.executeChild = function(p1,p2){};

  this.internalExec = function ( filePath, jb) {
    copy(filePath, userProcess, jb, this.executeChild );
  }

  this.io = addChildExecuterFunction(executerFactory(ioExecuter,root),this);
  this.copy = addChildExecuterFunction(executerFactory(copyExecuter,root),this);
  this.link = addChildExecuterFunction(executerFactory(linkExecuter,root),this);
  this.pass = addChildExecuterFunction(executerFactory(passExecuter,root),this);

  this.exec = function(){ root.exec() };

}

function linkExecuter( userProcess, root){

  this.executeChild = function(p1,p2){};

  this.internalExec = function ( filePath, jb) {
    link(filePath, userProcess, jb, this.executeChild );
  }

  this.io = addChildExecuterFunction(executerFactory(ioExecuter,root),this);
  this.copy = addChildExecuterFunction(executerFactory(copyExecuter,root),this);
  this.link = addChildExecuterFunction(executerFactory(linkExecuter,root),this);
  this.pass = addChildExecuterFunction(executerFactory(passExecuter,root),this);

  this.exec = function(){ root.exec() };

}

function passExecuter( userProcess, root){
  this.executeChild = function(p1,p2){};

  this.internalExec = function( filePath, jb) {
    pass(filePath, userProcess, jb, this.executeChild );
  }

  this.io = addChildExecuterFunction(executerFactory(ioExecuter,root),this);
  this.copy = addChildExecuterFunction(executerFactory(copyExecuter,root),this);
  this.link = addChildExecuterFunction(executerFactory(linkExecuter,root),this);
  this.pass = addChildExecuterFunction(executerFactory(passExecuter,root),this);

  this.exec = function(){ root.exec() };

}

function executerFactory(classFunction,root){
  return function(userProcess){ return new classFunction(userProcess,root) };
}

function addChildExecuterFunction( executerFactory, parent ){

  var f = function( userProcess ){ //function to create child executer.

    let executer = executerFactory( userProcess );
    parent.executeChild = function( filePath ){ //switch state of parent also.
      executer.internalExec( filePath, calcJb( filePath ));
    }

    return executer;

  }

  return f;//return function added to parent.

}


function filedExecute( file, execute ){
  let itr = pathIterator( file );
  for( let filePath of itr ){
    execute(filePath, calcJb(filePath));
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

function io( filePath, userProcess, jb, chainedProcess){

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
            if (err) raiseError('IOError Failed to read file.');

            fs.close(fd,
              function(err){

                if(err) raiseError('IOError failed to close file.');

                let originalJson = decode( data, jb);
                apply(
                  userProcess,
                  decode( data, jb ),
                  filePath,
                  function( afterCloseProcess ){ afterCloseProcess() }, // no need to close filePath, but need to call chainedProcess.
                  jb,
                  filePath,
                  saveAfterApply,
                  chainedProcess
                );
              }
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
                    function(afterCloseProcess){// close descriptor.
                      fs.close(
                        fd,
                        function(err){
                          if(err) raiseError("io:failsed to close file");
                          afterCloseProcess();
                        }
                      );
                    },
                    jb,
                    filePath,
                    saveAfterApply,
                    chainedProcess
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

function link( filePath, userProces, jb, chainedProcess ){
  processfs(filePath, userProces, jb, chainedProcess, fsLink);
}

function copy( filePath, userProces, jb, chainedProcess ){
  processfs(filePath, userProces, jb, chainedProcess, fsCopy);
}

function processfs( filePath, userProcess, jb, chainedProcess, fsFunction){

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

            if (err) raiseError('IOError Failed to read file.');
            fs.close(
              fd,
              function(err){
                if(err) raiseError('link:failed to close file');

                var json = decode( data, jb);
                apply(
                  userProcess,
                  json,
                  filePath,
                  function( afterCloseProcess ){ afterCloseProcess() }, // closed already and no need to close, but need to call chained process
                  jb,
                  filePath,
                  fsFunction,
                  chainedProcess
                );

              }
            );
          }
        );
      }
    }
  );

}

function pass( filePath, userProcess, jb, chainedProcess){

  fs.open(
    filePath,
    'r+',
    (err,fd) => {

      if( ! err ){
        //pass only when file exists.

        //read from file and process
        fs.readFile(
          fd,
          encoding(jb),
          (err, data) => {

            fs.close(fd);

            if (err) raiseError('IOError Failed to read file.');
            var json = decode( data, jb);
            apply(
              userProcess,
              json,
              filePath,
              function( afterCloseProcess ){ afterCloseProcess(); }, // closed already and no need to close, but need to call chained process.
              jb,
              filePath,
              passPostProcess,
              chainedProcess
            );
          }
        );
      }

    }
  );

}

//apply process function to json.
function apply( process, json, file, closeFile, jb, filePath, postProcess, chainedProcess){

  if( chainedProcess == undefined) chainedProcess = function(p1,p2){};

  var result = process(json,filePath);

  if(result != undefined && result != null){
    //if result returned, executePostProcess
    postProcess(
      result,
      file,
      closeFile, //executed after saved.
      jb,
      filePath,
      chainedProcess
    );

  }else{
    closeFile( function(){ chainedProcess( filePath )} );
  }

}

//file can be either of file path and descriptor

function save( data, file, closeFile, jb){
  saveCore( data,file, closeFile, jb);
}

function saveAfterApply( data, file, closeFile, jb, filePath, chainedProcess ){
  saveCore(data,file,closeFile,jb,filePath,chainedProcess);
}

function saveCore( data, file, closeFile, jb,
                    filePath, chainedProcess //only passsed in saveAfterApplly
                  ){

  try{
    fs.writeFile(
      file,
      encode(data,jb),
      encoding(jb),
      (err)=>{
        closeFile(
          function() {
            if( chainedProcess ) chainedProcess(filePath);
          }
        );//file is closed in afterSaved, if needed.
        if (err) raiseError('IOError failed to save json');
      }
    );
  }catch(error){
    closeFile(
      function() {
        if( chainedProcess ) chainedProcess(filePath);
      }
    );
    throw raiseError("failed in save", error);
  }
}

function fsCopy( copied2Path, file, closeFile, jb, originalFilePath,chainedProcess ){ //"fs" is to avoid name conflict.

  let itr = pathIterator( copied2Path );
  for(let newFilePath of itr ){
    fsPipe(
      originalFilePath,
      newFilePath,
      function(err){
        if(err) raiseError("Failed to copy from " + originalFilePath + " to " + newFilePath,err);
        if( chainedProcess ) chainedProcess( newFilePath );
      }
    );
  }
}

function fsPipe( fromPath, toPath, callback){

  let readStream = fs.createReadStream(fromPath);
  let writeStream = fs.createWriteStream(toPath);

  //readStream.on('end',()=>{} ); // rely on end feature
  writeStream.on('finish',() => { callback( false );} );

  readStream.on('error',(err) => { callback(err) } );
  writeStream.on('error',(err) => { callback(err) } );

  readStream.pipe(writeStream);

}

function fsLink( linkPath, file, closeFile, jb, originalFilePath,chainedProcess ){ //"fs" is to avoid name conflict.

  //link runs only after file was closed. closeFile is passed as compatibility of postProcess interface
  //closeFile();
  let itr = pathIterator( linkPath );
  for(let newFilePath of itr ){
    fs.link(
      originalFilePath,
      newFilePath,
      function(err){
        if(err) raiseError("Failed to link from " + originalFilePath + " to " + newFilePath,err);
        if( chainedProcess ) chainedProcess( newFilePath );
      }
    );
  }
}

function passPostProcess( result, file, closeFile, jb, originalFilePath,chainedProcess ){
  if( chainedProcess ) chainedProcess( originalFilePath );
}

function encoding( jb ){
  if( jb == JB_BSON ) return null;
  else if( jb == JB_JSON ) return 'utf8';
  else raiseError('encoding: jb must be JSON or BSON');
}

function decode( obj, jb ){
  if( jb == JB_BSON ){
    return BSON.deserialize(
      obj,
      {
        evalFunctions:true,
        cacheFunctions:true
      }//experimental
    );
  }
  else if ( jb == JB_JSON ) return JSON.parse(obj);
  else raiseError('decode: jb must be JSON or BSON');
}

function encode( obj, jb ){
  if( jb == JB_BSON ) {
    return BSON.serialize(
      obj,
      false,
      true,
      true //experimental
    );
  }
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
