ApplicationController.$inject = ['$scope', '$stateParams', '$compile', 'documentService', 'annotationService', 'userService', 'appService'];

export default function ApplicationController($scope, $stateParams, $compile, documentService, annotationService, userService, appService) {

    let model = this;

    model.user = '';
    model.content = '';
    model.annotations = [];
    model.filters = _initFilters(); //Se un tipo/gruppo non appartiene al set, va filtrato
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

    // Se c'è un login, aggiornare l'utente
    $scope.$on('login', (ev, args) => {
        model.user = args.user || '';
    });

    $scope.$on('logout', (ev, args) => {
        model.user =  '';
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

    function _initFilters() {
        let groupFilters = new Map();
        let filters = {
            'hasTitle': {
                name: 'Titolo',
                display: true
            },
            'hasAuthor': {
                name: 'Autore',
                display: true
            },
            'hasPublicationYear': {
                name: 'Anno di Pubblicazione',
                display: true
            },
            'hasURL': {
                name: 'URL',
                display: true
            },
            'hasDOI': {
                name: 'DOI',
                display: true
            },
            'hasComment': {
                name: 'Commento',
                display: true
            },
            'denotesRethoric': {
                name: 'Retorica',
                display: true
            },
            'cites': {
                name: 'Citazione',
                display: true
            }
        };

        model.annotations.forEach(item => {
            // La chiave e' la mail, il valore il nome -se esiste- se no la
            // mail di nuovo
            if (groupFilters.has(item.provenance.value)) return;
            let name = item.groupName ? item.groupName.value : item.provenance.value;
            groupFilters.set(item.provenance.value, name);
        });

        for (let [k, v] of groupFilters) {
            filters[k] = {
                name: v,
                display: 'true'
            };
        }

        return filters;
    }

    /**
     * Data un'annotazione, verifica se esiste un filtro che
     * impedisce di visualizzarla
     * @param {object} item L'annotazione da filtrare
     * @return {bool} true se l'annotazione va filtrata
     */
    function _isFiltered(item) {
        // se l'oggetto ha display: false non va visualizzato
        return model.filters[item.type.value].display &&
            model.filters[item.provenance.value].display;
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
                    model.filters = _initFilters(); // crea i filtri in base ai gruppi
                    _highlight();
                });
            });
    }

    /**
     * Crea una direttiva per ciascun frammento
     * annotato, la quale si occupa poi del suo
     * comportamento.
     */
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

        // Compila i nuovi elementi
        newElements.forEach((el) => $compile(el)($scope));
    }

}
