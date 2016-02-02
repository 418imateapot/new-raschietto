export default function annotationCardDirective ($parse) {
    return {
        restrict: 'AE',
        templateUrl: 'js/modules/annotationCard/annotationCardView.html',
        scope: {
            annotation: '='
        },
        controller: 'AnnotationCardController',
        controllerAs: 'annoCard'
    };
}

