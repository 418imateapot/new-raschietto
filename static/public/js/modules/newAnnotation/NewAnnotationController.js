NewAnnotationController.$inject = ['$mdDialog', '$stateParams'];

export default function NewAnnotationController($mdDialog, $stateParams) {

    const model = this;

    model.showModal = _showModal;
    model.isVisible = () => $stateParams.mode === 'annotator';


    ///////////////////////
    //- Inner functions -//
    ///////////////////////

    function _showModal(ev) {
        $mdDialog.show({
                controller: DialogController,
                templateUrl: 'js/modules/newAnnotation/newAnnotationModal.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
            .then(function(answer) {
                model.status = 'You said the information was "' + answer + '".';
            }, function() {
                model.status = 'You cancelled the dialog.';
            });
    }

    function DialogController() {

        const dialog = this;

    }

}
