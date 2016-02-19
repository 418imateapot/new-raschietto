// Ci sara' un modo piu' carino di importare queste dipendenze...
import Dlib from '../../sharedServices/Dlib.js';
import Riviste from '../../sharedServices/Riviste.js';

import EditorController from './AnnotationEditorController.js';

NewAnnotationController.$inject = ['$rootScope', '$mdConstant', '$mdDialog', '$stateParams', '$mdToast', 'documentService', 'userService', 'utilityService', 'selectionService'];

/**
 * Controller per il pulsante 'nuova annotazione'
 */
export
default
function NewAnnotationController($rootScope, $mdConstant, $mdDialog, $stateParams, $mdToast, documentService, userService, utilityService, selectionService) {

    const model = this;

    model.showModal = _showModal;
    model.isVisible = () => $stateParams.mode === 'annotator';


    ///////////////////////
    //- Implementazione -//
    ///////////////////////

    /**
     * Recupera le informazioni sul frammento da annotare,
     * poi chiama il modale con l'editor delle annotazioni.
     */
    function _showModal(ev) {
        let selection = rangy.getSelection();
        let selectedText = selection.toString();
        let target = selectionService.initSelection(selection);
        console.info(selection);
        console.info(target);

        // Configura il modale e poi mostralo
        $mdDialog.show({
            controller: EditorController,
            controllerAs: 'editor',
            //Deps, part.1
            bindToController: {
                target: target,
                selectedText: selectedText
            }, //Deps
            templateUrl: 'js/modules/annotationEditor/annotationEditorView.html',
            parent: angular.element(document.body),
            fullscreen: true,
            targetEvent: ev,
            //Deps, part.2
            target: target,
            selectedText: selectedText,
            //Deps
            userService: userService,
            clickOutsideToClose: true
        });
        /*
        .then(function(answer) {
            $rootScope.$broadcast('force_reload', {
                doc_url: model.docUrl
            });
            $state.go('.', {}, {
                reload: true
            });
        }, function() {
            model.status = 'You cancelled the dialog.';
        });
        */
    }

}
