// Ci sara' un modo piu' carino di importare queste dipendenze...
import Dlib from '../../application/Dlib.js';
import Riviste from '../../application/Riviste.js';

import EditorController from './AnnotationEditorController.js';

ModifyAnnotationController.$inject = ['$rootScope', '$mdConstant', '$mdDialog', '$stateParams', '$mdToast', 'documentService', 'userService', 'utilityService'];

/**
 * Controller per il pulsante 'nuova annotazione'
 */
export
default
function ModifyAnnotationController($rootScope, $mdConstant, $mdDialog, $stateParams, $mdToast, documentService, userService, utilityService) {

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
        let src = documentService.currentUrl;

        // Crea un target vuoto
        // Se non abbiamo una selezione, teniamo questo
        let target = {
            source: src,
            id: '',
            start: '',
            end: ''
        };

        if (selection.anchorNode && selectedText) {
            let localPath = utilityService.getXPathTo(selection.anchorNode);
            let path;

            if (src.match('dlib')) {
                path = Dlib.convertFromRaschietto(localPath);
            } else {
                path = Riviste.convertFromRaschietto(localPath);
            }
            let focus = selection.focusOffset;
            let anchor = selection.anchorOffset;
            let anchorNode = selection.anchorNode;
            //TODO controllare gli offset che genera
            let start = Math.min(focus, anchor);
            let end = Math.max(focus, anchor);
            if (focus === 0 && anchorNode.nodeType === anchorNode.TEXT_NODE) { // Double click selection?
                end = anchorNode.length;
            }

            // Dato che abbiamo una selezione, riempiamo il target
            target = {
                source: src,
                id: utilityService.xpath_to_fragment(path),
                start: start,
                end: end
            };
        }
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

    }

}
