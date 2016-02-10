export default class Riviste {

    static get LOCAL_PREFIX() {
        return '//*[@id="document-view"]/div';
    }

    static get REMOTE_PREFIX() {
        return '/html/body/div[1]/div[3]/div[2]/div[3]';
    }

    static get BLACKLIST() {
        // temporaneo, finchè non capisco cosa non va
        return ['mailto:antonio.lagana2@studio.unibo.it'];
    }

    // converte un xpath preso da fuseki in uno che
    // ha speranza di funzionare in raschietto
    static convertToRaschietto(xpath, type, provenance) {

        if (Riviste.BLACKLIST.indexOf(provenance) !== -1)
            return null;

        let re = '^(?:/html/body)?';
        re += '/div\\[\\d\\]/div\\[\\d\\]/div\\[\\d\\]/div\\[\\d\\]';
        re = new RegExp(re, 'i');

        xpath = xpath.replace(/\/text.*$/, ''); // Elimina estensioni strane

        if (!xpath.match(re)) {
            // Non so che farci...
            console.warn(xpath + '\n- nessun match');
            return null;
        }
        let suffix = xpath.replace(re, '');
        let result = Riviste.LOCAL_PREFIX + suffix;

        //console.log(type, xpath, prefix+suffix);
        return result;
    }


    static convertFromRaschietto(localPath) {

        // togli la robaccia
        localPath = localPath.toLowerCase();
        localPath = localPath.replace(/\/undefined.*/, '');

        // Recupera l'ultimo pezzo del path che vogliamo
        // (dopo il primo div dentro md-whiteframe)
        localPath = localPath.slice(localPath.lastIndexOf('whiteframe[1]'));
        localPath = localPath.slice(localPath.indexOf('div[1]'));
        localPath = localPath.slice(localPath.indexOf('/'));

        return Riviste.REMOTE_PREFIX + localPath;
    }

    static add_tbody(xpath) {
        return xpath.replace(/(?:tbody\/)?tr/, 'tbody/tr');
    }


}
