AnnotationCardController.$inject = ['$scope', '$sanitize'];
export default function AnnotationCardController ($scope, $sanitize){

    var model = this;

    model.icon = '';
    model.header = '';
    model.provenance = '';
    model.email = '';
    model.text = '';

    _init();

    function _init() {

        // Elimina il prefisso 'mailto:' dalla provenance, se presente
        model.email = $scope.annotation.provenance.value;
        model.provenance = model.email.replace(/mailto:(.*)/, '$1');

        switch($scope.annotation.type.value) {
            case 'hasTitle':
                model.icon = '&nbsp;T';
                model.header = 'Titolo del documento';
                model.text = $scope.annotation.object.value;
                break;
            case 'hasAuthor':
                model.icon = 'Au';
                model.header = 'Autore del documento';
                model.text = $scope.annotation.label.value;
                break;
            case 'hasURL':
                model.icon = '&nbsp;U';
                model.header = 'URL del documento';
                model.text = $scope.annotation.object.value;
                break;
            case 'hasDOI':
                model.icon = '&nbsp;D';
                model.header = 'DOI del documento';
                model.text = $scope.annotation.object.value;
                break;
            case 'hasPublicationYear':
                model.icon = '&nbsp;Y';
                model.header = 'Anno di pubblicazione';
                model.text = $scope.annotation.object.value;
                break;
            case 'denotesRethoric':
                model.icon = '&nbsp;R';
                break;
            case 'hasComment':
                model.icon = 'Com';
                break;
            case 'cites':
                model.icon = 'Cit';
                break;
            }
    }

}
