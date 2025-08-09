#!/usr/bin/env node
const { program } = require('commander');
const { signpostingInfo , linkSetInfo } = require('../lib/signposting.js');

program
  .name('signposting-cli')
  .description('CLI to FAIR Signposting')

program.command('signposting')
  .argument('<url>', 'url to fetch')
  .argument('[<rel>]', 'relation')
  .action( async (url,rel) => {
     const info = await signpostingInfo(url);

     if (!info) {
         console.log(JSON.stringify(null,null,2));
     }
     else if (rel) {
        console.log(JSON.stringify(info.get(rel),null,2));
     }
     else {
        console.log(JSON.stringify(info.links(),null,2));
     }
  });

program.command('linkset') 
  .option('-a, --anchor <anchor>', 'anchor to filter')
  .argument('<url>', 'url to fetch')
  .argument('[<rel>]', 'relation')
  .action( async (url,rel,opts) => {
     const info = await linkSetInfo(url);

     if (!info) {
         console.log(JSON.stringify(null,null,2));
     }
     else if (rel) {
        console.log(JSON.stringify(info.get(rel,opts.anchor),null,2));
     }
     else {
        console.log(JSON.stringify(info.links(opts.anchor),null,2));
     }
  });

program.parse();