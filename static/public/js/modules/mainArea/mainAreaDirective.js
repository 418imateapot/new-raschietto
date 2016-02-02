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
            content: '=' // Per avere content come this.content
        },
        controller: 'MainAreaController',
        controllerAs: 'mainArea'
    };
}
