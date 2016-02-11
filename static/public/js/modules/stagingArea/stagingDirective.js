export default function stagingDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/stagingArea/stagingView.html',
        bindToController: {},
        controller: 'StagingController',
        controllerAs: 'stage'
    };
}
