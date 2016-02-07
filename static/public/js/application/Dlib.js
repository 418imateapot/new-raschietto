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
    static convertToRaschietto(xpath, type, provenance) {

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

    static convertFromRaschietto(localPath) {
        const DLIB_PREFIX = '/html/body/form/table[3]/tbody/tr/td/table[5]/tbody/tr/td/table[1]/tbody/tr/td[2]';

        // togli la robaccia
        localPath = localPath.toLowerCase();
        localPath = localPath.replace(/\/undefined.*/ , '');

        let suffix = localPath.slice(localPath.lastIndexOf('td'));
        suffix = suffix.slice(suffix.indexOf('/'));

        let result = DLIB_PREFIX + suffix;

        return result;
    }

}

