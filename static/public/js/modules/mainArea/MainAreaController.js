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
    function change_document(event,args) {
        model.loading = true; // Inizia l'animazione
        documentService
            .retrieve(args.doc_url)
            .then(doc => {
                model.content = doc.content;
                model.loading = false;
                userService.storeLastDocument();  // Salve ultimo doc in un cookie
                _loadAnnotations();
            });
    }

    /**
     * Richiedi ad annotationService di caricare le annotazioni sul
     * documento corrente
     */
    function _loadAnnotations() {
        $mdToast.showSimple('Sto caricando le annotazioni.');
        annotationService.query(documentService.currentUrl)
        .then(res => {
            $rootScope.$broadcast('highlight');
            $mdToast.showSimple(res.length + ' annotazioni caricate.');
        });
    }
}
