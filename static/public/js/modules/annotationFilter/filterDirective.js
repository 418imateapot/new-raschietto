export default function filterDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/annotationFilter/filterView.html',
        controller: 'FilterController',
        controllerAs: 'filter'
    };
}


