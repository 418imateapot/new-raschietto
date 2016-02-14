// Ci sara' un modo piu' carino di importare queste dipendenze...
import Dlib from '../../application/Dlib.js';
import Riviste from '../../application/Riviste.js';

NewAnnotationController.$inject = ['$mdConstant', '$mdDialog', '$stateParams', 'userService', 'newAnnotationService'];

/**
 * Controller per il pulsante 'nuova annotazione'
 */
export default function NewAnnotationController($mdConstant, $mdDialog, $stateParams, userService, newAnnotationService) {

    const model = this;

    model.showModal = _showModal;
    model.isVisible = () => $stateParams.mode === 'annotator';


    ///////////////////////
    //- Inner functions -//
    ///////////////////////


    /**
     * Configura la finestra modale che permette di inserire nuove annotazioni,
     * poi la mostra
     */
    function _showModal(ev) {
        let selection = rangy.getSelection();
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
                path = Riviste.convertFromRaschietto(localPath);
            }
            let focus = selection.focusOffset;
            let anchor = selection.anchorOffset;
            let anchorNode = selection.anchorNode;
            //TODO controllare gli offset che genera
            let start = Math.min(focus, anchor);
            let end = Math.max(focus, anchor);
            if(focus === 0 && anchorNode.nodeType === anchorNode.TEXT_NODE) { // Double click selection?
                end = anchorNode.length;
            }

            // Se non c'è testo selezionato, niente path
            if (selectedText !== '') {
                fragment = {
                    path: _xpath_to_fragment(path),
                    start: start,
                    end: end
                };
            }
        }

        // Configura il modale e poi mostralo
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

    /**
     * Controller per la finestra modale con il form
     * per le nuove annotazioni
     */
    function DialogController(userService) {

        const dialog = this;
        dialog.keys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA]; // Separatori per i nomi
        dialog.cancel = () => $mdDialog.cancel();

        dialog.showFields = (type) => type === dialog.typeSelected;
        dialog.submit = _submit;

        dialog.provenance = {
            name: userService.userName,
            email: userService.userEmail,
            time: new Date()
        };

        //dialog.fragment = fragment;

        // Inizializza il modello
        dialog.annotations = {
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
                cited: {
                    title: dialog.selectedText,
                    authors: [],
                }
            }
        };

        /////////////////////
        // Implementazione //
        /////////////////////

        /**
         * Invia il form al servizio che genera il JSON
         * da mandare al server.
         */
        function _submit() {
            let type = dialog.typeSelected;
            let content = dialog.annotations[type];

            // Pigrizia...
            if(type === 'denotesRethoric') {
                content.rethoric = _expandRethoricURI(content.rethoric);
            }

            content.type = type;
            dialog.provenance.time = new Date();  // Vogliamo l'ora aggiornata
            content.provenance = dialog.provenance;
            content.fragment = dialog.fragment;
            content.url = model.docUrl;
            content.subject = dialog.subject;
            let payload = newAnnotationService.generateAnnotation(content);
            payload = angular.toJson(payload);
            //console.log(payload);
        }

    }

    /////////////
    // Helpers //
    /////////////

    /**
     * Ottieni la selezione corrente
     */
    function _selection() {
        if (window.getSelection) {
            return window.getSelection();
        } else if (document.getSelection) {
            return document.getSelection();
        } else if (document.selection) {
            return document.selection.createRange().text;
        }
    }

    /**
     * Converti un xpath nel formato delimitato
     * da underscore per salvarlo su fuseki
     */
    function _xpath_to_fragment(xpath) {
        xpath = xpath.replace(/^\//, "");
        xpath = xpath.replace(/\//gi, "_");
        xpath = xpath.replace(/\[/gi, "").replace(/\]/gi, "");
        return xpath;
    }

    /**
     * Ottieni l'xpath assoluto di un elemento del DOM
     *
     * @credits: https://stackoverflow.com/questions/2631820/im-storing-click-coordinates-in-my-db-and-then-reloading-them-later-and-showing/2631931#2631931
     *
     * Modificata per ignorare i tag inseriti da raschietto
     */
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

    /**
     * Questa è pura pigrizia
     */
    function _expandRethoricURI(shortUri) {
        let sro = 'http://salt.semanticauthoring.org/ontologies/sro#';
        let deo = 'http://purl.org/spar/deo/';

        return shortUri
                .replace('sro:', sro)
                .replace('deo:', deo);
    }


}
