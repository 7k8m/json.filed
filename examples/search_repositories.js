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
