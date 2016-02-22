AnnotatedTextController.$inject = ['$scope', '$mdToast', '$state', '$mdDialog', 'annotationService', 'newAnnotationService', 'selectionService'];

export
default
function AnnotatedTextController($state, $mdToast, $scope, $mdDialog, annotationService, newAnnotationService, selectionService) {

    let model = this;

    // Definite nella dase di link:
    // model.managedAnnotations  -> Lista di tutte le annotazioni sul frammento
    // model.getAnnotations      -> Recupera le annotazioni

    model.managedAnnotations = []; // Tutte le annotazioni gestite
    model.activeAnnotations = []; // Tutte le annotazioni NON filtrate

    model.showAnnotations = _showAnnotation;


    /////////////////
    //  Inner fun  //
    /////////////////

    function _showAnnotation(event, annotationIndexes) {
        let annotations = annotationIndexes.map(i => model.activeAnnotations[i]);
        $mdDialog.show({
            controller: _showAnnotationController,
            controllerAs: 'dialog',
            templateUrl: 'js/modules/annotatedText/annotationModalView.html',
            annotations: annotations,
            bindToController: {
                annotations: annotations
            },
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true
        });
    }

    function _showAnnotationController() {
        const dialog = this;
        dialog.isFiltered = () => false;

    }
}
