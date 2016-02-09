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

        xpath = xpath.replace(/^\/\[\d\]/, ''); // Ho visto cose che voi umani...
        let re = '^(?:/html/body)?(?:/\\[\d\\])*';
        re += '/form(?:\\[\\d\\])?';
        re += '/table\\[3\\]/(?:tbody/)?';
        re += 'tr(?:\\[\\d\\])?\/td(?:\\[\\d\\])?/table\\[5\\]/(?:tbody/)?';
        re += 'tr(?:\\[\\d\\])?/td(?:\\[\\d\\])?/table\\[1\\]/(?:tbody/)?';
        re += 'tr(?:\\[\\d\\])?/td\\[2\\]';     // xpath in fiamme al largo
        re = new RegExp(re, 'i');               // dei bastioni di orione

        if (!xpath.match(re)) {
            // Non so che farci...
            console.warn(xpath + '\n- nessun match');
            return null;
        }
        let suffix = xpath.replace(re, '');
        let prefix = Dlib.PREFIXES[type];
        let result = Dlib.add_tbody(prefix + suffix);

        console.log(result);
        //console.log(type, xpath, prefix+suffix);

        return result;
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

    static add_tbody(xpath) {
        return xpath.replace(/(?:tbody\/)?tr/, 'tbody/tr');
    }

}

