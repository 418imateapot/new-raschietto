export default function modifyAnnotationDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/annotationEditor/modifyAnnotationView.html',
        controller: 'ModifyNewAnnotationController',
        controllerAs: 'modifyAnnotation'
    };
}

