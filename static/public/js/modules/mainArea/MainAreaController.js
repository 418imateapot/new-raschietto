MainAreaController.$inject = ['$scope', '$state', '$sanitize', 'documentService'];

/**
 * Controller per la model
 * $sanitize permette di iniettare HTML nelle viste
 */
export default function MainAreaController($scope, $state, $sanitize, documentService) {
    var model = this;

    model.loading = true; /** Usato per l'animazione */
    /** model.content ->  Il contenuto del documento HTML passato da appctrl */
    
    if(model.content !== '') { // Abbiamo gia' la pagina ma il controller 
        model.highlight();     // e' stato ricaricato
    }

    $scope.currentState = $state;
    $scope.$watch('currentState', function(newState, oldState) {
        if (!newState.params.doi) {
            // In teoria non succederà mai, però...
            console.warn("Tried to load a document without a doi");
            return;
        }
        let doi = decodeURIComponent(newState.params.doi);
        doi = documentService.decodeDoi(doi);
        documentService.findByDoi(doi).then((doc) => {
            if (!doc) return; // Shit happens...
            change_document('none', {
                'doc_url': doc.url.value,
                'doc_doi': doc.doi.value
            });
        });
    });


    /**
     * Carica un nuovo documento tramite documentService
     */
    function change_document(event, args) {
        model.loading = true; // Inizia l'animazione
        documentService
            .retrieve(args.doc_url)
            .then(doc => {
                model.content = doc.resp.content;
                model.loading = false;
            });
    }
}
