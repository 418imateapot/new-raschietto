export default function editAnnotationDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/editAnnotation/editAnnotationView.html',
        bindToController: {
            edit: "="
        },
        controller: 'EditAnnotationController',
        controllerAs: 'editAnnotation'
    };
}

