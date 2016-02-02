export default class Dlib {

    static get PREFIXES() {
        return {
            'hasTitle': '//*[@id="document-view"]/span',
            'hasAuthor': '//*[@id="document-view"]/span',
            'hasPublicationYear':  '//*[@id="document-view"]/span',
            'hasDOI': '//*[@id="document-view"]/span',
            'hasURL': '//*[@id="document-view"]/span',
            'hasComment': '//*[@id="document-view"]/span',
            'denotesRethoric': '//*[@id="document-view"]/span',
            'cites': '//*[@id="document-view"]/span'
        };
    }

    static get BLACKLIST() {
        // solo i worst offender..
        // return ['http://server/unset-base/ltw1529@scrappa.it'];
        return [];
    }

    // converte un xpath preso da fuseki in uno che
    // ha speranza di funzionare in raschietto
    static convert(xpath, type, provenance) {

        if (Dlib.BLACKLIST.indexOf(provenance) !== -1)
            return null;

        xpath = xpath.replace(/\/text.*$/, ''); // Elimina estensioni strane
        let prefix = Dlib.PREFIXES[type];
        let suffix = xpath.match(/\/\w+\[?\d?\]??$/i); // recupera l'ultima parte dell'xpath originale


        if (!suffix)
            return null;

        if (type==='cites') console.info(prefix+suffix[0]);

        return prefix + suffix[0];
    }

}

