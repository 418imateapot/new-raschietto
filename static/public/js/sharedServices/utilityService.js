utilityService.$inject = [];

export default function utilityService() {

    const service = this;

    service.labelFromType = _genLabel;
    service.typeFromLabel = _genType;

    /////////////////////
    // Implementazione //
    /////////////////////

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
}
