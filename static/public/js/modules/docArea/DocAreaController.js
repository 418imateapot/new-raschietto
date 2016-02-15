import fuzzy from 'fuzzy';

DocumentController.$inject = ['$scope', '$state', '$mdToast', 'documentService'];

/**
 * Controller per la docArea.
 * Si occupa di interrogare fuseki per ottenere la lista dei documenti
 * visualizzabili, e di  richiedere il caricamento di un nuovo documento
 * tramite modifica dell'URL
 */
export
default

function DocumentController($scope, $state, $mdToast, documentService) {

    var model = this;

    model.docs = [];
    model.load = _load;
    model.search = _search;
    model.newDoc = _newDoc;

    _init();

    //////////////////////////
    //-- Funzioni interne --//
    //////////////////////////

    function _init() {
        documentService.list()
            .then(data => {
                model.docs = data;
            })
            .catch(err => {
                console.log(err);
            });
    }

    /**
     * Funzione di ricerca per la barra dei documenti.
     * Usa Fuzzy (https://github.com/mattyork/fuzzy) per
     * il matching
     */
    function _search(text) {
        if (text) {
            let options = {
                extract: (el) => el.title.value
            };
            let results = fuzzy.filter(text.toString(), model.docs, options);
            return results.map(el => el.original); //Vogliamo l'oggetto originale e basta
        } else {
            return model.docs;
        }
    }


    /**
     * Dato un doi, punta l'URL della pagina al nuovo documento
     * NOTA: è il controller della main area che risolve il doi nel suo url
     * @param {string} doi Il DOI del documento da caricare
     */
    function _load(doi) {
        if (!doi) return;

        let encodedDoi = documentService.encodeDoi(doi);
        $state.go('mode.docs.document', {
                doi: encodedDoi
            }) // Punta l'url al nuovo doc
            .then(() => $scope.show = false); // Nascondi la barra
    }

    function _newDoc(url) {
        let valid = Boolean(url.match(/unibo/) || url.match(/dlib/));

        if (!valid) {
            $mdToast.showSimple('url non supportato');
        } else {
            if (url.match(/^http:\/\//)) {
                url = 'http://' + url;
            }
            documentService.add(url)
            .then(r=> $mdToast.showSimple('Documento aggiunto alla lista'))
            .catch(e=> $mdToast.showSimple('Non sono riuscto ad aggiungere il documento'));
        }
    }

}
