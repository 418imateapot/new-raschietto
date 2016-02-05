export default function newAnnotationDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/newAnnotation/newAnnotationView.html',
        bindToController: {

        },
        controller: 'NewAnnotationController',
        controllerAs: 'newAnnotation'
    };
}

