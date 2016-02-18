export default function newAnnotationDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/newAnnotationButton/newAnnotationView.html',
        controller: 'NewAnnotationController',
        controllerAs: 'newAnnotation'
    };
}

