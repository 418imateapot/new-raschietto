AnnotatedTextController.$inject = ['$scope', '$mdDialog'];

export default function AnnotatedTextController($scope, $mdDialog) {

    let model = this;

    // Definite nella dase di link:
    // model.managedAnnotations  -> Lista di tutte le annotazioni sul frammento
    // model.theSpan             -> L'elemento cui è legata l'annotazione
    // model.getAnnotations      -> Recupera le annotazioni

    model.managedAnnotations = [];  // Tutte le annotazioni gestite
    model.activeAnnotations = [];   // Tutte le annotazioni NON filtrate

    model.elementConfig = _elementConfig;
    model.showAnnotations = _showAnnotation;


    /////////////////
    //  Inner fun  //
    /////////////////

    function _showAnnotation(event) {
        event.preventDefault();
        $mdDialog.show({
            controller: function(){},
            controllerAs: 'dialog',
            templateUrl: 'js/modules/annotatedText/annotationModalView.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true
        });
        console.log(model.activeAnnotations);
    }

    function _elementConfig(attrs) {
        let annotationIndexes = attrs.annotations.trim().split(' ');
        let minStartRange = 0;
        let maxEndRange = 0;
        let annoType = '';

        model.managedAnnotations = model.getAnnotations({
            indexes: annotationIndexes
        });

        /* Scarta le annotazioni filtrate */
        model.managedAnnotations.forEach((elem) => {
            if (model.isFiltered({item: elem}))
                model.activeAnnotations.push(elem);
        });

        /* Individua il range più grande delle annotazioni  *
         * su questo elemento, inoltra determina il tipo    */
        model.activeAnnotations.forEach((elem, index) => {
            if (index === 0) {
                minStartRange = elem.start.value;
                maxEndRange = elem.end.value;
                annoType = elem.type.value;
            } else {
                minStartRange = (minStartRange < elem.start.value) ? minStartRange : elem.start.value;
                maxEndRange = (maxEndRange > elem.end.value) ? maxEndRange : elem.end.value;
                annoType = (annoType === elem.type.value) ? annoType : 'mixed';
            }
        });

        return {
            minStartRange: minStartRange,
            maxEndRange: maxEndRange,
            annoType: annoType
        };
    }

}
