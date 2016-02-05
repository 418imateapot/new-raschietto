NavController.$inject = ['$scope', '$state', '$stateParams', '$mdDialog', '$mdSidenav'];
/**
 * $mdSidenav e $mdDialog sono i servizi per interagire
 * rispettivamente con la barra laterale e la finestra modale
 */
export default function NavController($scope, $state, $stateParams, $mdDialog, $mdSidenav) {
    var model = this;

    model.open = () => $mdSidenav('left').toggle(); // Funzione da invocare per aprire il dialog.
    model.activeMode = ''; // Modalità attiva (reader | annotator)
    model.inactiveMode = ''; // Modalità inattiva
    model.modeColor = ''; // Nome di una classe CSS
    model.modeIcon = '?'; // Icona della modalità
    model.openToolbox = _openToolbox;
    model.switchMode = _switchMode;
    model.about = _about;


    // Sincronizza l'intestazione della sidebar con la modalità attuale
    $scope.currentState = $stateParams;
    $scope.$watch('currentState', _showNavToolBar);
    // Quando un login fallisce c'è bisogno di sincronizzare manualmente la
    // barra, a quanto pare
    $scope.$on('login', (ev, args) => _showNavToolBar({mode:args.state}));


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
            $state.go('mode.docs.document.tools.tab', {
                mode: mode,
                toolId: origin
            });
        });
    }

    /**
     * Cambia modalita'
     */
    function _switchMode() {
        let newMode = (model.activeMode !== 'Annotator') ? 'annotator' : 'reader';
        $state.go('.', {
            mode: newMode
        });
        _showNavToolBar({
            mode: newMode
        }); //Bisogna refreshare la navbar
    }

    /**
     * Apre la finestra 'about'
     */
    function _about(ev) {
        $mdDialog.show({
                template: '<iframe width="512" height="384" src="https://www.youtube.com/embed/ykwqXuMPsoc" frameborder="0" allowfullscreen></iframe>',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
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
