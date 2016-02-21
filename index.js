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

const EventEmitter = require('events');
const util = require('util');

const initialValue = {};

const JB_JSON = 'j';
const JB_BSON = 'b';

module.exports = {};

module.exports.initialValue =
  function() { return initialValue; };

module.exports.filed =
  function (file, errListener) {
     return addErrorListener( new filedExecuter (file), errListener );
   }

function filedExecuter( file ){
  let thisExecuter = this;
  if(file == null){
    raiseError( this, 'File is needed.' );
  }

  this.executeChild = function(p1,p2){};

  this.io = addChildExecuterFunction(executerFactory(ioExecuter,thisExecuter),this);
  this.copy = addChildExecuterFunction(executerFactory(copyExecuter,thisExecuter),this);
  this.link = addChildExecuterFunction(executerFactory(linkExecuter,thisExecuter),this);
  this.pass = addChildExecuterFunction(executerFactory(passExecuter,thisExecuter),this);
  this.filter = addChildExecuterFunction(executerFactory(filterExecuter,thisExecuter),this);

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
  this.filter = addChildExecuterFunction(executerFactory(filterExecuter,root),this);

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
  this.filter = addChildExecuterFunction(executerFactory(filterExecuter,root),this);

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
  this.filter = addChildExecuterFunction(executerFactory(filterExecuter,root),this);

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
  this.filter = addChildExecuterFunction(executerFactory(filterExecuter,root),this);

  this.exec = function(){ root.exec() };

}


function filterExecuter( userProcess, root){
  this.executeChild = function(p1,p2){};

  this.internalExec = function( filePath, jb) {
    filter(filePath, userProcess, jb, this.executeChild );
  }

  this.io = addChildExecuterFunction(executerFactory(ioExecuter,root),this);
  this.copy = addChildExecuterFunction(executerFactory(copyExecuter,root),this);
  this.link = addChildExecuterFunction(executerFactory(linkExecuter,root),this);
  this.pass = addChildExecuterFunction(executerFactory(passExecuter,root),this);
  this.filter = addChildExecuterFunction(executerFactory(filterExecuter,root),this);

  this.exec = function(){ root.exec() };

}

util.inherits( filedExecuter, EventEmitter);
util.inherits( ioExecuter, EventEmitter);
util.inherits( copyExecuter, EventEmitter);
util.inherits( linkExecuter, EventEmitter);
util.inherits( filterExecuter, EventEmitter);
util.inherits( passExecuter, EventEmitter);


function executerFactory(classFunction,root){
  return function(userProcess){ return new classFunction( userProcess, root) };
}

function addChildExecuterFunction( executerFactory, parent ){

  var f = function( userProcess, errListener ){ //function to create child executer.

    let executer = executerFactory( userProcess );
    userProcess._plannedExecuter = executer; //hack to emit error from userProcess by executer.

    parent.executeChild = function( filePath ){ //switch state of parent also.
      try{
        executer.internalExec( filePath, calcJb( filePath ));
      }catch(err){
        raiseError(executer,err.toString(),err);
      }
    }

    addErrorListener( executer, errListener);

    return executer;

  }

  return f;//return function added to parent.

}


function filedExecute( file, execute ){
  let itr = pathIterator( file );
  for( let filePath of itr ){
    execute(filePath, calcJb(filePath) );
  }
}

function pathIterator( file ){
  if ( typeof file == 'string' ){
    return singlePath(file);

  } else if ( file[ Symbol.iterator ] ) {
    return file;

  }else{
    raiseError( null, 'Failed to create path Iterator' );
  }
}

function * singlePath( file ){
  yield file;
}

