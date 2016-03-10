# search repositories Example
````
'use strict';
var jf = require('json.filed');

jf.download(
  {
    method: "GET",
    uri: 'https://api.github.com/search/repositories?q=node.js+json+file',
    headers: {
      'User-Agent': 'json.filed'
    }
  },
  './search_result.json' ,
  ( err ) => { console.log(err) } )
.pass(
  ( result ) => {
    for( let item of result.items ){
      jf
      .filed( './' + item.id + '_' + item.name + '.json')
      .write( item )
      .exec();
    }
  }
).exec();
````
Above script downloads JSON of search result from github to `search_result.json`.
And next, write item in the result to `<id>_<name>.json` file.

The script has structure of nested chain of executers.

## Chain 1
 ```
jf.download( ... )
.pass( ... ).exec();
 ```
Chain 1 consists from download and pass executer.<br/>
download executer downloads JSON of search result to file and <br/>
pass executer just passes itself and invoke chain2 to work inside `for` loop.


## Chain 2
````
... jf
    .filed( ...)
    .write( ... )
    .exec(); ...
````
Inner Chain 2 consists from filed and write executer.<br/>
Here filed executer specifies file path for item.<br/>
write executer write item JSON to file.

## exec ...?
You see `.exec()` in both executer chains.<br/>
Execution of chain started after `.exec()` function is called.<br/>
Without `.exec()`, chain of executers is just construted, and not executed yet.<br/>
So please do not forget to call `.exec()`.😉

[More examples ...](./examples.md)<br/>
[Reference ...](/reference.md)
