export default function metaDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/metaArea/metaView.html',
        bindToController: {
            annotations: '=', // bound to appctrl
            isLoading: '@'
        },
        controller: 'MetaController',
        controllerAs: 'metaArea'
    };
}
