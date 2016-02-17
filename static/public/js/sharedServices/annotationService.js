/**
 * @module teapot/sharedServices/annotationService
 */
// TODO: Cancella i rami else di debug

annotationService.$inject = ['$http', 'utilityService'];

/**
 * Servizio che, dato un url, chiede al triplestore le annotazioni
 * sulla fabio:Expression corrispondente
 */
export
default
function annotationService($http, utilityService) {

    const service = this;

    // Props
    service.annotations = null;
    service.currentUrl = null;
    service.filters = new Map();
    // Methods
    service.query = _query;
    service.tidy = _tidy;
    //service.scrape = _scrape;


    /*
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
*/

    /**
     * Restituisce la promessa del risultato di una query gigante
     * sul documento passato come arg.
     */
    function _query(url) {
        const encodedQuery = encodeURIComponent(_build_query(url));
        const endpoint = 'http://tweb2015.cs.unibo.it:8080/data';
        //var endpoint = 'http://localhost:3030/data';
        const opts = 'format=json&callback=JSON_CALLBACK';
        const url_string = `${endpoint}?query=${encodedQuery}&${opts}`;

        return $http.jsonp(url_string)
            .then(response => {
                service.annotations = service.tidy(response.data);
                service.currentUrl = url;
                return service.annotations;
            })
            .catch(error => {
                console.error(error);
                service.annotations = null;
                service.currentUrl = null;
                return null;
            });
    }



    /**
     * Convalida i risultati e li riorganizza
     * in un formato più appetibile
     * Inoltre inizializza i filtri
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
                console.log('Nessuna informazione di tipo');
                continue;
            } else if (!elem.type) {
                annotation.typeLabel = elem.typeLabel.value;
                annotation.type = utilityService.typeFromLabel(elem.typeLabel.value);
            } else if (!elem.typeLabel) {
                annotation.type = elem.type.value;
                annotation.typeLabel = utilityService.labelFromType(elem.type.value);
            } else {
                // Sappiamo già tutto, ci fidiamo?
                annotation.type = elem.type.value;
                annotation.typeLabel = elem.typeLabel.value;
            }

            annotation.target = {
                source: elem.src.value,
                id: _normalizeFragment(elem.fragment.value),
                start: elem.start.value,
                end: elem.end.value
            };

            annotation.provenance = {
                author: {
                    name: elem.provenanceLabel.value || elem.provenanceMail.value,
                    mail: elem.provenanceMail.value
                },
                time: elem.time.value
            };

            annotation.content = _setContent(elem, annotation.type);
            if(!annotation.content) {
                // Non possiamo usarla
                console.log('annotationService: annotazione scartata - ' + annotation);
                continue;
            }

            // Aggiungi i filtri per quest'annotazione al set
            service.filters.set(annotation.group, {display: true, type: 'group'});
            service.filters.set(annotation.type, {display: true, type: 'type'});
            service.filters.set(annotation.provenance.author.name, {display: true, type: 'provenance'});
            // Ed ecco la nostra nuova annotazione splendente
            result.push(annotation);
        } // END for (i in items)
        return result;
    }

    function _setContent(annot, type) {
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
                result.subject = annot.subject.value;
                result.object = annot.object.value;
                break;
            case 'hasAuthor':
                result.label = annot.bodyLabel ? annot.bodyLabel.value : undefined;
                result.value = annot.objectLabel ? annot.objectLabel.value : result.label;
                result.subject = annot.subject.value;
                if (annot.innerObject) {
                    result.object = annot.innerObject.value;
                }
                if (!result.object && annot.object) {
                    result.object =annot.object.value.match(/person/) ? annot.object.value : undefined;
                }
                if(!result.object) {
                    // Chi cavolo è costui?
                    result = null;
                }
                break;
            case 'cites':
                if (annot.objectLabel) {
                    result.value = annot.objectLabel.value;
                } else if(annot.bodyLabel) {
                    result.value = annot.bodyLabel.value;
                } else {
                    console.warn('Non so che fare con questa citazione');
                    return null;
                }
                result.label = annot.bodyLabel ? annot.bodyLabel.value : undefined;
                result.cited = annot.object.value;
                break;
            default:
                result = null;
        }
        return result;
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
PREFIX schema: <http://schema.org/>

SELECT ?group ?type ?typeLabel ?subject ?provenanceMail ?provenanceLabel ?time ?predicate ?object ?objectLabel ?bodyLabel ?innerObject ?fragment ?start ?end ?src
WHERE {
    GRAPH ?group {
        ?x a oa:Annotation;
            oa:hasTarget ?target.
        ?target oa:hasSource <${url}>.
        ?x oa:annotatedBy ?provenance;
            oa:hasBody ?body;
            oa:annotatedAt ?time.
        ?provenance schema:email ?provenanceMail.
        ?body rdf:subject ?subject;
            rdf:predicate ?predicate;
            rdf:object ?object.
        ?x oa:hasTarget ?target.
        ?target oa:hasSelector ?selector.
        ?target oa:hasSource ?src.
        ?selector rdf:value ?fragment;
            oa:start ?start;
            oa:end ?end.
        OPTIONAL {?x raschietto:type ?type.}
        OPTIONAL {?x rdfs:label ?typeLabel.}
        OPTIONAL {?provenance foaf:name ?provenanceLabel.}
        OPTIONAL{?body rdfs:label ?bodyLabel.}
        OPTIONAL{?object rdfs:label ?objectLabel.}
        OPTIONAL{?object rdf:subject ?innerObject. }
    }
}
`; // Sono backtick, non virgolette semplici
    }

    function _normalizeFragment(fragment) {
        const possibleValues = [
            '',
            'document',
            'body',
            'html',
            'html/body',
            '/html/body',
            '//body',
        ];
        return (possibleValues.indexOf(fragment) === -1) ? fragment : '';
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
