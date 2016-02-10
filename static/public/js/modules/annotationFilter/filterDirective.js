export default function filterDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/annotationFilter/filterView.html',
        bindToController: {
        },
        controller: 'FilterController',
        controllerAs: 'filter'
    };
}


