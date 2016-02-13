export default function filterDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/annotationFilter/filterView.html',
        bindToController: {
            filters: '=',
            show: '@'
        },
        controller: 'FilterController',
        controllerAs: 'filter'
    };
}


