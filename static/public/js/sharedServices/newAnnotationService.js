newAnnotationService.$inject = ['$cookies'];

export default function newAnnotationService($cookies) {

    const service = this;

    service.generateAnnotation = _generateAnnotation;


    ////////////////////
    // Implementation //
    ////////////////////

    function _saveLocal(newAnnotations) {
        $cookies.putObject('pending', newAnnotations);
    }

function _generateAnnotation(data){
  console.log(data);
    if(data.type=='hasAuthor') {
      let  autori=data.authors;
    let results = autori.map(function(val){
      data.authorname = val;
      _generateRealAnnotation(data);
    });
    return results;

    }
      else{ return _generateRealAnnotation(data); }
      }


    function _generateRealAnnotation(data) {
        console.log(data);
        let result = {
            "annotations": [{
                "type": data.type,
                "label": _genLabel(data.type),
                "body": _makeBody(data)
            }],
            "target": {
                "source": data.url, // URL
                "id": data.fragment ? data.fragment.path : '', // Fragment
                "start": data.fragment ? data.fragment.start : '',
                "end": data.fragment ? data.fragment.end : ''
            },
            "provenance": {
                "author": {
                    "name": data.provenance.name,
                    "email": data.provenance.email
                },
                "time": data.provenance.time.toUTCString()
            }
        };

        return result;
    }

    function _makeBody(data) {

        let result = {};

        switch (data.type) {
            case 'hasTitle':
                result = {
                    "label": `Il titolo di questo articolo è ${data.title}`,
                    "subject": data.subject,
                    "predicate": "dcterms:title",
                    "literal": data.title
                };
                break;
            case 'hasPublicationYear':
                result = {
                    "label": `L'anno di pubblicazione di questo articolo è ${data.year}`,
                    "subject": data.subject,
                    "predicate": "fabio:hasPublicationYear",
                    "literal": data.year
                };
                break;
            case 'hasAuthor':
                result = {
                    "label": `Un autore del documento è ${data.authorname}`,
                    "subject": data.subject,
                    "predicate": "dcterms:creator",
                    "literal": data.authorname
                };
                break;
            case 'hasURL':
                result = {
                    "label": `L'URL di questo documento è ${data.url}`,
                    "subject": data.subject,
                    "predicate": "fabio:hasURL",
                    "literal": data.url
                };
                break;
            case 'hasDOI':
                result = {
                    "label": `Il DOI di questo documento è ${data.doi}`,
                    "subject": data.subject,
                    "predicate": "prism:doi",
                    "literal": data.doi
                };
                break;
            case 'hasComment':
                result = {
                    "subject": data.subject,
                    "predicate": "schema:comment",
                    "object": data.comment
                };
                break;
            case 'denotesRethoric':
                result = {
                    //TODO LABEL?
                    "subject": `${data.subject}#${data.fragment.path}-${data.fragment.start}-${data.fragment.end}`, //url+fragment
                    "predicate": "sem:denotes",
                    "resource": data.rethoric
                };
                break;
            case 'cites':
                result = {
                    "label": `Questo articolo cita ‘${data.title}’`,
                    "subject": data.subject,
                    "predicate": "cito:cites",
                    "resource": {
                        "id": data.subject + '_cited_',
                        "label": "sometext"
                    }
                };
                break;
        }
        return result;
    }

    /*
            "label": "Questo articolo cita ‘Institutional repositories, open access, and scholarly communication: A study of conflicting paradigms.’",
            "subject": "dlib:03moulaison_ver1",
            "predicate": "cito:cites",
            "resource": {
                "id": "dlib:03moulaison_ver1_cited_3",
                "label": "[3] Cullen, R., & Chawner, B. (2011). Institutional repositories, open access, and scholarly communication: A study of conflicting paradigms. The Journal of Academic Librarianship, 37(6), 460-470. http://doi.org/10.1016/j.acalib.2011.07.002"
    */

    // Copiaincollata per pigrizia...
    function _genLabel(type) {
        switch (type) {
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

}
