# How json.filed process in deferred manner
json.filed is a library for deferred processing JSON file. 
Meaning reading and writing file is **neither** executed immediately when read and write function is called **nor** executing thread is blocked until read and write is done.

Explain how process is deferred, see next example code.

    var jf = require('json.filed');

    jf.filed('./data.json')
    .write( { msg: 'hello world.'} )
    .read( json => { console.log( json.msg ) } )
    .exec();

In the code above, filed function, write function and read functions are called.
In json.filed, those functions corresponds to *executer* and call to function constructs correspoinding executer.
Function of executer can be called in chain as above and constructed executers are chained by the same order as functions are called.
In the above code, filed executer, write executer and read executer are chained by this order as result.

Constructing chain of executer does not start processing immediately.
Call of exec function at the tail of the executer starts processing.

    .exec()
Call exec() function start process from root of executer to the tail execcuter where .exec was called in the chain.
In the above code, filed executer, write executer and read executer, in this order.
Actual processes of executers run in deferred and exec() function itself finishes before process of executers are finished.  

Now, explain for each of executers.

    filed('./data.json')
First executer `filed` is a executer to specify file to process by file path.
Chained executer after filed process to/from file specified by filed executer.


    .write( { msg: 'hello world.'} )
Second executer `write` is a executer to write JSON object to JSON file.
In fact, this code is using a syntactic sugar. To make it clear what is under the hood, remove sugar from and code is as next.

    .out( function() { return { msg: 'hello world' }; } )
`write` is a syntactic sugar of `out`. out executer outputs value to the file. <br/>
out executer takes a function as a parameter and the function determines what value is outputted to the file as return value.


    .read( json => { console.log( json.msg ) } )    
Third executer `read` is a executer to read JSON object from JSON file.
In a fundamental form  of javascript, above code is written as next without syntactic sugar.

    .in( function( json ) { console.log( json.msg ) } )
As same as write executer, `read` is a syntactic sugar of `in`. in executer inputs value from the file<br/>
in executer takes a function as a paramter and the function determines what program does receiving inputted value from JSON file.


As seen above, executers takes user processing as parameters of **functions**. This enables user process can be executed in deferred manner from callback functions of read/write functions of the fs module which are called inside json.filed.<br/>
And another important point is that executers are **chained**.<br/>
Though chain of executers as whole is exeuted in deffered, each executers are executed sequentially by the order of executer in the chain. This make it possible to program read after write like as above code.
