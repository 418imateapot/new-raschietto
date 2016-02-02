DialogController.$imject = ['$stateParams', '$mdDialog', 'annotationService', 'documentService'];

/**
 *
 * @param {string} origin Il nome del pulsante che è stato cliccato per
 *      aprire il modale.
 */
export
default

function DialogController($stateParams, $mdDialog, origin, annotationService, documentService) {
    var model = this;

    model.active = selectActiveTab(); // La tab selezionata

    // Callbacks del modale
    model.hide = function() {
        $mdDialog.hide();
    };
    model.cancel = function() {
        $mdDialog.cancel();
    };
    model.answer = function(answer) {
        $mdDialog.hide(answer);
    };

    //////////////////////////
    //-- Funzioni interne --//
    //////////////////////////

    /**
     * Seleziona di default la tab corrispondente
     * al bottone usato per invocare il modale
     */
    function selectActiveTab() {
        if (origin === 'anno') {
            return "1";
        } else if (which === 'filter') {
            return "2";
        } else {
            return "0";
        }
    }

}
