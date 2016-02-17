utilityService.$inject = [];

export default function utilityService() {

    const service = this;

    service.labelFromType = _genLabel;
    service.typeFromLabel = _genType;
    service.getXPathTo = _getXPathTo;
    service.expandRethoricURI = _expandRethoricURI;
    service.xpath_to_fragment = _xpath_to_fragment;
    service.getSelection = _selection;
    service.getCitedNumber = _getCitedNumber;

    /////////////////////
    // Implementazione //
    /////////////////////


    /**
     * Ottieni l'xpath assoluto di un elemento del DOM
     *
     * @credits: https://stackoverflow.com/questions/2631820/im-storing-click-coordinates-in-my-db-and-then-reloading-them-later-and-showing/2631931#2631931
     *
     * Modificata per ignorare i tag inseriti da raschietto
     */
    function _getXPathTo(element) {
        if (element === document.body)
            return element.tagName;

        if (element.className &&
            (element.className.match(/anno\w+/) ||
                element.tagName.match(/span/i) && element.className === 'ng-scope')) {
            // Se troviamo un elemento inserito da noi,
            // non lo vogliamo nell'xpath
            return _getXPathTo(element.parentNode);
        }

        var ix = 0;
        var siblings = element.parentNode.childNodes;
        for (var i = 0; i < siblings.length; i++) {
            var sibling = siblings[i];
            if (sibling === element) {
                return _getXPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                ix++;
            }
        }
    }


    /**
     * Converti un xpath nel formato delimitato
     * da underscore per salvarlo su fuseki
     */
    function _xpath_to_fragment(xpath) {
        xpath = xpath.replace(/^\//, "");
        xpath = xpath.replace(/\//gi, "_");
        xpath = xpath.replace(/\[/gi, "").replace(/\]/gi, "");
        return xpath;
    }


    /**
     * Questa è pura pigrizia
     */
    function _expandRethoricURI(shortUri) {
        let sro = 'http://salt.semanticauthoring.org/ontologies/sro#';
        let deo = 'http://purl.org/spar/deo/';

        return shortUri
            .replace('sro:', sro)
            .replace('deo:', deo);
    }


    function _genLabel(type) {
        switch (type) {
            case 'hasTitle':
                return 'Titolo';
            case 'hasPublicationYear':
                return 'Anno di pubblicazione';
            case 'hasAuthor':
                return 'Autore';
            case 'hasURL':
                return 'URL';
            case 'hasDOI':
                return 'DOI';
            case 'hasComment':
                return 'Commento';
            case 'denotesRethoric':
                return 'Funzione retorica';
            case 'cites':
                return 'Citazione';
            default:
                console.log('Non so che farmene: ' + type);
        }
        return null;
    }

    function _genType(label) {
        if (/tit/i.test(label)) {
            return 'hasTitle';
        } else if (/pub/i.test(label)) {
            return 'hasPublicationYear';
        } else if (/aut/i.test(label)) {
            return 'hasAuthor';
        } else if (/URL/i.test(label)) {
            return 'hasURL';
        } else if (/DOI/i.test(label)) {
            return 'hasDOI';
        } else if (/comment/i.test(label)) {
            return 'hasComment';
        } else if (/ret/i.test(label)) {
            return 'denotesRethoric';
        } else if (/cit/i.test(label)) {
            return 'cites';
        }
        console.log('Non so che farmene: ' + label);
        return null;
    }


    function _getCitedNumber(annot) {
        let tagNum = annot.target.id.match(/\d+$/);
        if(tagNum) {
            return tagNum[0];
        } else {
            return Math.floor(Math.random() * 50);
        }
    }


    /**
     * Ottieni la selezione corrente
     */
    function _selection() {
        if (window.getSelection) {
            return window.getSelection();
        } else if (document.getSelection) {
            return document.getSelection();
        } else if (document.selection) {
            return document.selection.createRange().text;
        }
    }
}
