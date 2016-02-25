NavController.$inject = ['$scope', '$rootScope', '$state', '$stateParams', '$mdDialog', '$mdSidenav', '$mdMedia', '$mdToast', 'annotationService', 'userService', 'loginModal', 'newAnnotationService'];
/**
 * $mdSidenav e $mdDialog sono i servizi per interagire
 * rispettivamente con la barra laterale e la finestra modale
 */
export default function NavController($scope, $rootScope, $state, $stateParams, $mdDialog, $mdSidenav, $mdMedia, $mdToast, annotationService, userService, loginModal, newAnnotationService) {
    var model = this;

    model.open = () => $mdSidenav('left').toggle(); // Funzione da invocare per aprire il dialog.
    model.activeMode = ''; // Modalità attiva (reader | annotator)
    model.inactiveMode = ''; // Modalità inattiva
    model.modeColor = ''; // Nome di una classe CSS
    model.modeIcon = '?'; // Icona della modalità
    model.openDocArea = _openDocArea;
    model.openMetaArea = _openMetaArea;
    model.openStagingArea = _openStagingArea;
    model.tutorial = (ev) => $state.go('teapot.mode.tutorial');
    model.switchMode = _switchMode;
    model.scrape = _scrape;
    model.about = _about;
    model.fullscreenDialog = $mdMedia('xs') || $mdMedia('sm');

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
     * Apre il modal con la docArea
     */
    function _openDocArea() {
        $mdSidenav('left').close().then(function(ev) {
            $mdDialog.show({
                controller: DocTabController,
                controllerAs: 'docDialog',
                templateUrl: 'js/modules/navigator/docTabView.html',
                parent: angular.element(document.body),
                fullscreen: model.fullscreenDialog,
                targetEvent: ev,
                clickOutsideToClose: true
            });
        });
    }

    // Il controller del modal docarea
    function DocTabController() {
        const docTab = this;
        docTab.close = () => $mdDialog.cancel();
    }

    /**
     * Apre il modal con la metaArea
     */
    function _openMetaArea() {
        $mdSidenav('left').close().then(function(ev) {
            $mdDialog.show({
                controller: MetaDialogController,
                controllerAs: 'metaDialog',
                templateUrl: 'js/modules/navigator/annotListView.html',
                parent: angular.element(document.body),
                fullscreen: model.fullscreenDialog,
                targetEvent: ev,
                clickOutsideToClose: true
            });
        });
    }

    // Il controller del modal docarea
    function MetaDialogController() {
        const metaDialog = this;
        metaDialog.close = () => $mdDialog.cancel();
    }

    /**
     * Apre il modal con la metaArea
     */
    function _openStagingArea() {
        $mdSidenav('left').close().then(function(ev) {
            $mdDialog.show({
                controller: StageDialogController,
                controllerAs: 'stageDialog',
                templateUrl: 'js/modules/navigator/stageView.html',
                parent: angular.element(document.body),
                fullscreen: model.fullscreenDialog,
                targetEvent: ev,
                clickOutsideToClose: true
            });
        });
    }

    // Il controller del modal docarea
    function StageDialogController() {
        const stageDialog = this;
        stageDialog.close = () => $mdDialog.cancel();
        stageDialog.isEmpty = true;

        stageDialog.saveAll = () => {
            $rootScope.$broadcast('save_all');
        };
        stageDialog.deleteAll = () => {
            $rootScope.$broadcast('delete_all');
        };
        if (newAnnotationService.retrieveLocal().length > 0) {
            stageDialog.isEmpty = false;
        }
    }


    /**
     * Cambia modalita'
     */
    function _switchMode() {
        let newMode = (model.activeMode !== 'Annotator') ? 'annotator' : 'reader';
        $state.go('.', {
            mode: newMode
        }).then(() => {
            $rootScope.$broadcast('reload_view', {noAnnotations: true});
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
        annotationService.scrape()
            .then(res => {
                newAnnotationService.generateFromScraper(res.data);
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
