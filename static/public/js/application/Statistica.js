export
default class Statistica {

    static get PREFIXES() {
        return {
            'hasTitle': '//*[@id="document-view"]/div/div[2]',
            'hasAuthor': '//*[@id="document-view"]/div/div[3]',
            'hasPublicationYear': null,
            'hasDOI': '//*[@id="document-view"]/div',
            'hasURL': '',
            'hasComment': '',
            'denotesRethoric': '',
            'cites': '//*[@id="document-view"]/div/div[7]/div'
        };
    }

    static get BLACKLIST() {
        // solo i worst offender..
        return ['http://server/unset-base/ltw1529@scrappa.it'];
    }

    // converte un xpath preso da fuseki in uno che
    // ha speranza di funzionare in raschietto
    static convertToRaschietto(xpath, type, provenance) {

        if (Statistica.BLACKLIST.indexOf(provenance) !== -1)
            return null;

        xpath = xpath.replace(/\/text.*$/, ''); // Elimina estensioni strane

        let suffix = xpath.slice(xpath.lastIndexOf('div[1]'));
        suffix = suffix.slice(suffix.indexOf('/'));

        let prefix = '//*[@id="document-view"]/div';


        if (!suffix) {
            return null;
        }
        //console.log(type, xpath, prefix+suffix);

        return prefix + suffix;
    }

}
