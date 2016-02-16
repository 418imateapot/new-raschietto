MainAreaController.$inject = ['$rootScope', '$scope', '$state', '$sanitize', 'documentService',  'annotationService', 'userService'];

/**
 * Controller per la model
 * $sanitize permette di iniettare HTML nelle viste
 */
export default function MainAreaController($rootScope, $scope, $state, $sanitize, documentService, annotationService, userService) {

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
                _loadAnnotations();
            });
    }

    /**
     * Richiedi ad annotationService di caricare le annotazioni sul
     * documento corrente
     */
    function _loadAnnotations() {
        console.log('wait for it');
        annotationService.query(documentService.currentUrl)
        .then(res => {
            console.log(res);
            console.log(annotationService.annotations);
            //model.highlight();
        });
    }
}
