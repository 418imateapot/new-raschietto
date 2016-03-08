AnnotationCardController.$inject = ['$sanitize', '$state', 'userService', 'newAnnotationService','$stateParams'];
export default function AnnotationCardController($sanitize, $state, userService, newAnnotationService, $stateParams) {

    var model = this;
    model.time= model.annotation.provenance.time;
    model.icon = '';
    model.header = '';
    model.email = model.annotation.provenance.author.email;
    model.author = model.annotation.provenance.author.name || model.email;
    model.text = '';
    model.avatarColor = '';
    model.isCitationAnn = 'citationAnnNO';
    //model.delete -> passata dallo scope esterno
    model.isDeleteable = (model.delete !== 'false' && ($stateParams.mode !== 'reader'));
    model.isEditable = ((model.edit !== 'false' && ($stateParams.mode !== 'reader'))&&
                        (model.email === userService.userEmail ||
                        model.email ===  'scraper@ltw1543'));

    _init();


    function _init() {

        switch (model.annotation.type) {
            case 'hasTitle':
                model.avatarColor = 'card_hasTitle';
                model.icon = 'T';
                model.header = 'Titolo del documento';
                if (String(model.annotation.content.subject).includes('cited')) {
                    model.header += ' citato';
                    model.isCitationAnn = 'citationAnnYES';
                }
                model.text = model.annotation.content.label;
                break;
            case 'hasAuthor':
                model.avatarColor = 'card_hasAuthor';
                model.icon = 'Au';
                model.header = 'Autore del documento';
                if (String(model.annotation.content.subject).includes('cited')) {
                    model.header += ' citato';
                    model.isCitationAnn = 'citationAnnYES';
                }
                model.text = model.annotation.content.label;
                break;
            case 'hasURL':
                model.avatarColor = 'card_hasURL';
                model.icon = 'U';
                model.header = 'URL del documento';
                if (String(model.annotation.content.subject).includes('cited')) {
                    model.header += ' citato';
                    model.isCitationAnn = 'citationAnnYES';
                }
                model.text = model.annotation.content.label;
                break;
            case 'hasDOI':
                model.avatarColor = 'card_hasDOI';
                model.icon = 'D';
                model.header = 'DOI del documento';
                if (String(model.annotation.content.subject).includes('cited')) {
                    model.header += ' citato';
                    model.isCitationAnn = 'citationAnnYES';
                }
                model.text = model.annotation.content.label;
                break;
            case 'hasPublicationYear':
                model.avatarColor = 'card_hasPublicationYear';
                model.icon = 'Y';
                model.header = 'Anno di pubblicazione del documento';
                if (String(model.annotation.content.subject).includes('cited')) {
                    model.header += ' citato';
                    model.isCitationAnn = 'citationAnnYES';
                }
                model.text = model.annotation.content.label;
                break;
            case 'denotesRhetoric':
                model.avatarColor = 'card_denotesRhetoric';
                model.icon = 'R';
                model.header= 'Funzione retorica';
                model.text = model.annotation.content.label;
                break;
            case 'hasComment':
                model.avatarColor = 'card_hasComment';
                model.icon = 'Com';
                model.header= 'Commento';
                model.text = model.annotation.content.label;
                break;
            case 'cites':
                model.avatarColor = 'card_cites';
                model.icon = 'Cit';
                model.header= 'Citazione';
                model.text = model.annotation.content.label;
                break;
        }
    }

}
