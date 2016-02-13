AnnotationCardController.$inject = ['$sanitize', '$state', 'userService', 'newAnnotationService'];
export
default
function AnnotationCardController($sanitize, $state, userService, newAnnotationService) {

    var model = this;

    model.icon = '';
    model.header = '';
    model.provenance = '';
    model.email = '';
    model.text = '';
    model.isEditable = () => model.annotation.provenance.value === userService.userEmail;
    model.delete = _delete;

    _init();

    function _init() {

        // Elimina il prefisso 'mailto:' dalla provenance, se presente
        model.email = model.annotation.provenance.value;

        if (model.annotation.groupName) {
            model.provenance = model.annotation.groupName.value;
        } else {
            model.provenance = model.email.replace(/mailto:(.*)/, '$1');
        }

        switch (model.annotation.type.value) {
            case 'hasTitle':
                model.icon = '&nbsp;T';
                model.header = 'Titolo del documento';
                model.text = model.annotation.object.value;
                break;
            case 'hasAuthor':
                model.icon = 'Au';
                model.header = 'Autore del documento';
                if (model.annotation.bodyLabel) {
                    model.text = model.annotation.bodyLabel.value;
                } else if(model.annotation.objectLabel){
                    model.text = model.annotation.objectLabel.value;
                } else {
                    // Meglio l'abbreviazione che niente
                    model.text = model.annotation.object.value.split('/').pop();
                }
                break;
            case 'hasURL':
                model.icon = '&nbsp;U';
                model.header = 'URL del documento';
                model.text = model.annotation.object.value;
                break;
            case 'hasDOI':
                model.icon = '&nbsp;D';
                model.header = 'DOI del documento';
                model.text = model.annotation.object.value;
                break;
            case 'hasPublicationYear':
                model.icon = '&nbsp;Y';
                model.header = 'Anno di pubblicazione';
                model.text = model.annotation.object.value;
                break;
            case 'denotesRethoric':
                model.icon = '&nbsp;R';
                model.header= 'Funzione retorica';
                model.text = model.annotation.bodyLabel.value;
                break;
            case 'hasComment':
                model.icon = 'Com';
                model.header= 'Commento';
                model.text = model.annotation.bodyLabel.value;
                break;
            case 'cites':
                model.icon = 'Cit';
                model.header= 'Citazione';
                model.text = model.annotation.bodyLabel.value;
                break;
        }
    }

    function _delete() {
        newAnnotationService.delete(model.annotation);
        model.refresh();
        $state.go('.', {}, {reload: true});
    }

}
