export default function toolboxDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/toolbox/toolboxView.html',
        bindToController: {
            annotationsLoading: '@',
            getAnnotations: '&',
            filters: '='
        },
        controller: 'ToolboxController',
        controllerAs: 'toolbox'
    };
}