function io( filePath, userProcess, jb, chainedProcess){

  process(
    filePath,
    userProcess,
    jb,
    chainedProcess,
    saveAfterApply,
    function(){
      //file to read does not exists.
      //create file with initial value and process json.
      fs.open(
        filePath,
        'w+',
        (err,fd) => {

          if(err) raiseError( userProcess._plannedExecuter, 'IOError Failed to create file.') ;

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
                        if(err) raiseError( userProcess._plannedExecuter, "io:failsed to close file");
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
  );

}

function link( filePath, userProces, jb, chainedProcess ){
  process(filePath, userProces, jb, chainedProcess, fsLink,
    raiseUnknownError // link does not create new file when not existed
  );
}

function copy( filePath, userProces, jb, chainedProcess ){
  process(filePath, userProces, jb, chainedProcess, fsCopy,
    raiseUnknownError //copy does not create new file when not existed
  );
}

function pass( filePath, userProcess, jb, chainedProcess){
  process(filePath, userProcess, jb, chainedProcess, passPostProcess,
    raiseUnknownError //pass dows not create new file when not existed
  );
}

function filter( filePath, userProcess, jb, chainedProcess){
  process(filePath,
    filternize(userProcess),
    jb,
    chainedProcess,
    filterPostProcess,
    raiseUnknownError //pass does not create new file when not existed
  );
}

function process(
  filePath,
  userProcess,
  jb,
  chainedProcess,
  jfProcess,
  fileCreationProcess // process to create file when not existed
){

  fs.open(
    filePath,
    'r+',
    (err,fd) => {

      if( ! err ){
        //file exists.

        //read from file and process
        fs.readFile(
          fd,
          encoding(jb),
          (err, data) => {

            if (err) raiseError( userProcess._plannedExecuter, 'IOError Failed to read file.',err);
            fs.close(
              fd,
              function(err){
                if(err) raiseError( userProcess._plannedExecuter, 'IOError Failed to close file',err);

                var json = decode( data, jb);
                apply(
                  userProcess,
                  json,
                  filePath,
                  function( afterCloseProcess ){ afterCloseProcess() }, // closed already and no need to close, but need to call chained process
                  jb,
                  filePath,
                  jfProcess,
                  chainedProcess
                );

              }
            );
          }
        );
      }else{
        //file not exists.
        fileCreationProcess();

      }
    }
  );
}

//(*->*) -> (*->boolean) and a littile bit more.
function filternize( userProcess ){
  // return true/false according to result of user process.
  let result =
    wrapUserProcess(
      userProcess,
      function( process ){
        return function(obj,filePath){
            if( process ( obj, filePath) ) return true;
            else return false;
        };
      }
    );
  return result;

}


function guardProcess( userProcess ){

  let guarded =
    wrapUserProcess(
      userProcess,
      function( userProcess ){
        return function( json, filePath){
          try{
            return userProcess( json, filePath);

          }catch(err){
            //walkaround for unclear this/caller problem in javascript.
            //I just wanted to use something like "this".
            raiseError( userProcess._plannedExecuter, 'User process error', err);

          }
        };
      }
    );

  return guarded;

}


function wrapUserProcess( userProcess, functionWrapper ){

  //To keep _plannedExecuter hack working, this function is needed to use when wrapping userProcess.
  let wrapped = functionWrapper( userProcess );
  wrapped._plannedExecuter = userProcess._plannedExecuter;//hack to emit error from userProcess by executer.

  return wrapped;

}


//apply process function to json.
function apply( process, json, file, closeFile, jb, filePath, postProcess, chainedProcess){

  let guardedProcess = guardProcess(process);

  if( chainedProcess == undefined ) chainedProcess = function(p1,p2){};

  var result = guardedProcess(json,filePath);

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
        if (err) raiseError(null, 'IOError failed to save json');
      }
    );
  }catch(error){
    closeFile(
      function() {
        if( chainedProcess ) chainedProcess(filePath);
      }
    );
    raiseError(null, "failed in save", error);
  }
}

function fsCopy( copied2Path, file, closeFile, jb, originalFilePath,chainedProcess ){ //"fs" is to avoid name conflict.

  let itr = pathIterator( copied2Path );
  for(let newFilePath of itr ){
    fsPipe(
      originalFilePath,
      newFilePath,
      function(err){
        if(err) raiseError(null, "Failed to copy from " + originalFilePath + " to " + newFilePath,err);
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
        if(err) raiseError(null, "Failed to link from " + originalFilePath + " to " + newFilePath,err);
        if( chainedProcess ) chainedProcess( newFilePath );
      }
    );
  }
}

function passPostProcess( result, file, closeFile, jb, originalFilePath,chainedProcess ){
  if( chainedProcess ) chainedProcess( originalFilePath );
}

function filterPostProcess( result, file, closeFile, jb, originalFilePath,chainedProcess ){
  if( result && chainedProcess ) chainedProcess( originalFilePath );
}

function encoding( jb ){
  if( jb == JB_BSON ) return null;
  else if( jb == JB_JSON ) return 'utf8';
  else raiseError(null, 'encoding: jb must be JSON or BSON');
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
  else raiseError(null, 'decode: jb must be JSON or BSON');
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
  else raiseError(null, 'encode: jb must be JSON or BSON');
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

util.inherits(JsonFiledError,Error);

function raiseError(emitter, msg, innerError){
  if( emitter == null) emitter = defaultEmitter;
   emitter.emit('error', new JsonFiledError( msg, innerError));
}

function raiseUnknownError(emitter){
  raiseError(emitter,"Unknown error.",null);
}


var defaultErrorListener = function ( error ){
  console.error( error );
  throw error; //defaut Listener does not adohere keep running.
}

function addErrorListener(emitter, errListener){

  emitter.on(
    'error',
    errListener == undefined || errListener == null ?
    defaultErrorListener :
    errListener
  );
  return emitter;

}

function DefaultEmitter () {};
util.inherits( DefaultEmitter, EventEmitter);
let defaultEmitter = new DefaultEmitter();

defaultEmitter.on('error',defaultErrorListener);

module.exports.defaultEmitter = defaultEmitter;

module.exports.JsonFiledError = JsonFiledError;
