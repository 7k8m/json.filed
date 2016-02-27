/*
Copyright (c) 2016, Tomohito Nakayama. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

'use strict';

const fs = require('fs');
const path = require('path');

const request = require('request');

const bson = require('bson');
const BSON = new bson.BSONPure.BSON();

const EventEmitter = require('events');
const util = require('util');

const initialValue = {};

const JB_JSON = 'j';
const JB_BSON = 'b';

let jf = {};

jf.initialValue =
  function() { return initialValue; };

jf.filed =
  function (file, errListener) {
     return addErrorListener( new filedExecuter (file), errListener );
   }

jf.download =
 function (url, file, errListener) {
    return addErrorListener( new downloadExecuter (url, file), errListener );
  }

function executer( parent ){

 this.parent = parent;

 this.io = addChildExecuterFunction(createExecuterFactory(ioExecuter, this ));
 this.copy = addChildExecuterFunction(createExecuterFactory(copyExecuter, this ));
 this.link = addChildExecuterFunction(createExecuterFactory(linkExecuter, this ));
 this.pass = addChildExecuterFunction(createExecuterFactory(passExecuter, this ));
 this.filter = addChildExecuterFunction(createExecuterFactory(filterExecuter, this ));
 this.calledback = addChildExecuterFunction(createExecuterFactory(calledbackExecuter, this ));

 this.exec = function(){

   let executorStack = [];
   var toStack = this;

   //executor stack from where exec called to root.
   while( toStack != null ){
     executorStack.push(toStack);
     toStack = toStack.parent;
   }


   let root = executorStack.pop();
   let rootPlan = createPlan( root );

   var executor = root;
   var plan = rootPlan;

   executor = executorStack.pop();

   while( executor != null ){
     plan._nextPlan = createPlan( executor );
     plan = plan._nextPlan;
     executor = executorStack.pop();
   };

   root.rootExec( rootPlan );

  };

}

function executePlan( executeFunction ){

  this._executeFunction = executeFunction;

  this._nextPlan = null;
  this.next =
    function(){
      let nextPlan =
        this._nextPlan != null && this._nextPlan != undefined ?
        this._nextPlan : notexecPlan;
      return nextPlan;
    }

}

let notexecPlan =
  new executePlan( function(){}, null );

function filedExecuter( file ){

  executer.call( this, null );

  let thisExecuter = this;

  this.rootExec =
    function(executePlan){
      executePlan._executeFunction( file )
    };

};

function downloadExecuter( url, file ){

  executer.call( this, null );
  let thisExecuter = this;
  this.rootExec =
    function( executePlan ){
      executePlan._executeFunction( url, file )
    };

};


function childExecuter( userProcess, parent ){

  executer.call( this, parent );

  this.generalInternalExec = function ( filePath, jb , executerFunction, executerPlan ) {
    executerFunction ( filePath, userProcess, jb, executerPlan.next() );
  }

}

function createPlan( executer ){
  if( executer instanceof filedExecuter) return createFiledPlan( executer );
  else if( executer instanceof downloadExecuter ) return createDownloadPlan(executer);
  else return createChildPlan( executer );
}

function createChildPlan( executer ){
  return new executePlan(
    function( filePath ){
      try{
        executer.internalExec(
          filePath,
          calcJb( filePath ),
          this
        );

      }catch(err){
        raiseError(executer,err.toString(),err);
      }
    }
  );
}

function createFiledPlan( executer ){
  return new executePlan(
    function( file ){
      if( file != null ) {
        let itr = pathIterator( file, executer);
        for( let filePath of itr ){
          this.next()._executeFunction( filePath );
        }
      }else{
        raiseError( executer , "File must not be null", null);
      }
    }
  );
}



function createDownloadPlan( executer ){

  return new executePlan(
    function( url, filePath ){

      let thisPlan = this;

      jf
      .filed( filePath )
      .io( function(){})
      .calledback( function( file, object, callback, executer ){
        request(
          url,
          function (error, response, body ) {
          if (!error &&
              response.statusCode == 200 &&
              response.headers['content-type'].startsWith('application/json')) {

              callback(decode(body,JB_JSON));

          }else{
              executer.emit("error",response);
          }

        });
      })
      .pass(
        function(json, filePath ){
          let itr = pathIterator( filePath , executer);
          for( let filePath of itr ){
            thisPlan.next()._executeFunction( filePath );
          }
        }
      ).exec();
    }
  );
}


function pathIterator( file, filedExecuter){
  try{
    if ( typeof file == 'string' ){
      return singlePath(file);
    } else if ( file[ Symbol.iterator ] ) {
      return file;
    } else {
      throw new Error();
    }
  } catch ( error ) {
    raiseError( filedExecuter, 'Failed to create path Iterator' );
  }

  return [];

}

function * singlePath( file ){
  yield file;
}


function ioExecuter( userProcess, parent) {

  childExecuter.call( this, userProcess, parent );

  this.internalExec = function(filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, io, executionPlan );
  }

};


function copyExecuter( userProcess, parent ) {
  childExecuter.call( this, userProcess, parent );

  this.internalExec = function( filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, copy, executionPlan );
  }

};


function linkExecuter( userProcess, parent ) {
  childExecuter.call( this, userProcess, parent );

  this.internalExec = function( filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, link, executionPlan );
  }

};


function passExecuter( userProcess, parent ) {
  childExecuter.call( this, userProcess, parent );

  this.internalExec = function( filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, pass, executionPlan );
  }

};


function filterExecuter( userProcess, parent ) {
  childExecuter.call( this, userProcess, parent);

  this.internalExec = function( filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, filter, executionPlan );
  }

};

function calledbackExecuter( userProcess, parent ) {
  childExecuter.call( this, userProcess, parent);

  this.internalExec = function( filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, calledback, executionPlan );
  }

};


util.inherits( executer, EventEmitter);

util.inherits( filedExecuter, executer);
util.inherits( downloadExecuter, executer);

util.inherits( childExecuter, executer);
util.inherits( ioExecuter, childExecuter);
util.inherits( copyExecuter, childExecuter);
util.inherits( linkExecuter, childExecuter);
util.inherits( passExecuter, childExecuter);
util.inherits( filterExecuter, childExecuter);
util.inherits( calledbackExecuter, childExecuter);

function createExecuterFactory( classFunction, parent ){
  return function(userProcess){ return new classFunction( userProcess, parent ) };
}

function addChildExecuterFunction( executerFactory ){

  var f = function( userProcess, errListener ){ //function to create child executer.

    let executer = executerFactory( userProcess );
    userProcess._plannedExecuter = executer; //hack to emit error from userProcess by executer.

    if( errListener != null ){
      addErrorListener( executer, errListener);
    }

    return executer;

  }
  return f;//return function added to parent.

}


function filedExecute( file, rootPlan, filedExecuter){
  rootPlan.executePlan(file, filedExecuter);
}

function io( filePath, userProcess, jb, nextPlan){
  process(
    filePath,
    userProcess,
    jb,
    nextPlan,
    saveAfterApply,
    function(){
      //file to read does not exists.
      //create file with initial value and process json.
      fs.open(
        filePath,
        'w+',
        (err,fd) => {

          if(err) {
            raiseError( userProcess._plannedExecuter, 'IOError Failed to create file.') ;
          } else {
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
                          else afterCloseProcess();
                        }
                      );
                    },
                    jb,
                    filePath,
                    saveAfterApply,
                    nextPlan
                  );
              },
              jb
            );
          }
        }
      );
    }
  );

}

function link( filePath, userProcess, jb, nextPlan ){
  process(filePath, userProcess, jb, nextPlan, fsLink,
    raiseUnknownErrorFunction( userProcess._plannedExecuter ) // link does not create new file when not existed
  );
}

function copy( filePath, userProcess, jb, nextPlan ){
  process(filePath, userProcess, jb, nextPlan, fsCopy,
    raiseUnknownErrorFunction( userProcess._plannedExecuter ) //copy does not create new file when not existed
  );
}

function pass( filePath, userProcess, jb, nextPlan ){
  process(filePath, userProcess, jb, nextPlan, passPostProcess,
    raiseUnknownErrorFunction( userProcess._plannedExecuter ) //pass dows not create new file when not existed
  );
}

function filter( filePath, userProcess, jb, nextPlan ){
  process(
    filePath,
    filternize(userProcess),
    jb,
    nextPlan,
    filterPostProcess,
    raiseUnknownErrorFunction( userProcess._plannedExecuter) //filter does not create new file when not existed
  );
}

function calledback( filePath, userProcess, jb, nextPlan ){
  process(
    filePath,
    userProcess,
    jb,
    nextPlan ,
    function(){}, // no post process for calledback
    raiseUnknownErrorFunction( userProcess._plannedExecuter ) //calledback does not create new file when not existed
  );
}

function process(
  filePath,
  userProcess,
  jb,
  nextPlan,
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

            if (err) {
              raiseError( userProcess._plannedExecuter, 'IOError Failed to read file.',err);
              fs.close(fd,function (err) {
                if(err) raiseError( userProcess._plannedExecuter, 'IOError Failed to close file in a error handling.',err);
              });

            }else{
              fs.close(
                fd,
                function(err){
                  if(err) {
                    raiseError( userProcess._plannedExecuter, 'IOError Failed to close file',err);
                  }else{
                    apply(
                      userProcess,
                      decode( data, jb),
                      filePath,
                      function( afterCloseProcess ){ afterCloseProcess() }, // closed already and no need to close, but need to call chained process
                      jb,
                      filePath,
                      jfProcess,
                      nextPlan
                      );
                  }
                }
              );
            }
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


function guardProcess( userProcess, isCalledback){

  let guarded =
    wrapUserProcess(
      userProcess,
      function( userProcess ){
        return function(){
          try{
            if( isCalledback ) {
              return userProcess(
                arguments[0],
                arguments[1],
                arguments[2],
                arguments[3] );////json, filePath, callbackFunction, errListener
            } else {
              return userProcess(
                arguments[0],
                arguments[1],
                arguments[2] ); //json, filePath, errListener
            }
          }catch(err){
            //walkaround for unclear this/caller problem in javascript.
            //I just wanted to use something like "this".
            raiseError(
              userProcess._plannedExecuter.listenerCount('error') > 0 ?
              userProcess._plannedExecuter :
              defaultEmitter ,
              'User process error',
              err
            );

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
//
//"closeFile" is prepared for caller handle close implementation. In some cases,
//caller does not open fd and no need to close file.
function apply( process, json, file, closeFile, jb, filePath, postProcess, nextPlan ){
  if( process._plannedExecuter instanceof calledbackExecuter ){
    applyCalledbackProcess( process, json, file, closeFile, jb, filePath, nextPlan );//no post process for called back.

  }else{
    applyProcess( process, json, file, closeFile, jb, filePath, postProcess, nextPlan );

  }

}

function applyCalledbackProcess( process, json, file, closeFile, jb, filePath, nextPlan ){

  let guardedProcess = guardProcess( process, true);

  guardedProcess(
    json,
    filePath,
    function( data ){//callback function passed to userProcess
      if( data ){
        //when callback is called
        //here is executed after latter save.
        save(
          data,
          filePath ,
          function(){
            // no need to close filePath
            nextPlan._executeFunction( filePath );
          },
          jb,
          executer);

      } else {
        nextPlan._executeFunction( filePath );
      }
    },
    guardedProcess._plannedExecuter
  );

}

//apply process function to json.
function applyProcess( process, json, file, closeFile, jb, filePath, postProcess, nextPlan){

  let guardedProcess = guardProcess( process, false);

  var result = guardedProcess(json, filePath, guardedProcess._plannedExecuter);

  if(result != undefined && result != null){
    //if result returned, executePostProcess
    postProcess(
      result,
      file,
      closeFile, //executed after saved.
      jb,
      filePath,
      nextPlan,
      guardedProcess._plannedExecuter
    );

  }else{
    closeFile( function(){ nextPlan._executeFunction( filePath )} );
  }

}

//file can be either of file path and descriptor

function save( data, file, closeFile, jb, executer){
  saveCore( data, file, closeFile, jb, null, null, executer);
}

function saveAfterApply( data, file, closeFile, jb, filePath, nextPlan, executer){
  saveCore(data,file,closeFile,jb,filePath,nextPlan,executer);
}

function saveCore(  data,
                    file,
                    closeFile, //how to close file differs between caller.
                    jb,
                    filePath, nextPlan, //only passsed in saveAfterApplly
                    executer
                  ){
  try{

    fs.writeFile(
      file,
      encode(data,jb),
      encoding(jb),
      (err)=>{
        if (err) {
          raiseError( executer, 'IOError failed to save json');
          closeFile( function() {} );  //no afterCloseProcess

        }else{
          closeFile(
            function() {
              if( nextPlan ) nextPlan._executeFunction(filePath);
            }
          );//file is closed in afterSaved, if needed.
        }
      }
    );
  }catch(error){
    closeFile( function() {} );
    raiseError( executer, "failed in save", error);
  }
}

function fsCopy( copied2Path, file, closeFile, jb, originalFilePath, nextPlan, executer ){ //"fs" is to avoid name conflict.

  let itr = pathIterator( copied2Path );
  for(let newFilePath of itr ){
    fsPipe(
      originalFilePath,
      newFilePath,
      function(err){
        if(err) raiseError( executer, "Failed to copy from " + originalFilePath + " to " + newFilePath,err);
        else {
          if( nextPlan ) nextPlan._executeFunction( newFilePath );
        }
      }
    );
  }
}

function fsPipe( fromPath, toPath, callback){

  let readStream = fs.createReadStream(fromPath);
  let writeStream = fs.createWriteStream(toPath,{flags: 'wx'}); //to escape copy between same files.

  //readStream.on('end',()=>{} ); // rely on end feature
  writeStream.on('finish',() => { callback( false );} );

  readStream.on('error',(err) => { callback(err) } );
  writeStream.on('error',(err) => { callback(err) } );

  readStream.pipe(writeStream);

}

function fsLink( linkPath, file, closeFile, jb, originalFilePath, nextPlan, executer){ //"fs" is to avoid name conflict.

  //link runs only after file was closed. closeFile is passed as compatibility of postProcess interface
  //closeFile();
  let itr = pathIterator( linkPath );
  for(let newFilePath of itr ){
    fs.link(
      originalFilePath,
      newFilePath,
      function(err){
        if(err) raiseError( executer, "Failed to link from " + originalFilePath + " to " + newFilePath,err);
        else {
          if( nextPlan ) nextPlan._executeFunction( newFilePath );
        }
      }
    );
  }
}

function passPostProcess( result, file, closeFile, jb, originalFilePath, nextPlan ){
  if( nextPlan ) nextPlan._executeFunction( originalFilePath );
}

function filterPostProcess( result, file, closeFile, jb, originalFilePath, nextPlan ){
  if( result && nextPlan ) nextPlan._executeFunction( originalFilePath );
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
        evalFunctions: true,
        cacheFunctions: true
      }//experimental
    );
  }
  else if ( jb == JB_JSON ) return JSON.parse(obj);
  else raiseError( null, 'decode: jb must be JSON or BSON');
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
  else raiseError( null, 'encode: jb must be JSON or BSON');
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
  if( emitter == null || emitter == undefined){
    emitter = defaultEmitter;
  }
  emitter.emit( 'error', new JsonFiledError( msg, innerError));
}

function raiseUnknownErrorFunction(emitter){
  return function(){
    raiseError( emitter, "Unknown error.", null);
  }
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

defaultEmitter.on( 'error', defaultErrorListener);

jf.defaultEmitter = defaultEmitter;

jf.JsonFiledError = JsonFiledError;

module.exports = jf;
