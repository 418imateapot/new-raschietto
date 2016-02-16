AnnotationCardController.$inject = ['$sanitize', '$state', 'userService', 'newAnnotationService'];
export
default
function AnnotationCardController($sanitize, $state, userService, newAnnotationService) {

    var model = this;

    model.icon = '';
    model.header = '';
    model.email = model.annotation.provenance.author.mail;
    model.author = model.annotation.provenance.author.name || model.email;
    model.text = '';
    model.isEditable = (model.email === userService.userEmail);
    //model.delete -> passata dallo scope esterno

    _init();

    function _init() {

        switch (model.annotation.type) {
            case 'hasTitle':
                model.icon = '&nbsp;T';
                model.header = 'Titolo del documento';
                model.text = model.annotation.content.value;
                break;
            case 'hasAuthor':
                model.icon = 'Au';
                model.header = 'Autore del documento';
                model.text = model.annotation.content.label;
                break;
            case 'hasURL':
                model.icon = '&nbsp;U';
                model.header = 'URL del documento';
                model.text = model.annotation.content.value;
                break;
            case 'hasDOI':
                model.icon = '&nbsp;D';
                model.header = 'DOI del documento';
                model.text = model.annotation.content.value;
                break;
            case 'hasPublicationYear':
                model.icon = '&nbsp;Y';
                model.header = 'Anno di pubblicazione';
                model.text = model.annotation.content.value;
                break;
            case 'denotesRethoric':
                model.icon = '&nbsp;R';
                model.header= 'Funzione retorica';
                model.text = model.annotation.content.label;
                break;
            case 'hasComment':
                model.icon = 'Com';
                model.header= 'Commento';
                model.text = model.annotation.content.label;
                break;
            case 'cites':
                model.icon = 'Cit';
                model.header= 'Citazione';
                model.text = model.annotation.content.label;
                break;
        }
    }

    function _delete() {
        newAnnotationService.delete(model.annotation);
        model.refresh();
        $state.reload();
        //$state.go('.', {}, {reload: true});
    }

}
