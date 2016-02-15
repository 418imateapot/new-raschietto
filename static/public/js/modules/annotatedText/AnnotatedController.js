AnnotatedTextController.$inject = ['$scope', '$mdToast', '$state', '$mdDialog', 'newAnnotationService'];

export default function AnnotatedTextController($state, $mdToast, $scope, $mdDialog, newAnnotationService) {

    let model = this;

    // Definite nella dase di link:
    // model.managedAnnotations  -> Lista di tutte le annotazioni sul frammento
    // model.getAnnotations      -> Recupera le annotazioni

    model.managedAnnotations = [];  // Tutte le annotazioni gestite
    model.activeAnnotations = [];   // Tutte le annotazioni NON filtrate

    model.elementConfig = _elementConfig;
    model.showAnnotations = _showAnnotation;


    /////////////////
    //  Inner fun  //
    /////////////////

    function _showAnnotation(event, annotations) {
        $mdDialog.show({
            controller: _showAnnotationController,
            controllerAs: 'dialog',
            templateUrl: 'js/modules/annotatedText/annotationModalView.html',
            annotations: annotations,
            bindToController: {annotations: annotations},
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true
        });
    }

    function _showAnnotationController() {
        const dialog = this;
        dialog.isFiltered = () => false;
        dialog.delete = (index) => {
            let annot = dialog.annotations[index];

            newAnnotationService.deleteRemote(annot)
                .then(() => $mdToast.showSimple('Annotazione eliminata'))
                .catch(() => $mdToast.showSimple('Whoops! C\'è stato un problema'));
        };
        dialog.edit = (index) => {
            let annot = dialog.annotations[index];

            newAnnotationService.saveLocal(annot);
            newAnnotationService.deleteRemote(annot)
                .then(() => {
                    $mdToast.showSimple('Annotazione spostata in "Annotazioni non salvate"');
                })
                .catch(() => $mdToast.showSimple('Whoops! C\'è stato un problema'));
        };
    }

    function _elementConfig(attrs) {
        let annotationIndexes = attrs.annotations.trim().split(' ');

        model.managedAnnotations = model.getAnnotations({
            indexes: annotationIndexes
        });

        /* Scarta le annotazioni filtrate */
        model.managedAnnotations.forEach((elem) => {
            if (model.isFiltered({item: elem}))
                model.activeAnnotations.push(elem);
        });

    }

}
