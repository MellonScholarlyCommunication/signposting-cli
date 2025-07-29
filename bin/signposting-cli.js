#!/usr/bin/env node
const { program } = require('commander');
const { signpostingInfo , linkSetInfo } = require('../lib/signposting.js');

program
  .name('signposting-cli')
  .description('CLI to FAIR Signposting')

program.command('signposting')
  .argument('<url>', 'url to fetch')
  .action( async (url) => {
     const info = await signpostingInfo(url,{});
     console.log(JSON.stringify(info,null,2));
  });

program.command('linkset') 
  .argument('<url>', 'url to fetch')
  .action( async (url) => {
     const info = await linkSetInfo(url,{});
     console.log(JSON.stringify(info,null,2));
  });

program.parse();