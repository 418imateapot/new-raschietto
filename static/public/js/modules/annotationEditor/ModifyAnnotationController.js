// Ci sara' un modo piu' carino di importare queste dipendenze...
import Dlib from '../../sharedServices/Dlib.js';
import Riviste from '../../sharedServices/Riviste.js';

import EditorController from './AnnotationEditorController.js';

ModifyAnnotationController.$inject = ['$rootScope', '$mdConstant', '$mdDialog', '$stateParams', '$mdToast', 'documentService', 'userService', 'utilityService'];

/**
 * Controller per il pulsante 'nuova annotazione'
 */
export default function ModifyAnnotationController($rootScope, $mdConstant, $mdDialog, $stateParams, $mdToast, documentService, userService, utilityService) {

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

        // Configura il modale e poi mostralo
        $mdDialog.show({
            controller: EditorController,
            controllerAs: 'editor',
            //Deps, part.1
            bindToController: {
                annotation: model.annotation,
                delete: model.delete
            }, //Deps
            templateUrl: 'js/modules/annotationEditor/annotationEditorView.html',
            parent: angular.element(document.body),
            fullscreen: true,
            targetEvent: ev,
            //Deps, part.2
            annotation: model.annotation,
            delete: model.delete(),
            //Deps
            userService: userService,
            clickOutsideToClose: true
        });

    }

}
