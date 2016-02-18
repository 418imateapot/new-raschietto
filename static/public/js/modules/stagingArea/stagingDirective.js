export default function stagingDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/stagingArea/stagingView.html',
        controller: 'StagingController',
        controllerAs: 'stage'
    };
}
