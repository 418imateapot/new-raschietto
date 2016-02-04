ApplicationController.$inject = ['$scope', '$stateParams', '$compile', 'documentService', 'annotationService', 'userService', 'appService'];

export
default

function ApplicationController($scope, $stateParams, $compile, documentService, annotationService, userService, appService) {

    let model = this;

    model.user = '';
    model.content = '';
    model.annotations = [];
    model.filters = new Set(); // Se un tipo/gruppo appartiene al set, va filtrato
    model.isFiltered = _isFiltered; // Funzione passata giu' per lo $scope
    model.annotationsLoading = false;
    model.retrieveAnnotations = _getAnnos;
    model.highlight = _highlight;

    //model.showTabDialog = () => {};

    // Grazie mille
    // https://stackoverflow.com/questions/24078535/angularjs-controller-as-syntax-and-watch
    $scope.$watch(() => model.content, () => {
        _load_annotations();
    });

    console.info("Raschietto sta scaldando i motori...");

    //////////////////////////
    //-- Funzioni interne --//
    //////////////////////////


    function _getAnnos(indexes) {
        let result = [];
        for (let i in indexes) {
            result.push(model.annotations[indexes[i]]);
        }
        return result;
    }


    /**
     * Data un'annotazione, verifica se esiste un filtro che
     * impedisce di visualizzarla
     * @param {object} item L'annotazione da filtrare
     * @return {bool} true se l'annotazione va filtrata
     */
    function _isFiltered(item) {
        return model.filters.has(item.type.value) ||
            model.filters.has(item.provenance.value);
    }

    /**
     * Carica le annotazioni del doc corrente
     * interrogando annotationService
     */
    function _load_annotations() {
        if (!$stateParams.doi)
            return;

        model.annotationsLoading = true;
        let decodedDoi = documentService.decodeDoi($stateParams.doi);
        console.info(`MetaArea: Loading DOI=${decodedDoi}`);

        documentService.findByDoi(decodedDoi)
            .then(doc => {
                let url = doc.url.value;
                annotationService.query(url).then(response => {
                    model.annotations = annotationService.tidy(response.body);
                    model.annotationsLoading = false;
                    _highlight();
                });
            });
    }

    function _highlight() {

        let newElements = [];

        model.annotations.forEach((val, index) => {
            let source, fragment, type, provenance;
            try {
                source = val.src.value.indexOf('dlib') !== -1 ? 'dlib' : 'statistica';
                fragment = val.fragment.value;
                type = val.type.value;
                provenance = val.provenance.value;
            } catch (e) {
                console.warn('Malformed annotation?');
                return;
            }

            // elem === false se l'xpath è balordo
            let elem = appService.getSelector(fragment, type, source, provenance);
            if (!elem || !elem.style)
                return; // Per stare dalla parte dei bottoni


            elem = angular.element(elem);
            let isAlreadyAnnotated = false;

            // L'elemento ha annotazioni preesistenti?
            if (elem.attr('annotations') !== undefined) {
                isAlreadyAnnotated = true;
            }
            // aggiungi gli attributi che ci servono
            let exsisting_annotations = elem.attr('annotations') || '';
            elem.attr('annotated-text', 'app.retrieveAnnotations(indexes)')
                .attr('annotations', `${exsisting_annotations} ${index}`) // mantiene tutti gli indici
                .attr('annotation-filters', 'app.isFiltered(item)');

            // Non vogliamo compilare trenta volte lo stesso elemento
            if (!isAlreadyAnnotated) {
                newElements.push(elem);
            }

        });
        /*
            let substring = ae.html().substring(val.start.value, (val.start.value+val.end.value));
            let text = ae.html().replace(substring, `<span class="reddd">${substring}</span>`);
            ae.html(text);
            */

        // Compila i nuovi elementi
        newElements.forEach((el) => $compile(el)($scope));
    }

}
