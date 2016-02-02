/**
 * Mostra la lista di documenti
 */
export default function docBarDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/docArea/docBarView.html',
        scope: {
            show: '='
        },
        controller: 'DocumentController',
        controllerAs: 'docBar'
    };
}
