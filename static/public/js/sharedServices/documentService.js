/**
 * @module teapot/sharedServices/documentService
 * @description
 * Servizio che si occupa delle comunicazioni col server relative ai documenti
 * disponibili.<br/>
 * Può richiedere la lista dei documenti, o il contenuto di uno specifico
 * documento.
 */

documentService.$inject = ['$http', '$rootScope', 'annotationService'];

/**
 * Servizio che si occupa delle attività legate al
 * documento
 */
export default function documentService($http, $rootScope, annotationService) {

    const Dservice = this;

    // Props
    Dservice.currentUrl = '';
    Dservice.currentDoc = '';

    // Methods
    Dservice.retrieve = retrieve;
    Dservice.add = add;
    Dservice.list = list;

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

}
