


/**
 * @name teapot.modules.docArea.docAreaDirective
 * @description
 * Mostra la lista di documenti
 */
export default function docAreaDirective() {
    return {
        restrict: 'AE',
        templateUrl: 'js/modules/docArea/docListView.html',
        scope: {},
        controller: 'DocumentController',
        controllerAs: 'docArea'
    };
}
