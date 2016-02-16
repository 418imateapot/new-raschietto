/**
 * @module teapot/sharedServices/annotationService
 */
// TODO: Cancella i rami else di debug

annotationService.$inject = ['$http', 'utilityService', 'documentService'];

/**
 * Servizio che, dato un url, chiede al triplestore le annotazioni
 * sulla fabio:Expression corrispondente
 */
export
default
function annotationService($http, utilityService, documentService) {

    const service = this;

    // Props
    service.annotations = null;
    // Methods
    service.query = _query;
    service.tidy = _tidy;
    service.scrape = _scrape;


    function _scrape(doi) {
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
     * Restituisce la promessa del risultato di una query gigante
     * sul documento passato come arg.
     */
    function _query(url) {
        const encodedQuery = encodeURIComponent(_build_query(expr));
        const endpoint = 'http://tweb2015.cs.unibo.it:8080/data';
        //var endpoint = 'http://localhost:3030/data';
        const opts = 'format=json&callback=JSON_CALLBACK';
        const url_string = `${endpoint}?query=${encodedQuery}&${opts}`;

        return $http.jsonp(url_string)
            .then(response => {
                service.annotations = service.tidy(response.data);
                return service.annotations;
            })
            .catch(error => {
                console.error(err);
                service.annotations = null;
                return null;
            });
    }



    /**
     * Convalida i risultati e li riorganizza
     * in un formato più appetibile
     */
    function _tidy(data) {
        let items = data.results.bindings;
        let result = [];
        for (let i in items) {
            let elem = items[i];
            let annotation = {};
            annotation.group = elem.group.value;

            // Genera type/typelabel se non esistono
            if (!elem.type && !elem.typeLabel) {
                // Dobbiamo poter dedurre il tipo in qualche modo..
                continue;
            } else if (!elem.type) {
                annotation.typeLabel = elem.typeLabel.value;
                annotation.type = utilityService.typeFromLabel(elem.typeLabel.value);
            } else if (!elem.typeLabel) {
                annotation.type = elem.type.value;
                annotation.typeLabel = utilityService.labelFromType(elem.type.value);
            }

            annotation.value = _setValue(elem, annotation.type);
            if(!annotation.value) {
                // Non possiamo usarla
                console.log('annotationService: annotazione scartata');
                continue;
            }

            annotation.target = {
                source: elem.src.value,
                id: elem.fragment.value,
                start: elem.start.value,
                end: elem.end.value
            };

            annotation.provenance = {
                author: {
                    name: elem.provenanceLabel.value,
                    mail: elem.provenanceMail.value
                },
                time: elem.time.value
            };

            // Ed ecco la nostra nuova annotazione splendente
            result.push(annotation);
        } // END for (i in items)
        return result;
    }

    function _setValue(annot, type) {
        let result = {};
        switch (type) {
            case 'hasTitle':
            case 'hasPublicationYear':
            case 'hasDOI':
            case 'hasURL':
            case 'hasComment':
            case 'denotesRethoric':
                result.value = annot.object.value;
                result.label = annot.bodyLabel ? annot.bodyLabel.value : undefined;
                break;
            case 'hasAuthor':
                result.value = annot.objectLabel.value;
                result.label = annot.bodyLabel ? annot.bodyLabel.value : undefined;
                break;
            case 'cites':
                result.value = annot.objectLabel.value;
                result.label = annot.bodyLabel ? annot.bodyLabel.value : undefined;
                result.cited = annot.object.value;
                break;
            default:
                return null;
        }
    }

    function _build_query(url) {
        // Usa i nuovi template string di ES6
        return `
PREFIX oa: <http://www.w3.org/ns/oa#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX frbr: <http://purl.org/vocab/frbr/core#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX raschietto: <http://vitali.web.cs.unibo.it/raschietto/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?group ?type ?typeLabel ?subject ?provenance ?provenanceLabel ?time ?predicate ?object ?objectLabel ?bodyLabel ?innerObject ?fragment ?start ?end ?src
WHERE {
    GRAPH ?group {
        ?x a oa:Annotation;
            oa:hasTarget ?target.
        ?target oa:hasSource <${url}>.
    ?x oa:annotatedBy ?provenance;
        oa:hasBody ?body.
    ?body rdf:subject ?subject.
    OPTIONAL {?x oa:annotatedAt ?time.}
    OPTIONAL {?x raschietto:type ?type.}
    OPTIONAL {?x rdfs:label ?typeLabel.}
    OPTIONAL {?provenance foaf:name ?provenanceLabel.}
    ?body rdf:subject ?subject;
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
}
`; // Sono backtick, non virgolette semplici
    }

    function _validateRethoric(type) {
        let valid = [
            'http://salt.semanticauthoring.org/ontologies/sro#Abstract',
            'http://salt.semanticauthoring.org/ontologies/sro#Discussion',
            'http://salt.semanticauthoring.org/ontologies/sro#Conclusion',
            'http://purl.org/spar/deo/Introduction',
            'http://purl.org/spar/deo/Materials',
            'http://purl.org/spar/deo/Methods',
            'http://purl.org/spar/deo/Results',
            'sro#Abstract',
            'sro#Discussion',
            'sro#Conclusion',
            'deo/Introduction',
            'deo/Materials',
            'deo/Methods',
            'deo/Results'
        ];

        if (valid.indexOf(type) !== -1)
            return true;
        else
            return false;
    }

}
