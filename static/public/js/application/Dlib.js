export default class Dlib {

    static get PREFIXES() {
        return {
            'hasTitle': '//*[@id="document-view"]/td',
            'hasAuthor': '//*[@id="document-view"]/td',
            'hasPublicationYear':  '//*[@id="document-view"]/td',
            'hasDOI': '//*[@id="document-view"]/td',
            'hasURL': '//*[@id="document-view"]/td',
            'hasComment': '//*[@id="document-view"]/td',
            'denotesRethoric': '//*[@id="document-view"]/td',
            'cites': '//*[@id="document-view"]/td'
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
        xpath = xpath.replace(/h\[32\]/, 'h3[2]');      // Hack orrendo

        let suffix = xpath.slice(xpath.lastIndexOf('td'));
        suffix = suffix.slice(suffix.indexOf('/'));

        let prefix = Dlib.PREFIXES[type];
        //
        //let suffix = xpath.match(/\/\w+\[?\d?\]??$/i); // recupera l'ultima parte dell'xpath originale


        if (!suffix) {
            return null;
        }
        //console.log(type, xpath, prefix+suffix);

        return prefix + suffix;
    }

}

