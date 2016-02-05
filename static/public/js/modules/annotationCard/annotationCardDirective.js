export default function annotationCardDirective ($parse) {
    return {
        restrict: 'AE',
        templateUrl: 'js/modules/annotationCard/annotationCardView.html',
        bindToController: {
            annotation: '='
        },
        controller: 'AnnotationCardController',
        controllerAs: 'annoCard'
    };
}

