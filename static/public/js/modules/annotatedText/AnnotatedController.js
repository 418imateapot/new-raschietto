AnnotatedTextController.$inject = ['$scope'];

export default function AnnotatedTextController($scope) {
    let model = this;

    // Definite nella dase di link:
    // model.managedAnnotations  -> Lista di tutte le annotazioni sul frammento
    // model.theSpan             -> L'elemento cui è legata l'annotazione
    // model.getAnnotations      -> Recupera le annotazioni

    model.showAnnotations = _showAnnotation;



    /////////////////
    //  Inner fun  //
    /////////////////

    function _showAnnotation() {

    }

    function filterByGroup(){}    
    function filterByType(){}    
}
