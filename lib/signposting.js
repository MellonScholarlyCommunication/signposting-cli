const fetch = require('node-fetch');
const { backOff } = require('exponential-backoff');
const LinkHeader = require('http-link-header');
const jsdom = require('jsdom');

const SIGNPOSTING_TYPED_LINKS = [
    'author' , 'cite-as' , 'describedby' , 'describes' ,
    'type' , 'license' , 'item' , 'collection' 
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
           
            if (SIGNPOSTING_TYPED_LINKS.includes(rel)) {
                let rec = {};
                if (rel) { rec['rel'] = rel }
                if (type) { rec['type'] = type }
                if (href) { rec['uri'] = href }
                result.push(rec);
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

module.exports = { signpostingInfo };