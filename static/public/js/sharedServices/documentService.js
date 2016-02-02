/**
 * @module teapot/sharedServices/documentService
 * @description
 * Servizio che si occupa delle comunicazioni col server relative ai documenti
 * disponibili.<br/>
 * Può richiedere la lista dei documenti, o il contenuto di uno specifico
 * documento.
 */

documentService.$inject = ['$http'];


/**
 * @namespace
 */
export
default
function documentService($http) {

    return {
        retrieve: retrieve,
        list: list,
        encodeDoi: encodeDoi,
        decodeDoi: decodeDoi,
        findByDoi: findByDoi
    };

    //-- FUNCTION DEFINITIONS --//

    /**
     * @param {string} url L'URL http del documento da recuperare
     * @description
     * Chiede al server tramite una richiesta GET asincrona
     * di scaricare il documento localizzato dall'URL passato
     * come parametro, e di inoltrarlo al client.
     *
     * @return {Promise} Una promessa che, se risolta, restituisce il body del
     * documento richiesto.
     */
    function retrieve(url) {
        return $http({
                url: '/api/docs?url=' + encodeURIComponent(url),
                cache: true
            }).then(response => {
                return {
                    'status': 'ok',
                    'resp': response.data
                };
            })
            .catch(error => {
                return {
                    'status': 'error',
                    'error': error
                };
            });
    }

    /**
     * @function
     * @name list
     *
     * @description
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
                    OPTIONAL{?x prism:hasDOI ?doi.}
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

    /**
     * Queste servono perchè i DOI contengono caratteri "/"
     * che fanno incazzare sia Apache che angular-ui-router,
     * quindi è il caso di sostituirli.
     * NEW: !! Facendo doppio encoding dell'URI gli slash
     * vengono trattati a modo, quindi ci piace cosi'
     */
    function encodeDoi(doi) {
        return encodeURIComponent(encodeURIComponent(doi));
        //return doi.replace(/\//g, "__");
    }
    function decodeDoi(doi) {
        return decodeURIComponent(decodeURIComponent(doi));
        //return doi.replace(/__/g, "/");
    }

    function findByDoi(doi) {
        let promise = this.list().then(function(docs) {
            let result = docs.filter((el) => {
                if (!el.doi) return false; // A volte per sfiga manca il doi
                return el.doi.value === doi;
            });
            if (result === []) return false;
            else return result[0];
        });
        return promise;
    }
}
