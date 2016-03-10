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
Above script downloads JSON of search result from github to `search_result.json`.<br/>
And next, write item in the result to `<id>_<name>.json` file.<br/>

Result of script is shown as next.
````
$ node search_repositories.js 
$ ls *.json
12029945_stream-json.json
12604449_node-jsondir.json
13601258_node-json-file.json
16096720_node-xls-json.json
1831382_ministore.json
20915670_node-comment-json.json
21762296_node-json-db.json
26674028_local-json.json
26928518_npm-license-crawler.json
27892419_firebase-streaming-import.json
3252428_What-is-the-package.json-file.json
          <snip>
9364014_three-obj.json
976241_node_spreadsheet.json
search_result.json
````

## Comments

The script has structure of nested chain of executers.

### Chain 1
 ```
jf.download( ... )
.pass( ... ).exec();
 ```
Chain 1 consists from download and pass executer.<br/>
download executer downloads JSON and <br/>
pass executer just passes and do nothing special itself <br/>
and invoke chain2 inside `for` loop.


### Chain 2
````
... jf
    .filed( ...)
    .write( ... )
    .exec(); ...
````
Inner Chain 2 consists from filed and write executer.<br/>
Here filed executer specifies file path for each item.<br/>
write executer write JSON of each item to the file.

### exec ...?
You see `.exec()` in both executer chains.<br/>
Execution of chain started after `.exec()` function is called.<br/>
Without `.exec()`, chain of executers is just construted and not executed.<br/>
So please do not forget to call `.exec()`.😉

[More examples ...](./examples.md)<br/>
[Reference ...](/reference.md)
