export default class Dlib {

    static get LOCAL_PREFIX() {
        return '//*[@id="document-view"]/td';
    }

    static get REMOTE_PREFIX() {
        return '/html/body/form/table[3]/tbody/tr/td/table[5]/tbody/tr/td/table[1]/tbody/tr/td[2]';
    }

    static get BLACKLIST() {
        // solo i worst offender..
        return [];
    }

    // converte un xpath preso da fuseki in uno che
    // ha speranza di funzionare in raschietto
    static convertToRaschietto(xpath, type, provenance) {

        if (Dlib.BLACKLIST.indexOf(provenance) !== -1)
            return null;

        xpath = xpath.replace(/^\/\[\d\]/, ''); // Io ne ho viste cose che voi umani...
        let re = '^(?:/html/body)?'; // non potreste immaginarvi
        re += '/form(?:\\[\\d\\])?'; // regexp in fiamme al largo
        re += '/table\\[3\\]/(?:tbody\\[1\\]/)?'; // del triple store di Orione
        re += 'tr(?:\\[\\d\\])?\/td(?:\\[\\d\\])?/table\\[5\\]/(?:tbody\\[1\\]/)?';
        re += 'tr(?:\\[\\d\\])?/td(?:\\[\\d\\])?/table\\[1\\]/(?:tbody\\[1\\]/)?';
        re += 'tr(?:\\[\\d\\])?/td\\[2\\]'; // xpath balenare nel buio vicino ai
        re = new RegExp(re, 'i'); // server di Tannhauser

        if (!xpath.match(re)) {
            // Non so che farci...
            console.warn(xpath + '\n- nessun match');
            return null;
        }
        let suffix = xpath.replace(re, '').replace(/\/$/, '');

        if (suffix.match(/.*td$/) || !suffix)
            return null;

        let result = Dlib.add_tbody(Dlib.LOCAL_PREFIX + suffix);

        //console.log(result);

        return result;
    }

    static convertFromRaschietto(localPath) {

        // togli la robaccia
        localPath = localPath.toLowerCase();
        localPath = localPath.replace(/\/undefined.*/, '');

        let suffix = localPath.slice(localPath.lastIndexOf('td'));
        suffix = suffix.slice(suffix.indexOf('/'));

        let result = Dlib.REMOTE_PREFIX + suffix;

        return result;
    }

    static add_tbody(xpath) {
        return xpath.replace(/(?:tbody\/)?tr/, 'tbody/tr');
    }

}
