newAnnotationService.$inject = ['$cookies'];

export
default

function newAnnotationService($cookies) {

    const service = this;

    //service.generateAnnotation = _generateAnnotation;
    service.generateAnnotation = _generateAnnotation;
    service.saveLocal = _saveLocal;
    service.retrieveLocal = _retrieveLocal;
    service.fusekify = _fusekify;


    ////////////////////
    // Implementation //
    ////////////////////

    function _saveLocal(newAnnotations) {
        let unsaved = _retrieveLocal() || [];
        unsaved.push(newAnnotations);
        $cookies.putObject('pending', unsaved);
    }

    function _retrieveLocal() {
        return $cookies.getObject('pending');
    }

    function _fusekify(anno) {
        console.log(anno);
        let result = [];

        result = anno.annotations.map(entry => {
            return {
                bodyLabel: {value: entry.body.label},
                end: {value: anno.target.end},
                fragment: {value: anno.target.id},
                object: {value: ''},
                objectLabel: {value: anno.resource ? anno.resource.label : anno.literal},
                predicate: {value: entry.body.predicate},
                provenance: {value: anno.provenance.author.email},
                src: {value: anno.target.source},
                start: {value: anno.target.start},
                type: {value: entry.type},
                typeLabel: {value: entry.label}
            };
        });

        console.log(result);
        return result;
    }


    function _generateAnnotation(data) {
        let result = {
            "annotations": _makeAnnotations(data),
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
        _saveLocal(result);

        return result;
    }


    function _addTypeInfo(annotations, type) {
        annotations.forEach(obj => {
            obj.type = type;
            obj.label = _genLabel(type);
        });
    }

    function _makeAnnotations(data) {

        let result;

        switch (data.type) {
            case 'hasTitle':
                result = [{
                    "body": {
                        "label": `Il titolo di questo articolo è ${data.title}`,
                        "subject": data.subject,
                        "predicate": "dcterms:title",
                        "literal": data.title
                    }
                }];
                break;
            case 'hasPublicationYear':
                result = [{
                    "body": {
                        "label": `L'anno di pubblicazione di questo articolo è ${data.year}`,
                        "subject": data.subject,
                        "predicate": "fabio:hasPublicationYear",
                        "literal": data.year
                    }
                }];
                break;
            case 'hasAuthor':
                result = data.authors.map(name => {
                    return {
                        "body": {
                            "label": `Un autore del documento è ${name}`,
                            "subject": data.subject,
                            "predicate": "dcterms:creator",
                            "resource": {
                                "label": name
                            }
                        }
                    };
                });
                break;
            case 'hasURL':
                result = [{
                    "body": {
                        "label": `L'URL di questo documento è ${data.url}`,
                        "subject": data.subject,
                        "predicate": "fabio:hasURL",
                        "literal": data.url
                    }
                }];
                break;
            case 'hasDOI':
                result = [{
                    "body": {
                        "label": `Il DOI di questo documento è ${data.doi}`,
                        "subject": data.subject,
                        "predicate": "prism:doi",
                        "literal": data.doi
                    }
                }];
                break;
            case 'hasComment':
                result = [{
                    "body": {
                        "label": `${data.provenance.name || data.provenance.email} ha commentato: '${data.comment}'`,
                        "subject": data.subject,
                        "predicate": "schema:comment",
                        "literal": data.comment
                    }
                }];
                break;
            case 'denotesRethoric':
                result = [{
                    "body": {
                        "label": `La funzione retorica di questo frammento è '${data.rethoric}'`,
                        "subject": `${data.subject}#${data.fragment.path}-${data.fragment.start}-${data.fragment.end}`, //url+fragment
                        "predicate": "http://www.ontologydesignpatterns.org/cp/owl/semiotics.owl#",
                        "resource": data.rethoric
                    }
                }];
                break;
            case 'cites':
                let id = data.subject + '_cited_';
                result = [{
                    // Le citazioni hanno il nome annotato
                    // a mano per evitare danni con le chiamate ricorsive
                    "type": data.type,
                    "label": _genLabel(data.type),
                    "body": {
                        "label": `Questo articolo cita ‘${data.cited.title}’`,
                        "subject": data.subject,
                        "predicate": "cito:cites",
                        "resource": {
                            "id": id,
                            "label": data.cited.title
                        }
                    }
                }];
                $.each(data.cited, (k, v) => {
                    let metaData = {
                        subject: id,
                        type: _genType(k)
                    };
                    console.log(k, metaData.type);
                    metaData[k] = v;
                    result = result.concat(_makeAnnotations(metaData));
                });
                break;
        }
        if(data.type !== 'cites') {
            // Le citazioni hanno gia' il tipo
            _addTypeInfo(result, data.type);
        }
        return result;
    }

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


    function _genType(label) {
        if (/tit/i.test(label)) {
            return 'hasTitle';
        } else if (/pub/i.test(label)) {
            return 'hasPublicationYear';
        } else if (/year/i.test(label)) {
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


}
