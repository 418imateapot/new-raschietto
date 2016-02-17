AnnotationEditorController.$inject = ['$mdDialog', '$mdConstant', '$mdToast', 'userService', 'newAnnotationService', 'utilityService'];

export
default

function AnnotationEditorController($mdDialog, $mdConstant, $mdToast, userService, newAnnotationService, utilityService) {

    const model = this;
    model.keys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA]; // Separatori per i nomi
    model.cancel = () => $mdDialog.cancel();

    model.showFields = (type) => type === model.typeSelected;
    model.submit = _submit;

    _init();


    /////////////////////
    // Implementazione //
    /////////////////////

    function _init() {
        model.provenance = {
            author: {
                name: userService.userName,
                mail: userService.userEmail
            },
            time: new Date()
        };

        // Inizializza il modello
        model.annotations = {
            hasTitle: {
                value: model.selectedText
            },
            hasAuthor: {
                value: model.selectedText ? [model.selectedText] : []
            },
            hasPublicationYear: {
                // Un preset plausibile
                value: parseInt(model.selectedText) || new Date().getFullYear()
            },
            hasURL: {
                value: model.selectedText
            },
            hasDOI: {
                value: model.selectedText
            },
            hasComment: {
                value: undefined
            },
            denotesRethoric: {
                value: undefined
            },
            cites: {
                value: model.selectedText,
                cited: {
                    title: model.selectedText,
                    authors: [],
                }
            },
        };
    }


    /**
     * Invia il form al servizio che genera il JSON
     * da mandare al server.
     */
    function _submit() {
        let annotation = {};
        annotation.type = model.typeSelected;
        annotation.content = model.annotations[annotation.type];

        // Pigrizia...
        if (annotation.type === 'denotesRethoric') {
            annotation.content.value = _expandRethoricURI(annotation.content.value);
        }

        model.provenance.time = new Date(); // Vogliamo l'ora aggiornata
        annotation.provenance = model.provenance;
        annotation.target = model.target;

        newAnnotationService.saveLocal(annotation);

        $mdToast.showSimple('Annotazione creata localmente.');
        $mdDialog.hide();
    }


    /**
     * type OK
     * target OK
     * provenance OK
     *
     * value OK TRANNE CIT
     *
     * typelabel
     * group
     * label
     * object
     * subject
     * ?cited?
     *
     */
    function _fillTheBlanks(annot) {
        let typeLabel = utilityService.labelFromType(annot.type);
        let group = 'http://vitali.web.cs.unibo.it/raschietto/graph/ltw1543';

        // Genera subject
        let subject = annot.target.source.replace(/\.html$/, '') + '_ver1';
        switch (annot.type) {
            case 'denotesRethoric':
                subject = `${subject}#${annot.target.id}-${annot.target.start}-${annot.target.end}`;
                break;
            case 'cites':
                let num = utilityService.getCitedNumber();
                subject = `${subject}_cited_${num}`;
                break;
        }


/**
 * value OK TRANNE CIT
 * label
 * object
 * ?cited?
 */
    }


}
