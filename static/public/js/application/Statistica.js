export default class Statistica {

    static get PREFIXES() {
        return {
            'hasTitle': '//*[@id="document-view"]/span/div/div[2]',
            'hasAuthor': '//*[@id="document-view"]/span/div/div[3]',
            'hasPublicationYear': null,
            'hasDOI': '//*[@id="document-view"]/span/div',
            'hasURL': '',
            'hasComment': '',
            'denotesRethoric': '',
            'cites': '//*[@id="document-view"]/span/div/div[7]/div'
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
        let prefix = Statistica.PREFIXES[type];
        let suffix = xpath.match(/\/\w+\[?\d?\]??$/i); // recupera l'ultima parte dell'xpath originale

        if (!suffix)
            return null;

        return prefix + suffix[0];
    }

}
