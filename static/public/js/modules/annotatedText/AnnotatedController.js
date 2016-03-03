/**
 *  rangeinfo = {
 *      rangeBookmark: bookmark,
 *      type: string,
 *      annotations: array,
 *      indexes: array
 *  };
 */

AnnotatedTextController.$inject = ['$scope', '$mdDialog', 'annotationService', 'newAnnotationService', 'selectionService'];

export
default

function AnnotatedTextController($scope, $mdDialog, annotationService, newAnnotationService, selectionService) {

    let model = this;

    // Definite nella dase di link:
    // model.managedAnnotations  -> Lista di tutte le annotazioni sul frammento
    // model.getAnnotations      -> Recupera le annotazioni

    model.managedAnnotations = []; // Tutte le annotazioni gestite
    //model.activeAnnotations = []; // Tutte le annotazioni NON filtrate

    model.showAnnotations = _showAnnotation;

    $scope.$on('filter_toggled', _applyFilters);


    /////////////////
    //  Inner fun  //
    /////////////////

    function _showAnnotation(event, annotationIndexes) {
        let annotations = annotationIndexes.map(i => model.managedAnnotations[i]);
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

        // Pagination vars
        dialog.currentPage = 1;
        dialog.pagesize = 10;
    }

    function _applyFilters () {
        let applier = rangy.createClassApplier('filtered');
        model.rangesInfo.forEach(rInfo => {
            let isActive = rInfo.annotations.reduce((prev, curr) => {
                return prev || !annotationService.isFiltered(curr);
            }, false);
            if (!isActive) {
                let range = rangy.createRange();
                range.moveToBookmark(rInfo.rangeBookmark);
                applier.applyToRange(range);
            } else {
                let range = rangy.createRange();
                range.moveToBookmark(rInfo.rangeBookmark);
                applier.undoToRange(range);
            }
        });

    }
}
