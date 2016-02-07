import Dlib from '../../application/Dlib.js';
import Statistica from '../../application/Statistica.js';

NewAnnotationController.$inject = ['$mdDialog', '$stateParams', 'userService', 'newAnnotationService'];

export default function NewAnnotationController($mdDialog, $stateParams, userService, newAnnotationService) {

    const model = this;

    model.showModal = _showModal;
    model.isVisible = () => $stateParams.mode === 'annotator';


    ///////////////////////
    //- Inner functions -//
    ///////////////////////

    // https://stackoverflow.com/questions/2631820/im-storing-click-coordinates-in-my-db-and-then-reloading-them-later-and-showing/2631931#2631931
    function getPathTo(element) {
        if (element === document.body)
            return element.tagName;

        var ix = 0;
        var siblings = element.parentNode.childNodes;
        for (var i = 0; i < siblings.length; i++) {
            var sibling = siblings[i];
            if (sibling === element)
                return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                ix++;
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
        let fragment = null;
        let subject = model.docUrl.replace(/\.html$/, '');
        subject = subject + '_ver1';

        // Probabilmente inutile, ma fragasega
        if (selection.anchorNode) {
            let localPath = getPathTo(selection.anchorNode);

            // TODO Fallo funzionare con statistica
            let path = Dlib.convertFromRaschietto(localPath);
            let focus = selection.focusOffset;
            let anchor = selection.anchorOffset;
            let start = focus < anchor ? focus : anchor;
            let end = focus > anchor ? focus : anchor;

            // Se non c'è testo selezionato => start === end
            if (start !== end) {
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
                bindToController: {
                    fragment: fragment,
                    subject: subject
                },
                templateUrl: 'js/modules/newAnnotation/newAnnotationModal.tmpl.html',
                parent: angular.element(document.body),
                fullscreen: true,
                targetEvent: ev,
                userService: userService,
                fragment: fragment,
                docUrl: model.docUrl,
                subject: subject,
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

        dialog.showFields = (type) => type === dialog.typeSelected;
        dialog.submit = _submit;

        dialog.provenance = {
            name: userService.userName,
            email: userService.userEmail,
            time: new Date()
        };

        //dialog.fragment = fragment;

        dialog.annotation = {
            hasTitle: {},
            hasAuthor: {},
            hasPublicationYear: {},
            hasURL: {},
            hasDOI: {},
            hasComment: {},
            denotesRethoric: {},
            cites: {}
        };

        /////////////////////
        // Implementazione //
        /////////////////////

        function _submit() {
            let type = dialog.typeSelected;
            let content = dialog.annotation[type];
            content.type = type;
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
