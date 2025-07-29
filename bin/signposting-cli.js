#!/usr/bin/env node
const { program } = require('commander');
const { signpostingInfo } = require('../lib/signposting.js');

program
  .name('signposting-cli')
  .description('CLI to FAIR Signposting')
  .argument('<url>', 'url to fetch')
  .action( async (url) => {
     const info = await signpostingInfo(url,{});
     console.log(JSON.stringify(info,null,2));
  });

program.parse();