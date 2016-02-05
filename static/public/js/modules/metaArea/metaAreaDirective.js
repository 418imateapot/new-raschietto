export default function metaDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/metaArea/metaView.html',
        bindToController: {
            annotations: '=', // bound to appctrl
            isLoading: '@',
            isFiltered: '&'
        },
        controller: 'MetaController',
        controllerAs: 'metaArea'
    };
}
