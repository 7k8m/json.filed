# json.filed
Framework for processing JSON file

## Core concept
JSON file as variable in program which runs on node.js

## Use case
+ what
    + read, write and process JSON files
    + share JSON files between nodes
    + collect contents of multiple JSON files into a JSON file.
    + and so on.
+ when
    + Applications need to store data, but DBMS is not the case.
    + Server handling JSON
    + IoT device writes and reads JSON
    + Scripts handling JSON files on a node
    + Handle JSON from several sources
        + JSON from file
        + JSON from url
        + JSON from listened event
    + and so on.


# hello world
    var jf = require('json.filed');

    jf.filed('./data.json')
    .write( { msg: 'hello world.'} )
    .read( json => { console.log( json.msg ) } )
    .exec();
[how to use ...](./document/how2use.md)

# REPL
Supports REPL feature.
````
$ sudo npm install -g json.filed
$ json.filed
> hello = jf.filed('./hello.json')
filedExecuter {
  parent: null,
  io: [Function],
  read: [Function],
  in: [Function],
  write: [Function],
  out: [Function],
  copy: [Function],
  link: [Function],
  pass: [Function],
  filter: [Function],
  calledback: [Function],
  httpServe: [Function],
  parallel: [Function],
  collect: [Function],
  exec: [Function],
  plan: [Function],
  file: [Function],
  _events: { error: [Function] },
  _eventsCount: 1 }
> hello.read( o => { val = o }).exec()
rootPlan {
  _nextPlan:
   executePlan {
     _nextPlan:
      notexecPlan {
        _nextPlan: null,
        next: [Function],
        exec: [Function],
        runtime: [Object] },
     next: [Function],
     exec: [Function],
     runtime:
      runtimeInformation {
        collect: [Function],
        addJsonFile: [Function],
        removeJsonFile: [Function],
        resetJsonFile: [Function],
        countInProgress: [Function] } },
  next: [Function],
  exec: [Function],
  fixedFiles: [ JsonFile { path: [Function] } ],
  runtime:
   runtimeInformation {
     collect: [Function],
     addJsonFile: [Function],
     removeJsonFile: [Function],
     resetJsonFile: [Function],
     countInProgress: [Function] } }
> val
{ msg: 'Hello World' }
````


# Deferred
Reading and writing file and so on are executed in [deferred manner](./document/HowDeferred.md) to make best use of node.js.

# Reference
See [this page](./document/reference.md)

# Examples
See [this page](./document/examples.md)

# GitHub Page
http://7k8m.github.io/json.filed/
