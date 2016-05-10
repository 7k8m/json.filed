#!/usr/bin/env node
/*
Copyright (c) 2016, Tomohito Nakayama. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

'use strict';

const jf = require('./index.js')
const repl = require('repl');

const replServer = repl.start('> ');

replServer.context.jf = jf;

replServer.on('reset', (context) => {
  context.jf = jf;
});
