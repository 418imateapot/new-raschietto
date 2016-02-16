MainAreaController.$inject = ['$rootScope', '$scope', '$state', '$sanitize', 'documentService', 'userService'];

/**
 * Controller per la model
 * $sanitize permette di iniettare HTML nelle viste
 */
export default function MainAreaController($rootScope, $scope, $state, $sanitize, documentService, userService) {

    const model = this;

    model.loading = false; /** Usato per l'animazione */
    model.content = documentService.currentDoc.content; //nuovo body del documento

    $scope.$on('retrieveNewUrl',change_document);

    // Se possibile, carica l'ultimo documento
    if (!model.content) {
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
                //model.highlight();
            });
    }
}
