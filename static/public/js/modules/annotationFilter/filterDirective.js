export default function filterDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/annotationFilter/filterView.html',
        bindToController: {
            filters: '=',
            reload: '&'
        },
        controller: 'FilterController',
        controllerAs: 'filter'
    };
}


