MainAreaController.$inject = ['$rootScope', '$scope', '$state', '$sanitize', 'documentService', 'userService'];

/**
 * Controller per la model
 * $sanitize permette di iniettare HTML nelle viste
 */
export default function MainAreaController($rootScope, $scope, $state, $sanitize, documentService, userService) {

    const model = this;

    model.loading = true; /** Usato per l'animazione */
    model.url = ''; // L'url del documento caricato
    model.content='';//nuovo body del documento

    $scope.$on('retriveNewUrl',change_document);
    $scope.$on('force_reload', change_document);

    // Se possibile, carica l'ultimo documento
    if (!model.content) {
        let savedDoc = userService.lastDocument();
        if (savedDoc) {
            $rootScope.$broadcast('retrieveNewUrl', {doc_url: savedDoc});
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
                model.content = doc.resp;
                model.loading = false;
                //model.highlight();
            });
    }
}
