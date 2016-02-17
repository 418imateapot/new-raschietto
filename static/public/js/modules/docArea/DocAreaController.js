import fuzzy from 'fuzzy';

DocumentController.$inject = ['$rootScope', '$state', '$mdDialog', '$mdToast','$stateParams', 'documentService'];

/**
 * Controller per la docArea.
 * Si occupa di interrogare fuseki per ottenere la lista dei documenti
 * visualizzabili, e di  richiedere il caricamento di un nuovo documento
 * tramite modifica dell'URL
 */
export
default
function DocumentController($rootScope, $state, $mdDialog, $mdToast, $stateParams, documentService) {

    var model = this;


    model.docs = [];
    model.docsDlib = [];
    model.docsStat = [];
    model.load = _load;
    model.search = _search;
    model.newDoc = _newDoc;
    model.close = () => $mdDialog.cancel();

    _init();

    //////////////////////////
    //-- Funzioni interne --//
    //////////////////////////

    function _init() {
        documentService.list()
            .then(data => {
                model.docs = data;
                model.docsDlib=data.filter(item => item.url.value.match(/dlib/i));
                model.docsStat=data.filter(item => item.url.value.match(/statistica/i));
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
     */
    function _load(url) {
        if ($state.is('teapot.mode.tutorial')) {
            documentService.retrieve(url)
            .then(() => {
                $state.go('teapot.mode')
                .then(() => $rootScope.$broadcast('retrieveNewUrl',{doc_url: url}));
            });
        } else {
            $rootScope.$broadcast('retrieveNewUrl', {doc_url:url});
        }

        $mdDialog.hide();
    }

    // Carica un documento nel triple store
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
