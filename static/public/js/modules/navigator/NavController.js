NavController.$inject = ['$scope', '$state', '$stateParams', '$mdSidenav'];
/**
 * $mdSidenav e $mdDialog sono i servizi per interagire
 * rispettivamente con la barra laterale e la finestra modale
 */
export
default
function NavController($scope, $state, $stateParams, $mdSidenav) {
    var model = this;

    model.open = () => $mdSidenav('left').toggle(); // Funzione da invocare per aprire il dialog.
    model.activeMode = ''; // Modalità attiva (reader | annotator)
    model.inactiveMode = ''; // Modalità inattiva
    model.modeColor = ''; // Nome di una classe CSS
    model.modeIcon = '?'; // Icona della modalità
    model.openToolbox = _openToolbox;
    model.switchMode = _switchMode;


    // Sincronizza l'intestazione della sidebar con la modalità attuale
    $scope.currentState = $stateParams;
    $scope.$watch('currentState', _showNavToolBar);


    //////////////////////////
    //-- Funzioni interne --//
    //////////////////////////

    /**
     * Apre la toolbox alla pagina desiderata.
     * Se nessun documento e' caricato, apre la lista
     * @param {string} origin Il nome del pulsante che ha generato l'evento.
     */
    function _openToolbox(origin) {
        // Setta qualche default se non sappiamo che fare;
        let mode = $stateParams.mode || 'reader';
        $mdSidenav('left').close().then(function() {
            $state.go('mode.docs.document.tools.tab', {mode: mode, toolId: origin});
        });
    }

    /**
     * Cambia modalita'
     */
    function _switchMode() {
        let newMode = (model.activeMode !== 'Annotator') ? 'annotator' : 'reader';
        $state.go('.', {mode: newMode});
        _showNavToolBar({mode: newMode}); //Bisogna refreshare la navbar
    }

    /**
     * Seleziona il colore e il contenuto dell'intestazione del
     * menu laterale in base alla modalità in cui ci troviamo.
     */
    function _showNavToolBar(newState, oldState) {
        if (newState.mode && newState.mode.search('annotator') != -1) {
                model.activeMode = 'Annotator';
                model.inactiveMode = 'Passa a Reader';
                model.modeColor = 'teapot-mode-annotator';
                model.modeIcon = 'mode_edit';
        } else {
                model.activeMode = 'Reader';
                model.inactiveMode = 'Passa ad Annotator';
                model.modeColor = 'teapot-mode-reader';
                model.modeIcon = 'import_contacts';
        }
    }

}
