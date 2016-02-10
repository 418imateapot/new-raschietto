import Dlib from '../../application/Dlib.js';
import Statistica from '../../application/Statistica.js';

NewAnnotationController.$inject = ['$mdConstant', '$mdDialog', '$stateParams', 'userService', 'newAnnotationService'];

export default function NewAnnotationController($mdConstant, $mdDialog, $stateParams, userService, newAnnotationService) {

    const model = this;


    model.showModal = _showModal;
    model.isVisible = () => $stateParams.mode === 'annotator';


    ///////////////////////
    //- Inner functions -//
    ///////////////////////

    // https://stackoverflow.com/questions/2631820/im-storing-click-coordinates-in-my-db-and-then-reloading-them-later-and-showing/2631931#2631931
    // Modificata per ignorare i tag inseriti da raschietto
    function getPathTo(element) {
        if (element === document.body)
            return element.tagName;

        if (element.className && element.className.match(/anno-?\w+/)) {
            // Se troviamo un elemento inserito da noi,
            // non lo vogliamo nell'xpath
            return getPathTo(element.parentNode);
        }

        var ix = 0;
        var siblings = element.parentNode.childNodes;
        for (var i = 0; i < siblings.length; i++) {
            var sibling = siblings[i];
            if (sibling === element) {
                return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                ix++;
            }
        }
    }


    function _selection() {
        if (window.getSelection) {
            return window.getSelection();
        } else if (document.getSelection) {
            return document.getSelection();
        } else if (document.selection) {
            return document.selection.createRange().text;
        }
    }


    function _xpath_to_fragment(xpath) {
        xpath = xpath.replace(/^\//, "");
        xpath = xpath.replace(/\//gi, "_");
        xpath = xpath.replace(/\[/gi, "").replace(/\]/gi, "");
        return xpath;
    }


    function _showModal(ev) {
        let selection = _selection();
        let selectedText = selection.toString();
        let fragment = null;
        let subject = model.docUrl.replace(/\.html$/, '');
        subject = subject + '_ver1';

        // Probabilmente inutile, ma fragasega
        if (selection.anchorNode) {
            let localPath = getPathTo(selection.anchorNode);
            let path;

            if (model.docUrl.match('dlib')) {
                path = Dlib.convertFromRaschietto(localPath);
            } else {
                path = Statistica.convertFromRaschietto(localPath);
            }
            let focus = selection.focusOffset;
            let anchor = selection.anchorOffset;
            //TODO controllare gli offset che genera
            let start = Math.min(focus, anchor);
            let end = Math.max(focus, anchor);

            // Se non c'è testo selezionato, niente path
            if (selectedText !== '') {
                fragment = {
                    path: _xpath_to_fragment(path),
                    start: start,
                    end: end
                };
            }
        }

        $mdDialog.show({
                controller: DialogController,
                controllerAs: 'dialog',
                //Deps, part.1
                bindToController: {
                    fragment: fragment,
                    subject: subject,
                    selectedText: selectedText
                },//Deps
                templateUrl: 'js/modules/newAnnotation/newAnnotationModal.tmpl.html',
                parent: angular.element(document.body),
                fullscreen: true,
                targetEvent: ev,
                //Deps, part.2
                fragment: fragment,
                subject: subject,
                selectedText: selectedText,
                //Deps
                userService: userService,
                clickOutsideToClose: true
            })
            .then(function(answer) {
                model.status = 'You said the information was "' + answer + '".';
            }, function() {
                model.status = 'You cancelled the dialog.';
            });
    }

    function DialogController(userService) {

        const dialog = this;
        dialog.keys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA]; // Separatori per i nomi

        dialog.showFields = (type) => type === dialog.typeSelected;
        dialog.submit = _submit;

        dialog.provenance = {
            name: userService.userName,
            email: userService.userEmail,
            time: new Date()
        };

        //dialog.fragment = fragment;

        // Inizializza il modello
        dialog.annotation = {
            hasTitle: {
                title: dialog.selectedText
            },
            hasAuthor: {
                authors: dialog.selectedText ? [dialog.selectedText] : []
            },
            hasPublicationYear: {
                // Un preset plausibile
                year: parseInt(dialog.selectedText) || new Date().getFullYear()
            },
            hasURL: {
                url: dialog.selectedText
            },
            hasDOI: {
                doi: dialog.selectedText
            },
            hasComment: {},
            denotesRethoric: {},
            cites: {
                title: dialog.selectedText,
                authors: []
            }
        };

        /////////////////////
        // Implementazione //
        /////////////////////

        function _submit() {
            let type = dialog.typeSelected;
            let content = dialog.annotation[type];
            content.type = type;
            dialog.provenance.time = new Date();  // Vogliamo l'ora aggiornata
            content.provenance = dialog.provenance;
            content.fragment = dialog.fragment;
            content.url = model.docUrl;
            content.subject = dialog.subject;
            let payload = newAnnotationService.generateAnnotation(content);
            payload = angular.toJson(payload);
            console.log(payload);
        }

    }

}
