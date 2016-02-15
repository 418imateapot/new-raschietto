export default function topbarDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/topbar/topbarView.html',
        bindToController: {
            showFilters: '='
        },
        controller: 'TopbarController',
        controllerAs: 'topbar'
    };
}


