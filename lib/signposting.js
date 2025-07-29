const fetch = require('node-fetch');
const { backOff } = require('exponential-backoff');
const LinkHeader = require('http-link-header');
const jsdom = require('jsdom');

const SIGNPOSTING_TYPED_LINKS = [
    'author' , 'cite-as' , 'describedby' , 'describes' ,
    'type' , 'license' , 'item' , 'collection' 
];

const LINK_SET_ATTRIBUTES = [
    'uri' , 'rel' , 'type' , 'anchor'
];

async function signpostingInfo(url,opts) {
    let info = await signpostingHTMLInfo(url,opts);

    if (info) {
        return info;
    }

    info = await signpostingHeadInfo(url,opts);

    if (info) {
        return info;
    }

    return null;
}

async function signpostingHeadInfo(url,opts) {
    const response = await backOff( () => fetch(url, { 
        method: 'HEAD'
    }) , { numOfAttempts: opts['numOfAttempts'] ?? 10 });    
    
    const link = response.headers.get('link');

    if (!link) {
        return null;
    }

    const parsed = LinkHeader.parse(link);

    if (! parsed) {
        return null;
    }

    const result = [];

    parsed.refs.forEach ( item => {
        if (item['rel']) {
            if (SIGNPOSTING_TYPED_LINKS.includes(item['rel'])) {
                result.push(item);
            }
        }
    });

    if (result.length) {
        return result;
    }
    else {
        return null;
    }
}

async function signpostingHTMLInfo(url,opts) {
    const response = await backOff( () => fetch(url, { 
        method: 'GET'
    }) , { numOfAttempts: opts['numOfAttempts'] ?? 10 }); 

    if (!response.ok) {
        return null;
    }

    if (!response.headers.get('content-type').startsWith('text/html')) {
        return null;
    }

    try {
        const html = await response.text();
        const dom = new jsdom.JSDOM(html);
        const document = dom.window.document;

        const linkElements = document.querySelectorAll('link');

        const result = [];

        linkElements.forEach(link => {
            const rel  = link.getAttribute('rel');
            const type = link.getAttribute('type');
            const href = link.getAttribute('href');
           
            if (rel) {
                if (SIGNPOSTING_TYPED_LINKS.includes(rel)) {
                    const rec = {};
                    if (rel) { rec['rel'] = rel }
                    if (type) { rec['type'] = type }
                    if (href) { rec['uri'] = href }
                    result.push(rec);
                }
            }
        });

        if (result.length) {
            return result;
        }
        else {
            return null;
        }
    }
    catch (e) {
        return null;
    }
}

async function linkSetInfo(url,opts) {
    const response = await backOff( () => fetch(url, { 
        method: 'GET'
    }) , { numOfAttempts: opts['numOfAttempts'] ?? 10 }); 

    if (!response.ok) {
        return null;
    }

    const contentType = response.headers.get("content-type");

    if (contentType === 'application/linkset') {
        return parseLinkSet(await response.text());
    }
    else if (contentType === 'application/linkset+json') {
        return parseLinkSetJSON(await response.text());
    }
    else {
        return null;
    }
}

function parseLinkSet(text) {
    const cleaned = text.replaceAll(/\n/g," ")
                        .replaceAll(/\s+,\s+/g,",")
                        .replaceAll(/\s+;\s+/g," ; ");

    console.log(cleaned);

    const parsed = LinkHeader.parse(cleaned);

    if (! parsed) {
        return null;
    }

    const result = [];

    parsed.refs.forEach ( item => {
        if (item['rel']) {
            if (SIGNPOSTING_TYPED_LINKS.includes(item['rel'])) {
                item = Object.fromEntries(
                        Object.entries(item).filter(([key]) => LINK_SET_ATTRIBUTES.includes(key))
                );
                result.push(item);
            }
        }
    });

    if (result.length) {
        return result;
    }
    else {
        return null;
    } 
}

function parseLinkSetJSON(text) {
    const json = JSON.parse(text);

    if (! json['linkset']) {
        return null;
    }

    const result = [];

    for (let i = 0 ; i < json['linkset'].length ; i++) {
        const item = json['linkset'][i];

        if (! ("anchor" in item))  {
            continue;
        }

        const anchor = item['anchor'];

        if (!anchor) {
            continue;
        }

        for (let j = 0 ; j < SIGNPOSTING_TYPED_LINKS.length ; j++) {
            const key = SIGNPOSTING_TYPED_LINKS[j];

            if (key in item) {
                const values = item[key];

                if (!Array.isArray(values)) {
                    continue;
                }
                
                for (let k = 0 ; k < values.length ; k++) {
                    const link = values[k];
                    link['anchor'] = anchor;
                    link['rel'] = key;
                    result.push(link);
                }
            }
        }
    }

    if (result.length) {
        return result;
    }
    else {
        return null;
    } 
}

module.exports = { signpostingInfo , linkSetInfo };