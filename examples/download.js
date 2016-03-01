'use strict';

var jf = require('json.filed');

jf.download(
  {
    method: "GET",
    uri: 'https://api.github.com/repos/7k8m/json.filed/commits/076aff7302cae3046955de13af41b1be90f41f03',
    headers: {
      'User-Agent': 'json.filed'
    }
  },
  './firstcommit.json' )
.pass(
  ( obj ) => {
    console.log(obj.commit.message);
  }
).exec();
