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

**Get all links for a signpost**

```
sInfo.links()

> [
  {
    "rel": "cite-as",
    "uri": "https://doi.org/10.5061/dryad.5d23"
  },
  {
    "rel": "type",
    "uri": "https://schema.org/ScholarlyArticle"
  },
  ...
]
```

**Get only cite-as signpost links**

```
sInfo.get('cite-as')

> [
  {
    "rel": "cite-as",
    "uri": "https://doi.org/10.5061/dryad.5d23"
  }
]
```

**Get all links for a link set**

```
lInfo.links()

> [
  {
    "uri": "https://doi.org/10.5061/dryad.5d23f",
    "rel": "cite-as",
    "anchor": "https://example.org/page/7507"
  },
  {
    "uri": "https://schema.org/ScholarlyArticle",
    "rel": "type",
    "anchor": "https://example.org/page/7507"
  },
  ...
]
```

**Get only cite-as links for a link set**

```
lInfo.get('cite-as')

> [
  {
    "uri": "https://doi.org/10.5061/dryad.5d23f",
    "rel": "cite-as",
    "anchor": "https://example.org/page/7507"
  }
]
```

**Get only link for a particular anchor from the link set**

```
lInfo.link('http://somewhere.org')
```

**Get only collection links for a particulr anchor form the link set**

```
lInfo.get('collection','http://somewhere.org')
```

## Development

**Run a demo website with signposts and link sets**

```
npm run server
```

Connect to http://localhost:8000 to view the artifacts

**Fetch and parse the signposts**

```
./bin/signposting-cli.js signposting http://localhost:8000/article1.html
```

**Fetch and parse the signposts and filter the 'type' property**

```
./bin/signposting-cli.js signposting http://localhost:8000/article1.html type
```

**Fetch and parse a linkset**

```
/bin/signposting-cli.js linkset http://localhost:8000/lset.txt
```

**Fetch and parse a linkset and filter the 'type' property**

```
/bin/signposting-cli.js linkset http://localhost:8000/lset.txt type
```

**Fetch and parse a linkset  for the anchor 'https://gitmodo.io/johnd/ct.zip' and filter the 'type' property**

```
/bin/signposting-cli.js linkset -a https://gitmodo.io/johnd/ct.zip http://localhost:8000/lset.txt type
```