/** 
 * @module teapot/sharedServices/annotationService
 */
// TODO: Cancella i rami else di debug

annotationService.$inject = ['$http'];

/**
 * @namespace
 *
 * @description
 * Servizio che, dato un url, chiede al triplestore le annotazioni
 * sulla fabio:Expression corrispondente
 *
 * @todo Cancella i rami else di debug
 */
export default function annotationService($http) {
    var promise;

    return {
        query: query,
        tidy: tidy
    };


    /** 
     * @member
     * Restituisce la promessa del risultato di una query gigante
     * sul documento passato come arg.
     * @param String url L'url del documento interessato
     * @returns {Promise} La risposta alla query dallo SPARQL endpoint
     */
    function query(url) {
        // Converti brutalmente da fabio:Item a fabio:Expression
        var expression = url.replace(/\.html$/, "_ver1");
        var encodedQuery = encodeURIComponent(_build_query(expression));
        var endpoint = 'http://tweb2015.cs.unibo.it:8080/data';
        var opts = 'format=json&callback=JSON_CALLBACK';
        var url_string = `${endpoint}?query=${encodedQuery}&${opts}`;
        promise = $http.jsonp(url_string)
            .then(response => {
                return {
                    'status': 'ok',
                    'body': response.data,
                };
            })
            .catch(error => {
                return {
                    'status': 'error',
                    'error': error
                };
            });
        return promise;
    }

    /**
     * @inner
     * Convalida i risultati e li riorganizza
     * in un formato più appetibile
     * @param {Object} data Il risultato in JSON restituito da SPARQL
     * endpoint
     * @returns {Object} Una versione più amichevole dei risultati,
     * purgata delle annotazioni non valide
     */
    function tidy(data) {
            var items = data.results.bindings;
            var result = {
                title: [],
                author: [],
                doi: [],
                pubYear: [],
                url: [],
                comment: [],
                rethoric: [],
                cites: []
            };
            for (var i in items) {
                var elem = items[i];
                var type = elem.type.value;
                switch (type) {
                    case 'hasTitle':
                        if ((elem.predicate.value === 'dcterms:title' ||
                                elem.predicate.value.match(/\"?<?http:\/\/purl.org\/dc\/terms\/title>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#string')) {
                            result.title.push(items[i]);
                        } else {
                            console.warn("Item discarded!");
                        }
                        break;
                    case 'hasAuthor':
                        if (elem.predicate.value === 'dcterms:creator' ||
                            elem.predicate.value.match(/\"?<?http:\/\/purl.org\/dc\/terms\/creator>?\"?/)) {
                            result.author.push(items[i]);
                        } else {
                            console.warn("Item discarded!");
                        }
                        break;
                    case 'hasURL':
                        if ((elem.predicate.value === 'fabio:hasURL' ||
                                elem.predicate.value.match(/\"?<?http:\/\/purl.org\/spar\/fabio\/hasURL>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#anyURL')) {
                            result.url.push(items[i]);
                        } else {
                            console.warn("Item discarded!");
                        }
                        break;
                    case 'hasDOI':
                        if ((elem.predicate.value === 'prism:doi' ||
                                elem.predicate.value.match(/\"?<?http:\/\/prismstandard.org\/namespaces\/basic\/2.0\/doi>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#string')) {
                            result.doi.push(items[i]);
                        } else {
                            console.warn("Item discarded!");
                        }
                        break;
                    case 'hasPublicationYear':
                        if ((elem.predicate.value === 'fabio:hasPublicationYear' ||
                                elem.predicate.value.match(/\"?<?http:\/\/purl.org\/spar\/fabio\/hasPublicationYear>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#date')) {
                            result.pubYear.push(items[i]);
                        } else {
                            console.warn("Item discarded!");
                        }
                        break;
                    case 'hasComment':
                        if ((elem.predicate.value === 'schema:comment' ||
                                elem.predicate.value.match(/\"?<?http:\/\/schema.org\/comment>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#string')) {
                            result.comment.push(items[i]);
                        } else {
                            console.warn("Item discarded!");
                        }
                        break;
                    case 'denotesRethoric':
                        if ((elem.predicate.value === 'sem:denotes' ||
                                elem.predicate.value.match(/\"?<?http:\/\/semanticweb.cs.vu.nl\/2009\/11\/sem\/denotes>?\"?/)) &&
                            _validateRethoric(elem.object.datatype)) {
                            result.rethoric.push(items[i]);
                        } else {
                            console.warn("Item discarded!");
                        }
                        break;
                    case 'cites':
                        if ((elem.predicate.value === 'cito:cites' ||
                            elem.predicate.value.match(/\"?<?http:\/\/purl.org\/spar\/cito\/cites>?\"?/))) {
                            result.cites.push(items[i]);
                        } else {
                            console.warn("Item discarded!");
                        }
                        break;
                    default:
                        continue;
                } // END switch (type)
            } // END for (var i in items)
            return result;
        } // END tidy(data)

    function _build_query(expr) {
        // Usa i nuovi template string di ES6
        return `
        PREFIX oa: <http://www.w3.org/ns/oa#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX frbr: <http://purl.org/vocab/frbr/core#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX raschietto: <http://vitali.web.cs.unibo.it/raschietto/>

        SELECT ?type ?provenance ?predicate ?object ?label ?innerObject ?fragment ?start ?end ?src
        WHERE {
            ?x a oa:Annotation;
                raschietto:type ?type;
                oa:annotatedBy ?provenance;
                oa:hasBody ?body.
            ?body rdf:subject <${expr}>;
                rdf:predicate ?predicate;
                rdf:object ?object.
            OPTIONAL{?object rdfs:label ?label.}
            OPTIONAL{?object rdf:subject ?innerObject. }
            OPTIONAL{
                ?x oa:hasTarget ?target.
                ?target oa:hasSelector ?selector.
                ?target oa:hasSource ?src.
                ?selector rdf:value ?fragment;
                    oa:start ?start;
                    oa:end ?end.
            }
        }
    `; // Sono backtick, non virgolette semplici
    }

    function _validateRethoric(type) {
        switch (type) {
            case 'http://salt.semanticauthoring.org/ontologies/sro#Abstract':
                return true;
            case 'http://salt.semanticauthoring.org/ontologies/sro#Discussion':
                return true;
            case 'http://salt.semanticauthoring.org/ontologies/sro#Conclusion':
                return true;
            case 'http://purl.org/spar/deo/Introduction':
                return true;
            case 'http://purl.org/spar/deo/Materials':
                return true;
            case 'http://purl.org/spar/deo/Methods':
                return true;
            case 'http://purl.org/spar/deo/Results':
                return true;
            default:
                return false;
        }
    }

}
