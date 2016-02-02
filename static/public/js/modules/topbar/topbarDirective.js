export default function topbarDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/topbar/topbarView.html',
        scope: {},
        controller: 'TopbarController',
        controllerAs: 'topbar'
    };
}


