/*
Copyright (c) 2016, Tomohito Nakayama. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

'use strict';

const fs = require('fs');
const initialValue = {};

module.exports = {};

module.exports.initialValue =
  function() { return initialValue; };

module.exports.filed =
  function( filePath, processOfFiledJson){

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
            'utf8',
            (err, data) => {
              fs.close(fd);
              if (err) throw new JsonFiledError('IOError Failed to read file.');

              apply(
                processOfFiledJson,
                JSON.parse( data ),
                filePath,
                function(){} // no need to close filePath
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
                    }
                  );
                }
              );

            }
          );
        }
      }
    )
  };


//apply process function to json.
function apply( process, json, file, afterApply){

  var result = process(json);

  if(result != undefined && result != null){
    //if result returned, upate json file to result.
    save(
      result,
      file,
      afterApply //executed after saved.
    );

  }else{
    afterApply();

  }

}

//file can be either of file path and descriptor
function save( data, file, afterSaved){
  fs.writeFile(
    file,
    JSON.stringify(data),
    'utf8',
    (err)=>{
      if (err) throw new JsonFiledError('IOError failed to save json');
      afterSaved();//file is closed in afterSaved, if needed.
    }
  );
}

function JsonFiledError(msg){
  this.msg = msg;
};

module.exports.JsonFiledError = JsonFiledError;
