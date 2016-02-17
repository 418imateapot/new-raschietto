/**
 * Servizio che si occupa delle comunicazioni col server relative ai documenti.
 */

documentService.$inject = ['$http', '$rootScope', '$compile', 'annotationService', 'selectionService'];

/**
 * Servizio che si occupa delle attività legate al
 * documento
 */
export default function documentService($http, $rootScope, $compile, annotationService, selectionService) {

    const Dservice = this;

    // Props
    Dservice.currentUrl = '';
    Dservice.currentDoc = '';

    // Methods
    Dservice.retrieve = retrieve;
    Dservice.add = add;
    Dservice.list = list;
    Dservice.highlight = _highlight;

    //-- FUNCTION DEFINITIONS --//

    /**
     * Chiede al server tramite una richiesta GET asincrona
     * di scaricare il documento localizzato dall'URL passato
     * come parametro, e di inoltrarlo al client.
     *
     * @param {string} url L'URL http del documento da recuperare
     * @return {Promise} Una promessa che, se risolta, restituisce il body del
     * documento richiesto.
     */
    function retrieve(url) {

        console.log(url);

        return $http({
                url: '/api/docs?url=' + encodeURIComponent(url),
                cache: true,
            }).then(response => {
                Dservice.currentUrl = url;
                Dservice.currentDoc = response.data;

                return response.data;
            })
            .catch(error => {
                console.error(error);
                return null;
            });
    }

    /**
     * Interroga il triple store per ottenere una lista dei documenti
     * annotabili e alcuni metadati utili su di essi, ovvero titolo, URL
     * e DOI.
     *
     * @return {Promise} Una promessa che, se risolta, conterrà la lista dei
     * documenti richiesta.
     */
    function list() {
        var query = `
            PREFIX fabio: <http://purl.org/spar/fabio/>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            PREFIX prism: <http://prismstandard.org/namespaces/basic/2.0/>
            SELECT ?url ?title ?doi {
                GRAPH <http://vitali.web.cs.unibo.it/raschietto/graph/ltw1543> {
                    ?x a fabio:Expression;
                        dcterms:title ?title;
                        fabio:hasRepresentation ?url.
                    ?x prism:hasDOI ?doi.
                }
            }`; // Backtick, non virgoletta semplice
        var encodedQuery = encodeURIComponent(query);
        var endpoint = 'http://tweb2015.cs.unibo.it:8080/data';
        var opts = 'format=json&callback=JSON_CALLBACK';
        var query_url = `${endpoint}?query=${encodedQuery}&${opts}`; // ES6 Template String!

        // Recupera i titoli dei doc dal triplestore
        return $http.jsonp(query_url, {
                cache: true
            })
            .then(response => {
                return response.data.results.bindings;
            })
            .catch(err => {
                console.log(err);
            });
    }


    function add(url) {
        return $http.post('/api/docs', {
            url: url
        });
    }

    /**
     * Crea una direttiva per ciascun frammento
     * annotato, la quale si occupa poi del suo
     * comportamento.
     */
    function _highlight(scope) {

        let newElements = [];

        annotationService.annotations.forEach((val, index) => {
            let source, fragment, type, provenance;
            try {
                source = val.target.source.indexOf('dlib') !== -1 ? 'dlib' : 'riviste';
                fragment = val.target.id;
                type = val.type;
                provenance = val.provenance.author.email;
            } catch (e) {
                console.warn('Incomplete annotation?');
                return;
            }

            // elem === false se l'xpath è balordo
            let elem = selectionService.getSelector(fragment, type, source, provenance);
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
            // L'attr annotations mantiene tutti gli indici delle annotazioni
            // che vogliamo
            elem.attr('annotations', `${exsisting_annotations} ${index}`)
                .attr('annotated-text', '');

            // Non vogliamo compilare trenta volte lo stesso elemento
            if (!isAlreadyAnnotated) {
                newElements.push(elem);
            }

        });

        // Compila i nuovi elementi
        newElements.forEach((el) => $compile(el)(scope));
    }

}
