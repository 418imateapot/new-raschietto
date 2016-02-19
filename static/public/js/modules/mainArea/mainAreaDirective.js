/**
 * @name teapot.modules.mainArea.mainAreaDirective
 * @description
 * Mostra il contenuto del documento caricato
 */
export
default
function mainAreaDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/mainArea/mainView.html',
        bindToController: {
            edit: '='
        },
        controller: 'MainAreaController',
        controllerAs: 'mainArea'
    };
}
