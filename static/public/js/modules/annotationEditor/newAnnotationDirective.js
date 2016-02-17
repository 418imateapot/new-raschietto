export default function newAnnotationDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/annotationEditor/newAnnotationView.html',
        controller: 'NewAnnotationController',
        controllerAs: 'newAnnotation'
    };
}

