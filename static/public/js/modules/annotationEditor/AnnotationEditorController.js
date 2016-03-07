AnnotationEditorController.$inject = ['$mdDialog', '$mdConstant', '$mdToast', 'userService', 'newAnnotationService', 'utilityService', 'selectionService','annotationService'];

export
default

function AnnotationEditorController($mdDialog, $mdConstant, $mdToast, userService, newAnnotationService, utilityService, selectionService,annotationService) {

    const model = this;
    model.keys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA]; // Separatori per i nomi
    model.cancel = () => $mdDialog.cancel();

    model.showFields = (type) => type === model.typeSelected;
    model.submit = _submit;
    model.editingSelection = false;
    model.editFragment = (ev, toggle) => {
        model.editingSelection = toggle;
    };
    model.setRange = () => {
        let selection = rangy.getSelection();
        model.target = selectionService.initSelection(selection);
        model.editingSelection = false;
        model.selectedText= selection.toString();
    };
    model.cancelEdit = () => model.editingSelection = false;

    if (model.annotation) {
        _initModify();
    } else {
        _initNew();
    }

    console.log(model.annotation);

    /////////////////////
    // Implementazione //
    /////////////////////

    function _initNew() {
        model.provenance = {
            author: {
                name: userService.userName,
                email: userService.userEmail
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
            denotesRhetoric: {
                value: undefined
            },
            cites: {
                value: model.selectedText,
                cited: {
                    title: model.selectedText,
                    authors: [],
                    url: undefined,
                    doi: undefined,
                    year: undefined
                }
            },
        };
    }


        function _initModify() {
            model.provenance = model.annotation.provenance;
            model.target = model.annotation.target;
            model.typeSelected = model.annotation.type;

            model.selectedText = model.annotation.selectedText;

            // Inizializza il modello
            model.annotations = {
                hasTitle: {
                    value: model.annotation.content.value
                },
                hasAuthor: {
                    value: [model.annotation.content.value]
                },
                hasPublicationYear: {
                    // Un preset plausibile
                    value: parseInt(model.annotation.content.value) || new Date().getFullYear()
                },
                hasURL: {
                    value: model.annotation.content.value
                },
                hasDOI: {
                    value: model.annotation.content.value
                },
                hasComment: {
                    value: model.annotation.content.value
                },
                denotesRhetoric: {
                    value: model.annotation.content.value
                },
                cites: {
                    value: model.annotation.content.value,
                    cited: {
                        title: undefined,
                        authors: [],
                        url: undefined,
                        doi: undefined,
                        year: undefined
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
        annotation.selectedText = model.selectedText || undefined;

        model.provenance.time = new Date(); // Vogliamo l'ora aggiornata
        annotation.provenance = model.provenance;
        annotation.target = model.target;

        let annotationsArray = newAnnotationService.fillTheBlanks(annotation);
        console.log(annotationsArray);

        if(model.delete) {
            // model.delete è undefined se
            // stiamo creando una nuova annotazione
            model.delete();
        }

        newAnnotationService.saveLocal(annotationsArray);

        $mdToast.showSimple('Annotazione creata localmente.');
        $mdDialog.hide();
        annotationService.reload();
    }

}
