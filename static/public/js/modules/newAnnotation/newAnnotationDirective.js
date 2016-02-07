export default function newAnnotationDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/newAnnotation/newAnnotationView.html',
        bindToController: {
            docUrl: "="
        },
        controller: 'NewAnnotationController',
        controllerAs: 'newAnnotation'
    };
}

