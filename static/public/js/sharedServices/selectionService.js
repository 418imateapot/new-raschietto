import Riviste from './Riviste.js';
import Dlib from './Dlib.js';

selectionService.$inject = ['annotationService', 'utilityService'];

export
default
function selectionService(annotationService, utilityService) {

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
        // console.log(xpath);  // Il grande amico del debug alle 4 di notte
        return getElementByXpath(xpath);
    };

    service.initSelection = function(selection) {
        let src = annotationService.currentUrl;
        let selectedText = selection.toString().trim();

        console.log(selection);
        console.log(selection.getRangeAt(0));

        // Crea un target vuoto
        // Se non abbiamo una selezione, teniamo questo
        let target = {
            source: src,
            id: '',
            start: '',
            end: ''
        };

        if (selectedText.length > 0) { // Abbiamo una selezione

            let selectedRange = selection.getRangeAt(0);
            let elementCandidate;
            let idElement;

            if (selectedRange.startContainer.isSameNode(selectedRange.endContainer)) {
                // Range in un unico nodo
                elementCandidate = selectedRange.startContainer;
                console.log("SAME NODE");
            } else if (selectedRange.startContainer.contains(selectedRange.endContainer)) {
                // end è dentro start
                elementCandidate = selectedRange.endContainer;
                console.log("START CONTAINS END");
            } else if (selectedRange.endContainer.contains(selectedRange.startContainer)) {
                // viceversa
                elementCandidate = selectedRange.startContainer;
                console.log("END CONTAINS START");
            } else {
                // I due elementi sono adiacenti
                elementCandidate = selectedRange.commonAncestorContainer;
                console.log("NODES ARE INDEPENDANT");
            }

            // Assicriamoci di avere un element node
            if (elementCandidate.nodeType === Node.ELEMENT_NODE) {
                console.log("IS ELEMENT_NODE");
                idElement = elementCandidate;
            } else {
                console.log("IS TEXT_NODE");
                idElement= elementCandidate.parentElement;
            }

            let offsets = selectedRange.toCharacterRange(idElement);
            console.log(offsets);

            // Stabilisci l'id per l'elemento
            let localPath = utilityService.getXPathTo(idElement);
            let path;
            if (src.match('dlib')) {
                path = Dlib.convertFromRaschietto(localPath);
            } else {
                path = Riviste.convertFromRaschietto(localPath);
            }

            console.log(path);
            console.log(localPath);


            // Dato che abbiamo una selezione, riempiamo il target
            target = {
                source: src,
                id: utilityService.xpath_to_fragment(path),
                start: offsets.start,
                end: offsets.end
            };
            console.log(target);
        }
        return target;
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
