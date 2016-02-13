/**
 * @module teapot/sharedServices/annotationService
 */
// TODO: Cancella i rami else di debug

annotationService.$inject = ['$http', 'documentService'];

/**
 * @namespace
 *
 * @description
 * Servizio che, dato un url, chiede al triplestore le annotazioni
 * sulla fabio:Expression corrispondente
 *
 * @todo Cancella i rami else di debug
 */
export default function annotationService($http, documentService) {
    var promise;

    return {
        query: query,
        tidy: tidy,
        scrape: scrape
    };


    function scrape(doi) {
        return documentService.findByDoi(documentService.decodeDoi(doi))
            .then(result => {
                let url = encodeURIComponent(result.url.value);
                let request_url = `/api/scraper?url=${url}`;
                return $http.get(request_url)
                   .then(result => result)
                   .catch(err => err);
            })
            .catch(err => err);
    }

    /**
     * @member
     * Restituisce la promessa del risultato di una query gigante
     * sul documento passato come arg.
     * @param String url L'url del documento interessato
     * @returns {Promise} La risposta alla query dallo SPARQL endpoint
     */
    function query(url) {
        // Converti brutalmente da fabio:Item a fabio:Expression
        // Prima elimina il suffisso html, se presente, poi appende _ver1
        var expression = url.replace(/\.html$/, '')
                            .replace(/$/, '_ver1');
        var encodedQuery = encodeURIComponent(_build_query(expression));
        var endpoint = 'http://tweb2015.cs.unibo.it:8080/data';
        //var endpoint = 'http://localhost:3030/data';
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


    function _genLabel(type) {
        switch(type) {
            case 'hasTitle':
                return 'Titolo';
            case 'hasPublicationYear':
                return 'Anno di pubblicazione';
            case 'hasAuthor':
                return 'Autore';
            case 'hasURL':
                return 'URL';
            case 'hasDOI':
                return 'DOI';
            case 'hasComment':
                return 'Commento';
            case 'denotesRethoric':
                return 'Funzione retorica';
            case 'cites':
                return 'Citazione';
        }
        return null;
    }

    function _genType(label) {
            if (/tit/i.test(label)) {
                return 'hasTitle';
            } else if (/pub/i.test(label)) {
                return 'hasPublicationYear';
            } else if (/aut/i.test(label)) {
                return 'hasAuthor';
            } else if (/URL/i.test(label)) {
                return 'hasURL';
            } else if (/DOI/i.test(label)) {
                return 'hasDOI';
            } else if (/comment/i.test(label)) {
                return 'hasComment';
            } else if (/ret/i.test(label)) {
                return 'denotesRethoric';
            } else if (/cit/i.test(label)) {
                return 'cites';
            }
            return null;
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
            let items = data.results.bindings;
            let result = [];
            for (let i in items) {
                let keep = false;
                let elem = items[i];
                // Genera elem.type se non esiste
                if (!elem.type && !elem.typeLabel) {
                    continue;
                } else if (!elem.type) {
                    let type = _genType(elem.typeLabel.value);
                    elem.type = {value: type};
                } else if (!elem.typeLabel) {
                    let label = _genLabel(elem.type.value);
                    elem.typeLabel = {value: label};
                }
                let type = elem.type.value;
                switch (type) {
                    case 'hasTitle':
                        keep = (elem.predicate.value === 'dcterms:title' ||
                                elem.predicate.value.match(/\"?<?http:\/\/purl.org\/dc\/terms\/title>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#string');
                        break;
                    case 'hasAuthor':
                        keep = elem.predicate.value === 'dcterms:creator' ||
                            elem.predicate.value.match(/\"?<?http:\/\/purl.org\/dc\/terms\/creator>?\"?/);
                        break;
                    case 'hasURL':
                        keep = (elem.predicate.value === 'fabio:hasURL' ||
                                elem.predicate.value.match(/\"?<?http:\/\/purl.org\/spar\/fabio\/hasURL>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#anyURL');
                        break;
                    case 'hasDOI':
                        keep = (elem.predicate.value === 'prism:doi' ||
                                elem.predicate.value.match(/\"?<?http:\/\/prismstandard.org\/namespaces\/basic\/2.0\/doi>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#string');
                        break;
                    case 'hasPublicationYear':
                        keep = (elem.predicate.value === 'fabio:hasPublicationYear' ||
                                elem.predicate.value.match(/\"?<?http:\/\/purl.org\/spar\/fabio\/hasPublicationYear>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#date');
                        break;
                    case 'hasComment':
                        keep = (elem.predicate.value === 'schema:comment' ||
                                elem.predicate.value.match(/\"?<?http:\/\/schema.org\/comment>?\"?/)) &&
                            (elem.object.datatype === 'http://www.w3.org/2001/XMLSchema#string');
                        break;
                    case 'denotesRethoric':
                        keep = (elem.predicate.value === 'sem:denotes' ||
                                elem.predicate.value.match(/\"?<?http:\/\/semanticweb.cs.vu.nl\/2009\/11\/sem\/denotes>?\"?/)) &&
                            _validateRethoric(elem.object.datatype);
                        break;
                    case 'cites':
                        keep = (elem.predicate.value === 'cito:cites' ||
                            elem.predicate.value.match(/\"?<?http:\/\/purl.org\/spar\/cito\/cites>?\"?/));
                        break;
                } // END switch (type)
                if (keep) {result.push(elem);}
                //else {console.warn(`discarded`);console.warn(elem);}
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
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?type ?typeLabel ?provenance ?provenanceLabel ?time ?predicate ?object ?objectLabel ?bodyLabel ?innerObject ?fragment ?start ?end ?src
WHERE {
    ?x a oa:Annotation;
        oa:annotatedBy ?provenance;
        oa:hasBody ?body.
    OPTIONAL {?x oa:annotatedAt ?time.}
    OPTIONAL {?x raschietto:type ?type.}
    OPTIONAL {?x rdfs:label ?typeLabel.}
    OPTIONAL {?provenance foaf:name ?provenanceLabel.}
    ?body rdf:subject <${expr}>;
        rdf:predicate ?predicate;
        rdf:object ?object.
    OPTIONAL{?body rdfs:label ?bodyLabel.}
    OPTIONAL{?object rdfs:label ?objectLabel.}
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
