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

    $scope.$on('annotations_loaded', (ev, args) => documentService.highlight($scope));
    console.info("Raschietto sta scaldando i motori...");

}
