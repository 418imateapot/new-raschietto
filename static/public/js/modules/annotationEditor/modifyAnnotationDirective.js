export default function modifyAnnotationDirective() {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/annotationEditor/modifyAnnotationView.html',
        controller: 'ModifyAnnotationController',
        controllerAs: 'modifyAnnotation',
        bindToController:{annotation:'='}
    };
}
