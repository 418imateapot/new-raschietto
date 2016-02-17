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

        model.provenance.time = new Date(); // Vogliamo l'ora aggiornata
        annotation.provenance = model.provenance;
        annotation.target = model.target;

        _fillTheBlanks(annotation);

        // TODO 
        // if author -> separa l'annotazione
        // if cites ->  crea le multi annotazioni

        newAnnotationService.saveLocal(annotation);

        $mdToast.showSimple('Annotazione creata localmente.');
        $mdDialog.hide();
    }

    function _fillTheBlanks(annot) {
        annot.typeLabel = utilityService.labelFromType(annot.type);
        annot.group = 'http://vitali.web.cs.unibo.it/raschietto/graph/ltw1543';

        // Genera subject
        let subject = annot.target.source.replace(/\.html$/, '') + '_ver1';
        switch (annot.type) {
            case 'hasTitle':
                annot.content.label = `Il titolo del documento è "${annot.content.value}"`;
                annot.content.object = annot.content.value;
                break;
            case 'hasPublicationYear':
                annot.content.label = `Questo documento è stato pubblicato nel ${annot.content.value}`;
                annot.content.object = annot.content.value;
                break;
            case 'hasAuthor':
                annot.content.label = `Un autore del documento è ${annot.content.value}`;
                annot.content.object = annot.content.value;
                break;
            case 'hasURL':
                annot.content.label = `L'URL del documento è ${annot.content.value}`;
                annot.content.object = annot.content.value;
                break;
            case 'hasDOI':
                annot.content.label = `Il DOI associato a questo documento è ${annot.content.value}`;
                annot.content.object = annot.content.value;
                break;
            case 'hasComment':
                annot.content.label = `${annot.provenance.author.name} ha commentato: ${annot.content.value}`;
                annot.content.object = annot.content.value;
                break;
            case 'denotesRethoric':
                annot.content.value = utilityService.expandRethoricURI(annotation.content.value);
                let humanFriendly = annot.content.value.split('/').pop();
                annot.content.label = `La funzione retorica di questo frammento è "${humanFriendly}"`;
                annot.content.subject = `${subject}#${annot.target.id}-${annot.target.start}-${annot.target.end}`;
                annot.content.object = annot.content.value;
                break;
            case 'cites':
                const num = utilityService.getCitedNumber();
                annot.content.object = `${subject}_cited_${num}`;
                annot.content.value = annot.content.cited.title;
                annot.content.label = `Questo articolo cita ${annot.content.value}`;
                break;
        }
    }

}
