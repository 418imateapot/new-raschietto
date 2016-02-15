newAnnotationService.$inject = ['$http', 'localStorageService'];

export
default

function newAnnotationService($http, localStorageService) {

    const service = this;

    service.generateAnnotation = _generateAnnotation;
    service.saveLocal = _saveLocal;
    service.retrieveLocal = _retrieveLocal;
    service.fusekify = _fusekify;
    service.defusekify = _defusekify;
    //service.delete = _deleteLocal;
    service.updateRemote = _updateRemote;
    service.deleteRemote = _deleteRemote;


    ////////////////////
    // Implementation //
    ////////////////////

    /**
     * Salva annotazioni in localstorage
     * @param {Boolean} overwrite Sovrascrivere le annotazioni esistenti?
     */
    function _saveLocal(newAnnotations, overwrite) {
        let unsaved;
        if(overwrite) {
            unsaved = new Set(newAnnotations);
        } else {
            unsaved = new Set(_retrieveLocal());
            unsaved.add(newAnnotations);
        }
        localStorageService.set('pending', Array.from(unsaved));
        //$cookies.putObject('pending', unsaved);
    }

    function _retrieveLocal() {
        //return $cookies.getObject('pending');
        return localStorageService.get('pending') || [];
    }

    function _deleteRemote() {}
    function _updateRemote(annotationList) {
        annotationList = annotationList.map(anno=>_defusekify(anno));
        return $http.post('/api/annotations', {items: annotationList})
            .then(response => response)
            .catch(err => console.warn(err));
    }

    // UNSAVED = jsonone
    // data = fuseki
    function _deleteLocal(data) {
        let unsaved = _retrieveLocal();
        let local = [];
        for (let i in unsaved) {
           local = local.concat(_separateAnnotations(unsaved[i]));
        }
        let delenda = _defusekify(data);
        local = local.filter(el =>  JSON.stringify(delenda) !== JSON.stringify(el));
        console.log(local);
        localStorageService.set('pending', local);
    }

    function _separateAnnotations(anno) {
        if (anno.annotations.length === 1)
            return [anno];
        return anno.annotations.map(a => {
             return {
                annotations: [a],
                target: anno.target,
                provenance: anno.provenance
            };

        });
    }

    function _fusekify(anno) {
        let result = [];

        result = anno.annotations.map(entry => {
            return {
                bodyLabel: {value: entry.body.label},
                end: {value: anno.target.end},
                fragment: {value: anno.target.id},
                // objectLabel: {value: entry.body.resource ? entry.body.resource.label || entry.body.resource : entry.body.literal},
                objectLabel: {value: entry.body.literal || entry.body.resource.label || entry.body.resource},
                object: {value: entry.body.literal || entry.body.resource.label || entry.body.resource},
                predicate: {value: entry.body.predicate},
                provenance: {value: anno.provenance.author.email},
                provenanceLabel: {value: anno.provenance.author.name},
                src: {value: anno.target.source},
                start: {value: anno.target.start},
                time: {value: anno.provenance.time},
                type: {value: entry.type},
                typeLabel: {value: entry.label}
            };
        });

        return result;
    }


    function _defusekify(data, editFmt) {
        console.warn(data);
        let result = {};
        result.url = data.src.value;
        result.subject = result.url.replace(/\.html$/, '') + '_ver1';
        result.fragment = {
            path: data.fragment.value,
            start: data.start.value,
            end: data.end.value
        };
        result.provenance = {
            name: data.provenanceLabel.value || '',
            email: data.provenance.value,
            time: new Date(data.time.value)
        };
        result.type = data.type.value;
        switch (data.type.value) {
            case 'hasTitle':
                result.title = data.objectLabel.value;
                break;
            case 'hasAuthor':
                result.authors = [data.objectLabel.value];
                break;
            case 'hasPublicationYear':
                result.year = data.objectLabel.value;
                break;
            case 'hasDoi':
                result.doi = data.objectLabel.value;
                break;
            case 'hasURL':
                result.url = data.objectLabel.value;
                break;
            case 'hasComment':
                result.comment = data.objectLabel.value;
                break;
            case 'denotesRethoric':
                result.rethoric = data.objectLabel.value;
                break;
            case 'cites':
                result.cited = {};
                result.cited.title = data.object.label;
                break;
        }
        if (editFmt) return result;
        return _generateAnnotation(result);
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
                let id = data.subject + '_cited_' + _getCitedNumber(data);
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
                // Genera le annotazioni sull'articolo citato
                $.each(data.cited, (k, v) => {
                    let metaData = {
                        subject: id,
                        type: _genType(k)
                    };
                    metaData[k] = v;
                    result = result.concat(_makeAnnotations(metaData));
                });
                break;
            default:
                console.warn("Missing type");
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

    function _getCitedNumber(annot) {
        let tagNum = annot.target.id.match(/\d+$/);
        if(tagNum) {
            return tagNum[0];
        } else {
            return Math.floor(Math.random() * 50);
        }
    }


}
