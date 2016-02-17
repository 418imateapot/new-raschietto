import Riviste from './Riviste.js';
import Dlib from './Dlib.js';

export default function selectionService() {

    var service = this;

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
                xpath = Dlib.convertToRaschietto(xpath, type, provenance);
                if (!xpath) return;
                break;
            case 'riviste':
                xpath = Riviste.convertToRaschietto(xpath, type, provenance);
                if (!xpath) return;
                break;
        }
        console.log(xpath);
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
        uri = uri.replace(/([0-9]+)/gi, function(str, backref) {
            return "[" + backref + "]";
        });
        uri = uri.replace(/h\[(\d)(\d+)\]/, (str, ref1, ref2) => {
            return 'h' + ref1 + '[' + ref2 + ']'; // Per evitare cose come h[32]
        });
        return uri;
    }

    function xpath_to_fragment(xpath) {
        xpath = xpath.replace(/^\//, "");
        xpath = xpath.replace(/\//gi, "_");
        xpath = xpath.replace(/\[/gi, "").replace(/\]/gi, "");
        return xpath;
    }

}
