ApplicationController.$inject = ['$scope', '$mdSidenav', 'documentService'];

export default function ApplicationController($scope, $mdSidenav, documentService) {

    let model = this;

    model.showFilterBar = false;
    model.openNav = (ev) => $mdSidenav('left').open();

    // Se c'è un login, aggiornare l'utente
    $scope.$on('login', (ev, args) => {
        model.user = args.user || '';
    });

    $scope.$on('logout', (ev, args) => {
        model.user =  '';
    });

    $scope.$on('highlight', (ev, args) => documentService.highlight($scope));
    console.info("Raschietto sta scaldando i motori...");

    //////////////////////////
    //-- Funzioni interne --//
    //////////////////////////

    /**
     * Data un'annotazione, verifica se esiste un filtro che
     * impedisce di visualizzarla
     * @param {object} item L'annotazione da filtrare
     * @return {bool} true se l'annotazione va filtrata
     */
    function _isFiltered(item) {
        // se l'oggetto ha display: false non va visualizzato
        return model.filters[item.type.value].display &&
            model.filters[item.provenance.value].display;
    }


}
