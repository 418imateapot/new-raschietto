NavController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$mdDialog', '$mdSidenav', '$mdToast', 'annotationService', 'userService', 'loginModal', 'newAnnotationService'];
/**
 * $mdSidenav e $mdDialog sono i servizi per interagire
 * rispettivamente con la barra laterale e la finestra modale
 */
export
default

function NavController($scope, $rootScope, $state, $stateParams, $mdDialog, $mdSidenav, $mdToast, annotationService, userService, loginModal, newAnnotationService) {
    var model = this;

    model.open = () => $mdSidenav('left').toggle(); // Funzione da invocare per aprire il dialog.
    model.activeMode = ''; // Modalità attiva (reader | annotator)
    model.inactiveMode = ''; // Modalità inattiva
    model.modeColor = ''; // Nome di una classe CSS
    model.modeIcon = '?'; // Icona della modalità
    model.openToolbox = _openToolbox;
    model.switchMode = _switchMode;
    model.scrape = _scrape;
    model.about = _about;

    model.isLoggedIn = userService.isLoggedIn;
    model.login = _login;
    model.logout = _logout;

    // Sincronizza l'intestazione della sidebar con la modalità attuale
    $scope.currentState = $stateParams;
    $scope.$watch('currentState', _showNavToolBar);
    // Quando un login fallisce c'è bisogno di sincronizzare manualmente la
    // barra, a quanto pare
    $scope.$on('login', (ev, args) => {
        _showNavToolBar({
            mode: args.state
        });
        model.isLoggedIn = userService.isLoggedIn;
    });


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
        //funzione tutorial   ---> ?

    function _tutorial(ev) {
        $mdDialog.show({
            templateUrl: 'js/modules/tutorial/tutorialView.html',
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

    function _login() {
        loginModal(event)
            .then((user) => {
                $rootScope.$broadcast('login', {
                    state: $stateParams.mode,
                    user: user
                });
            })
            .catch((err) => {
                console.warn(err);
                $rootScope.$broadcast('login', {
                    state: $stateParams.mode
                });
            });
    }

    function _scrape() {
        model.open(); //toggle
        $mdToast.show(
            $mdToast.simple()
            .textContent('Scraping in corso..')
            .position('top right')
            .hideDelay(3000)
        );
        annotationService.scrape($stateParams.doi)
            .then(res => {
                let alreadyPending = newAnnotationService.retrieveLocal();
                let data = new Set(alreadyPending);
                let subject = res.data.url.replace(/\.html$/, '') + '_ver1';
                let provenance = {
                    name: userService.userName,
                    email: userService.userEmail,
                    time: new Date()
                };
                // TODO Converti formato?
                for (let key in res.data) {
                    let item = {};
                    item.type = _determineType(key);
                    // Se l'annotazione dello scraper è ugule
                    // ad una preesistente, scratiamola
                    item[key] = res.data[key];
                    item.type = _determineType(key);
                    item.provenance = provenance;
                    item.subject = subject;
                    item.url = res.data.url;
                    data.add(item);
                }
                data.forEach(annotation => newAnnotationService.generateAnnotation(annotation));
                $mdToast.updateTextContent('Finito! Ora puoi modificare le nuove annotazioni');

            })
            .catch(err => console.warn(err));
    }

    function _determineType(key) {
        switch (key) {
            case 'title':
                return 'hasTitle';
            case 'doi':
                return 'hasDOI';
            case 'year':
                return 'hasPublicationYear';
            case 'authors':
                return 'hasAuthor';
            case 'url':
                return 'hasURL';
        }
    }

    function _logout() {
        userService.logout();
        model.isLoggedIn = userService.isLoggedIn;
        $rootScope.$broadcast('logout');
        $state.go('.', {
            mode: 'reader'
        });
        _showNavToolBar({
            mode: 'reader'
        });
    }

}
