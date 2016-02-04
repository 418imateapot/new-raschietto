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
            content: '=', // Per avere content come this.content
            highlight: '&render'  //la funzione per evidenziare le annotazioni
        },
        controller: 'MainAreaController',
        controllerAs: 'mainArea'
    };
}
