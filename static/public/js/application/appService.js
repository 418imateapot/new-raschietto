import Statistica from './Statistica.js';
import Dlib from './Dlib.js';

export default function appService() {

    var service = this;

    const DLIB_ORIGINAL_PREFIX = /.*\/tr\/td\[2\]/;
    const DLIB_RASCHIETTO_PREFIX = '//*[@id="document-view"]/span';

    const STAT_ORIGINAL_PREFIX = /\/html\/body\/div[\[\d\]]?\/div[\[\d\]]?\/div[\[\d\]]?\/div[\[\d\]]?/;
    /* Molti articoli di statistica sono salvati con questo xpath che non
     * restituisce nulla...         */
    const STAT_WRONG_PREFIX = '/html/body/div/div[2]/div[2]/div[3]';
    const STAT_RASCHIETTO_PREFIX = '//*[@id="document-view"]/span/div';


    /**
     * Restituisce un elemento del DOM corrispondente
     * all'annotazione (si spera).
     * @param {string} fragment Il selettore
     * @param {string} type Il tipo di annotazione
     * @param {string} source La rivista di provenienza
     * @param {string} provenance Il gruppo che ha fatto l'annotazione
     */
    service.getSelector = function(fragment, type, source, provenance) {
        let xpath = isFragment(fragment) ? fragment_to_xpath(fragment) : fragment;

        // A seconda dell'origine del documento, la
        // procedura per tradurre l'xpath originale
        // in uno raschiettoso varia
        switch (source) {
            case 'dlib':

                //xpath = xpath.replace(DLIB_ORIGINAL_PREFIX, DLIB_RASCHIETTO_PREFIX);
                xpath = Dlib.convert(xpath, type, provenance);
                if (!xpath) return;
                break;
            case 'statistica':
                // delle due l'una...
                xpath = Statistica.convert(xpath, type, provenance);
                if (!xpath) return;
                /*
                xpath = xpath.replace(STAT_ORIGINAL_PREFIX, STAT_RASCHIETTO_PREFIX)
                            .replace(STAT_WRONG_PREFIX, STAT_RASCHIETTO_PREFIX);
                */
                break;
        }
        return getElementByXpath(xpath);
    };


    /////////////
    // Helpers //
    /////////////

    function getElementByXpath(path) {
        try {
            return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        } catch (e) {
            return null;
        }
    }


    function isFragment(str) {
        // se è nel formato giusto, non contiene '/'
        return (str.indexOf('/') === -1);
    }

    function fragment_to_xpath(uri) {
        uri = uri.replace(/^/, "/");
        uri = uri.replace(/_/gi, "/");
        return uri.replace(/([0-9]+)/gi, function(str, backref) {
            return "[" + backref + "]";
        });
    }

    function xpath_to_fragment(xpath) {
        xpath = xpath.replace(/^\//, "");
            xpath = xpath.replace(/\//gi, "_");
                return xpath.replace(/\[/gi, "");
    }

}
