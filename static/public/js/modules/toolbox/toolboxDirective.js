export default function toolboxDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/toolbox/toolboxView.html',
        bindToController: {
            annotationsLoading: '@',
            annotations: '='
        },
        controller: 'ToolboxController',
        controllerAs: 'toolbox'
    };
}

