# Signposting Client

Parse FAIR Signposting headers according to [https://signposting.org/FAIR/](https://signposting.org/FAIR/).

## Install via NPM

```
$ npm install signposting-cli
```

## Usage

```
const { signpostingInfo , linkSetInfo } = require('signposting-cli');

let sInfo = await signpostingInfo(url);
let lInfo = await linkSetInfo(url);
```