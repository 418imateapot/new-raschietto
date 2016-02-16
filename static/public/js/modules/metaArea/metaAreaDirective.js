export default function metaDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/metaArea/metaView.html',
        controller: 'MetaController',
        controllerAs: 'metaArea'
    };
}
