/*
Copyright (c) 2016, Tomohito Nakayama. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

'use strict';

const fs = require('fs');
const path = require('path');

const http = require('http');
const URL = require('url');

const request = require('request');

const bson = require('bson');
const BSON = new bson.BSONPure.BSON();

const EventEmitter = require('events');
const util = require('util');

const initialValue = {};

const JB_JSON = 'j';
const JB_BSON = 'b';

let jf = {};

var httpServerObj = null;
const servedJsonPathMap = new Map();

jf.initialValue =
  function() { return initialValue; };

jf.filed =
  function (file, errListener) {
     return addErrorListener( new filedExecuter (file), errListener );
   }

jf.newFile =
 function (file, errListener) {
    return addErrorListener( new newFileExecuter (file), errListener );
  }

jf.download =
 function (url, file, errListener) {
    return addErrorListener( new downloadExecuter (url, file), errListener );
  }

function executer( parent ){

 this.parent = parent;

 this.io = addChildExecuterFunction(createExecuterFactory(ioExecuter, this ));
 this.in = this.read =
  addChildExecuterFunction(createExecuterFactory(inExecuter, this ));
 this.out = this.write =
  addChildExecuterFunction(createExecuterFactory(outExecuter, this ));
 this.copy = addChildExecuterFunction(createExecuterFactory(copyExecuter, this ));
 this.link = addChildExecuterFunction(createExecuterFactory(linkExecuter, this ));
 this.pass = addChildExecuterFunction(createExecuterFactory(passExecuter, this ));
 this.filter = addChildExecuterFunction(createExecuterFactory(filterExecuter, this ));
 this.calledback = addChildExecuterFunction(createExecuterFactory(calledbackExecuter, this ));
 this.httpServe = addChildExecuterFunction(createExecuterFactory(httpServeExecuter, this ));
 this.parallel = addParallelExecuterFunction( this );

 this.exec = function(){

   let runtime = new runtimeInformation();

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
     plan.runtime = runtime;
     plan._nextPlan = createPlan( executor );
     plan = plan._nextPlan;
     executor = executorStack.pop();
   };

   plan.runtime = runtime;
   plan._nextPlan = new notexecPlan();
   plan._nextPlan.runtime = runtime;

   root.rootExec( rootPlan );

  };

}


function executePlan( executeFunction ){

  this._executeFunction = executeFunction;

  this._nextPlan = null;

  this.next =
    function(){
      return this._nextPlan;
    }

}

function runtimeInformation(){
  this.jsonFilesInProcess = new Map();
  this.addJsonFile =
    function( jsonFile ){
      this.jsonFilesInProcess.set(jsonFile, {} );
    }

  this.removeJsonFile =
    function ( jsonFile ){
      this.jsonFilesInProcess.delete( jsonFile );
    }

}


function notexecPlan() {
  executePlan.call(
    this,
    function( jsonFile ){
      this.runtime.removeJsonFile( jsonFile );
    }
  );
}

function filedExecuter( file ){

  executer.call( this, null );

  let thisExecuter = this;

  this.rootExec =
    function(executePlan){
      executePlan._executeFunction( file )
    };

  this.file = () => file;

};


function newFileExecuter( file ){
  filedExecuter.call( this, file );
};

function downloadExecuter( url, file ){

  executer.call( this, null );
  let thisExecuter = this;
  this.rootExec =
    function( executePlan ){
      executePlan._executeFunction( url, file )
    };

  this.url = () => url;
  this.file = () => file;

};


function childExecuter( userProcess, parent ){

  executer.call( this, parent );

  this.generalInternalExec = function ( filePath, jb , executerFunction, executerPlan ) {

    executerFunction (
      filePath,
      userProcess,
      jb,
      executerPlan.next()
    );
  }
}


function createPlan( executer ){

  if( executer instanceof newFileExecuter ) return createNewFilePlan( executer );
  else if( executer instanceof filedExecuter ) return createFiledPlan( executer );
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
  return createFilePlanCore(
    ( filePath, plan ) => plan.next()._executeFunction( filePath ),
    executer
  );
}


function createNewFilePlan( executer ){
  return createFilePlanCore(
    function( jsonFile, plan ){
      fs.writeFile(
        jsonFile.path(),
        encode( initialValue, calcJb( jsonFile ) ),
        { flag: 'wx' },
        function( err ){
          if( err ) raiseError( executer, 'Failed to create new File.', err );
          else plan.next()._executeFunction( jsonFile );
        }
      );
    },
    executer
  );
}

function createFilePlanCore( executeForFileFunction, executer ){
  return new executePlan(
    function( file ){
      if( file != null ) {
        let itr = pathIterator( file, executer );
        for( let jsonFile of itr ){
          this.runtime.addJsonFile( jsonFile );
          executeForFileFunction( jsonFile, this );
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
      .calledback(
        function( file, object, callback ){
        request(
          url,
            function (error, response, body ) {
            if (!error &&
                response.statusCode == 200 &&
                response.headers['content-type'].startsWith('application/json')) {

                callback(decode(body,JB_JSON));

            }else{
                executer.emit('error', error);
            }
          });
        }
      )
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
      return multiplePath( file );

    } else if ( typeof file == 'function' ){
      return pathIterator( file(), filedExecuter );

    } else {
      throw new Error();
    }
  } catch ( error ) {
    raiseError( filedExecuter, 'Failed to create path Iterator' );
  }

  return [];

}

function * singlePath( file ){
  yield new JsonFile(file);
}

function multiplePath( file ){
  let originalIterator =
    file[Symbol.iterator]();
  let itr = {};
  itr[Symbol.iterator] =
    function(){
      return {
          next: function(){
            let result = originalIterator.next();
            return {
                done: result.done,
                value: new JsonFile( result.value )
            }
          }
      }
    }
  return itr;
}

// Historycally JsonFile was developed substitugin filePath of plain String.
// So in several parts, JsonFile object is handled in variable named xxxxPath.
function JsonFile( filePath ){
  this.path = function(){
    return filePath;
  }
}

function ioExecuter( userProcess, parent) {
  childExecuter.call( this, userProcess, parent );

  this.internalExec = function(filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, io, executionPlan );
  }

};


function inExecuter( userProcess, parent) {
  childExecuter.call( this, userProcess, parent );

  this.internalExec = function(filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, input, executionPlan );
  }

};


function outExecuter( userProcess, parent) {
  childExecuter.call( this, userProcess, parent );

  this.internalExec = function(filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, output, executionPlan );
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

function httpServeExecuter( userProcess, parent ) {
  childExecuter.call( this, userProcess, parent);

  this.internalExec = function( filePath, jb, executionPlan ){
    this.generalInternalExec( filePath, jb, httpServe, executionPlan );
  }

};

function parallelExecuter( userProcess, parent ) {
  calledbackExecuter.call( this, userProcess, parent);
}



util.inherits( executer, EventEmitter);

util.inherits( filedExecuter, executer);
util.inherits( newFileExecuter, filedExecuter);

util.inherits( downloadExecuter, executer);

util.inherits( childExecuter, executer);

util.inherits( ioExecuter, childExecuter);
util.inherits( inExecuter, childExecuter);
util.inherits( outExecuter, childExecuter);
util.inherits( copyExecuter, childExecuter);
util.inherits( linkExecuter, childExecuter);
util.inherits( passExecuter, childExecuter);
util.inherits( filterExecuter, childExecuter);
util.inherits( calledbackExecuter, childExecuter);
util.inherits( httpServeExecuter, childExecuter);

util.inherits( parallelExecuter, calledbackExecuter);

function createExecuterFactory( classFunction, parent ){
  return function(userProcess){ return new classFunction( userProcess, parent ) };
}

function addChildExecuterFunction( executerFactory ){

  var f = function( userProcess, errListener ){ //function to create child executer.

    userProcess = sugarnize( userProcess );

    let executer = executerFactory( userProcess );
    userProcess._plannedExecuter = executer; //hack to emit error from userProcess by executer.

    if( errListener != null ){
      addErrorListener( executer, errListener);
    }

    return executer;

  }

  return f;//return function added to parent.

}

function addParallelExecuterFunction( parent ){

  let parallelExecuterFunction =
    addChildExecuterFunction( createExecuterFactory( parallelExecuter, parent) );

  let f = function() { //executers1,executers2....,errListener

      if(arguments.length == 0)
        return parallelExecuterFunction(function(){});

      let paralleledExecuters =
        arguments[0][Symbol.iterator] ?
        arguments[0] :
          arguments.length == 1 ?
          arguments:
          Array.from( arguments ).slice( 0, arguments.length - 1);

      let tailArgument =
        arguments.length > 1 ? arguments[ arguments.length - 1 ] :
        null;

      // executer is not listener.
      let errListener =
        tailArgument instanceof executer ? null :tailArgument ;

      // executer is one of paralleled executers to be executed.
      if(errListener == null && tailArgument != null) {
        paralleledExecuters.push( tailArgument );
      }

      return parallelExecuterFunction(
        // paralleled sugarnize executers to one function and callback here
        function( json, filePath, callback, executer ) {
            if( errListener ) executer.addListener( 'error' , errListener );

            var remain = paralleledExecuters.length;
            for( let eachExecuter of paralleledExecuters ){
              eachExecuter
              .pass(
                () => {
                  remain --;
                  if(remain == 0) callback();
                },
                ( err )  => { executer.emit('error', err ) } )
              .exec();
            }

        },
        errListener);
    }

    return f;

}

function sugarnize( userArgument ) {

  if( userArgument == null ||
      userArgument == undefined ) return () => userArgument;

  switch( typeof userArgument ) {
    case 'function' :
      //To ._plannedExecuter hack working, sugarnizing function is *NEEDED+.
      return function() { return userArgument.apply( null, arguments ) };

    default:
      return () => userArgument;
  };
}


function filedExecute( file, rootPlan, filedExecuter){
  rootPlan.executePlan(file, filedExecuter);
}

function io( filePath, userProcess, jb, nextPlan ){
  ioCore(
    filePath,
    userProcess,
    jb,
    nextPlan,
    saveAfterApply);
}

function input( filePath, userProcess, jb, nextPlan ) {
  ioCore(
    filePath,
    userProcess,
    jb,
    nextPlan,
    () => { if( nextPlan ) nextPlan._executeFunction(filePath); });
}

function output( filePath, userProcess, jb, nextPlan ){
  //json argument of userProcess is fixed null in guardProcess
  ioCore(
    filePath,
    userProcess,
    jb,
    nextPlan,
    saveAfterApply);
}

function ioCore( filePath, userProcess, jb, nextPlan, afterApply){
  process(
    filePath,
    userProcess,
    jb,
    nextPlan,
    afterApply,
    function(){
      //file to read does not exists.
      //create file with initial value and process json.
      fs.open(
        filePath.path(),
        'w',
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
                    afterApply,
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
    raiseFileNotFoundErrorFunction( userProcess._plannedExecuter ) // link does not create new file when not existed
  );
}

function copy( filePath, userProcess, jb, nextPlan ){
  process(filePath, userProcess, jb, nextPlan, fsCopy,
    raiseFileNotFoundErrorFunction( userProcess._plannedExecuter ) //copy does not create new file when not existed
  );
}

function pass( filePath, userProcess, jb, nextPlan ){
  let passnized = passnize( userProcess );
  process(filePath, passnized , jb, nextPlan, passPostProcess,
    //pass does not create new file when not existed, but need to invoke applyProcess userProcess
    function(){ applyProcess( passnized, {} , filePath, function(){}, jb, filePath, passPostProcess, nextPlan );}
  );
}

function filter( filePath, userProcess, jb, nextPlan ){
  process(
    filePath,
    filternize(userProcess),
    jb,
    nextPlan,
    filterPostProcess,
    raiseFileNotFoundErrorFunction( userProcess._plannedExecuter) //filter does not create new file when not existed
  );
}

function calledback( filePath, userProcess, jb, nextPlan ){
  process(
    filePath,
    userProcess,
    jb,
    nextPlan ,
    function(){}, // no post process for calledback
    // calledback ignore creating new file, but need to invoke applycalledbacking userProcess
    function(){ applyCalledbackProcess( userProcess, {} , filePath, function(){} , jb, filePath, nextPlan );  }
  );
}

function httpServe( filePath, userProcess, jb, nextPlan ){
  process(filePath, userProcess, jb, nextPlan, httpServePostProcess,
    raiseFileNotFoundErrorFunction( userProcess._plannedExecuter)
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
    filePath.path(),
    'r',
    (err,fd) => {

      if( ! err ){
        //file exists.

        //read from file and process
        fs.readFile(
          fd,
          encoding(jb),
          (err, data) => {

            if (err) {
              raiseError( userProcess._plannedExecuter, 'IOError Failed to read file.', err);
              fs.close(fd,function (err) {
                if(err) raiseError( userProcess._plannedExecuter, 'IOError Failed to close file in a error handling.', err);
              });

            }else{
              fs.close(
                fd,
                function(err){
                  if(err) {
                    raiseError( userProcess._plannedExecuter, 'IOError Failed to close file', err);
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
        if (err.code == 'ENOENT') fileCreationProcess();
        else if(
          userProcess._plannedExecuter instanceof outExecuter &&
          err.code == 'EACCES' ) {
            //case for write executer with write permission only allowed file
              apply(
                userProcess,
                null,
                filePath,
                function(afterCloseProcess){// No need to close filePath but afterClosProcess needed.
                  afterCloseProcess();
                },
                jb,
                filePath,
                jfProcess,
                nextPlan
              );
          }
        else raiseError( userProcess._plannedExecuter, 'File open error', err);

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
        return function(obj, filePath, executer){
            if( process ( obj, filePath, executer) ) return true;
            else return false;
        };
      }
    );
  return result;

}


function passnize( userProcess ){
  // return true to pass, regardless result of user process.
  let result =
    wrapUserProcess(
      userProcess,
      function( process ){
        return function(obj, filePath, executer){
            process ( obj, filePath, executer)
            return true;
        };
      }
    );
  return result;

}

//normalize userProcess for each executer.
//parameters, exceptions to be thrown.
function normalizeProcess( userProcess, executer ){

  let normalized =
    wrapUserProcess(
      userProcess,
      function( userProcess ){
        return function(){
          try{
            if( executer instanceof calledbackExecuter ) {
              return userProcess(
                arguments[0],
                arguments[1],
                arguments[2],
                arguments[3] // json, filePath, callbackFunction, executer
              );
            } else if (executer instanceof outExecuter ){
              //json parameter of out does not exist
              return userProcess(
                arguments[1],
                arguments[2] // filePath, executer
              );

            } else {
              return userProcess(
                arguments[0],
                arguments[1],
                arguments[2] // json, filePath, executer
              );
            }
          }catch(err){
            //walkaround for unclear this/caller problem in javascript.
            //I just wanted to use something like "this".
            raiseError(
              executer.listenerCount('error') > 0 ?
              executer :
              defaultEmitter ,
              'User process error',
              err
            );

          }
        };
      }
    );

  return normalized;

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

  let normalized = normalizeProcess( process, process._plannedExecuter );

  normalized(
    json,
    filePath.path(),
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
          normalized._plannedExecuter);

      } else {
        nextPlan._executeFunction( filePath );
      }
    },
    normalized._plannedExecuter
  );

}

//apply process function to json.
function applyProcess( process, json, file, closeFile, jb, filePath, postProcess, nextPlan){
  // guard from user handed process.
  let normalized = normalizeProcess( process, process._plannedExecuter);

  var result = normalized(json, filePath.path(), normalized._plannedExecuter);

  if(result != undefined && result != null){
    //if result returned, execute PostProcess
    postProcess(
      result,
      file,
      closeFile, //executed after saved.
      jb,
      filePath,
      nextPlan,
      normalized._plannedExecuter
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
                    filePath, nextPlan, //only passsed in save after applly
                    executer
                  ){
  try{

    fs.writeFile(
      file instanceof JsonFile ? file.path() : file ,
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

function fsCopy( copied2Path, file, closeFile, jb, originalJsonFile, nextPlan, executer ){ //"fs" is to avoid name conflict.

  let itr = pathIterator( copied2Path );
  for(let newJsonFile of itr ){
    nextPlan.runtime.addJsonFile( newJsonFile );
    fsPipe(
      originalJsonFile,
      newJsonFile,
      function(err){
        if(err) raiseError( executer, "Failed to copy from " + originalJsonFile.path() + " to " + newJsonFile.path() ,err);
        else {
          if( nextPlan ) nextPlan._executeFunction( newJsonFile ) ;
        }
      }
    );
  }

  if( nextPlan ) nextPlan._executeFunction( originalJsonFile ) ;

}

function fsPipe( fromPath, toPath, callback){

  let readStream = fs.createReadStream(fromPath.path());
  let writeStream = fs.createWriteStream(toPath.path(),{flags: 'wx'}); //to escape copy between same files.

  //readStream.on('end',()=>{} ); // rely on end feature
  writeStream.on('finish',() => { callback( false );} );

  readStream.on('error',(err) => { callback(err) } );
  writeStream.on('error',(err) => { callback(err) } );

  readStream.pipe(writeStream);

}

function fsLink( linkPath, file, closeFile, jb, originalJsonFile, nextPlan, executer){ //"fs" is to avoid name conflict.

  //link runs only after file was closed. closeFile is passed as compatibility of postProcess interface
  //closeFile();
  let itr = pathIterator( linkPath );
  for(let newJsonFile of itr ){
    nextPlan.runtime.addJsonFile( newJsonFile );
    fs.link(
      originalJsonFile.path(),
      newJsonFile.path(),
      function(err){
        if(err) raiseError( executer, "Failed to link from " + originalJsonFile.path() + " to " + newJsonFile.path(),err);
        else {
          if( nextPlan ) nextPlan._executeFunction( newJsonFile );
        }
      }
    );
  }

  if( nextPlan ) nextPlan._executeFunction( originalJsonFile );

}

function passPostProcess( result, file, closeFile, jb, originalFilePath, nextPlan ){
  if( nextPlan ) nextPlan._executeFunction( originalFilePath );
}

function filterPostProcess( result, file, closeFile, jb, originalJsonFile , nextPlan ){
  if( ! result ) nextPlan.runtime.removeJsonFile( originalJsonFile);
  if( result && nextPlan ) nextPlan._executeFunction( originalJsonFile );
}

function httpServePostProcess( urlPathName, file, closeFile, jb, originalJsonFile, nextPlan ){
  httpServeJson( urlPathName, originalJsonFile );
  if( nextPlan ) nextPlan._executeFunction( originalJsonFile );
}

function httpServeJson( urlPathName, localJsonFile ){
  servedJsonPathMap.set(urlPathName, localJsonFile.path() );
}

jf.httpServer = function(){

  if( httpServerObj != null ) return httpServerObj;

  httpServerObj = http.createServer( (request, response) => {
    let urlpathname = URL.parse(request.url).pathname;
    if( servedJsonPathMap.has( urlpathname ) ) {
      response.writeHead(200, {'Content-Type': 'application/json'});

      jf.filed( servedJsonPathMap.get( urlpathname ) )
      .pass(
        function( json ){
          response.end( JSON.stringify( json ) );
        }
      )
      .exec();

    }else{
      response.writeHead(404);
      response.end();
    }
  });

  return httpServerObj;

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

  switch( path.extname( filePath.path() ).toLowerCase() ){

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

function raiseFileNotFoundErrorFunction(emitter){
  return function(){
    raiseError( emitter, "File not found error.", null);
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
