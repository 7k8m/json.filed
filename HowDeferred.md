# How json.filed process in deferred manner
json.filed is a library for deferred processing of JSON file.
This mean read and write file is *neither* executed immediately when read and write function is called *nor* executing thread is blocked until read and write is done.

Explain how process is done deferred on next program.

    var jf = require('json.filed');

    jf.filed('./data.json')
    .write( { msg: 'hello world.'} )
    .read( json => { console.log( json.msg ) } )
    .exec();

In the code above, filed, write function and read functions are called.
In json.filed, those functions are corresponding to *executer* and call to function constructs correspoinding executer.
Function of executer can be called in chain as above and executers are chained in the same order as functions are called.
In the above code, filed executer, write executer and read executer are chained in this order.

Constructing chain of executer does not start processing immediately.
Call of exec function at the tail of the executer starts processing.

    .exec()
Call exec() function start process from root of executer to tail of execcuter in chain.
In the above code, filed executer, write executer and read executer, in this order.
Those processes are executed in deferred and exec() function itself finishes before process of executers are finished.  

Now, explain for each of executers.

    filed('./data.json')
First executer `filed` is a executer to specify file to process by file path.
Chained executer after filed process to/from file specified by filed executer.


    .write( { msg: 'hello world.'} )
Second executer `write` is a executer to write JSON object to JSON file.
In fact, this code is using a syntactic sugar and without sugar code like as next.

    .write( function() { return { msg: 'hello world' }; } )
The write executer takes a function as a parameter and the function determines what value is written to the file as return value.

    .read( json => { console.log( json.msg ) } )    
Third executer `read` is a executer to read JSON object from JSON file.
In a fundamental form  of javascript, above code is written as next.

    .read( function( json ) { console.log( json.msg ) } )
As same as write executer, read executer takes a function as a paramter and the function determines what program do receiving read value from JSON file.


As seen above, executers takes user processing as parameters of functions.This enables user processing throughout read/write file processing can be executed in deferred manner from callback of read/write file.
And another important point is that executers are chained.<br/>
Though chain of executers as whole is exeuted in deffered, each executers are executed in the sequence by the order of executer in chain. This make it possible to program read after write as above code.
