export default function metaDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/newMetaArea/metaView.html',
        controller: 'MetaController',
        controllerAs: 'metaArea'
    };
}
