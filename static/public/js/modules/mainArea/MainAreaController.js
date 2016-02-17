MainAreaController.$inject = ['$rootScope', '$scope', '$state', '$sanitize', '$mdToast', 'documentService',  'annotationService', 'userService'];

/**
 * Controller per la model
 * $sanitize permette di iniettare HTML nelle viste
 */
export default function MainAreaController($rootScope, $scope, $state, $sanitize, $mdToast, documentService, annotationService, userService) {

    const model = this;

    model.loading = false; /** Usato per l'animazione */
    model.content = documentService.currentDoc.content; // Vediamo se abbiamo già un documento

    $scope.$on('retrieveNewUrl',change_document);
    $scope.$on('filter_toggled', () => {
        let url = documentService.currentUrl;
        change_document(null, {doc_url: url, silent: true});
    });


    if (!model.content) {
        // Se possibile, carica l'ultimo documento
        let savedDoc = userService.lastDocument();
        if (savedDoc) {
            $rootScope.$broadcast('retrieveNewUrl', {doc_url: savedDoc});
        } else {
            // Se non abbiamo nulla, andiamo al tutorial
            $state.go('teapot.mode.tutorial', {mode: 'reader'});
        }
    } else {
        // Abbiamo già un documento, controlliamo di avere anche le sue
        // annotazioni
        if (annotationService.currentUrl !== documentService.currentUrl) {
             _loadAnnotations();
        }
        userService.storeLastDocument();  // Salve ultimo doc in un cookie
    }

    /**
     * Carica un nuovo documento tramite documentService
     */
    function change_document(event, args) {
        model.loading = true; // Inizia l'animazione
        documentService
            .retrieve(args.doc_url)
            .then(doc => {
                let silent = args.silent || false;
                model.content = doc.content;
                model.loading = false;
                userService.storeLastDocument();  // Salve ultimo doc in un cookie
                _loadAnnotations(silent);
            });
    }

    /**
     * Richiedi ad annotationService di caricare le annotazioni sul
     * documento corrente
     */
    function _loadAnnotations(silent) {
        if (annotationService.currentUrl === documentService.currentUrl) {
            // Abbiamo già le annotazioni giuste
            return;
        }
        if(!silent)
            $mdToast.showSimple('Sto caricando le annotazioni.');
        annotationService.query(documentService.currentUrl)
        .then(res => {
            $rootScope.$broadcast('annotations_loaded');
            if (!silent)
                $mdToast.showSimple(res.length + ' annotazioni caricate.');
        });
    }
}
