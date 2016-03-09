import Dlib from './Dlib.js';
import Riviste from './Riviste.js';

newAnnotationService.$inject = ['$rootScope', '$http', 'localStorageService', 'utilityService'];

export default function newAnnotationService($rootScope, $http, localStorageService, utilityService) {

    const service = this;

    service.generateAnnotation = _generateAnnotation;
    service.generateFromScraper = _generateFromScraper;
    service.saveLocal = _saveLocal;
    service.retrieveLocal = _retrieveLocal;
    service.nuke = _deleteLocal;
    service.updateRemote = _updateRemote;
    service.fillTheBlanks = _fillTheBlanks;


    ////////////////////
    // Implementation //
    ////////////////////

    /**
     * Salva annotazioni in localstorage
     */
    function _saveLocal(newAnnotations) {
        let unsaved = _retrieveLocal().concat(newAnnotations);
        localStorageService.set('pending', unsaved);
    }


    function _retrieveLocal() {
        return localStorageService.get('pending') || [];
    }


    function _updateRemote(annotationList) {
        let newAnnotations = annotationList.map(a => _generateAnnotation(a));
        return $http.put('/api/annotations', {
                items: newAnnotations
            })
            .then(response => {
                return response;
            })
            .catch(err => console.warn(err));
    }


    function _deleteLocal() {
        localStorageService.clearAll();
    }


    function _generateAnnotation(annoData) {
        console.log(annoData);
        let result = {
            "annotations": _makeAnnotationBody(annoData),
            "target": annoData.target,
            "provenance": annoData.provenance
        };

        return result;
    }


    function _makeAnnotationBody(annoData) {

        let result;
        let annoBody = {
            "label": annoData.content.label,
            "subject": annoData.content.subject,
        };

        result = [{
            "type": annoData.type,
            "label": annoData.typeLabel,
            "body": annoBody
        }];

        switch (annoData.type) {
            case 'hasTitle':
                annoBody.predicate = 'http://purl.org/dc/terms/title';
                annoBody.literal = annoData.content.object;
                break;
            case 'hasPublicationYear':
                annoBody.predicate = 'http://purl.org/spar/fabio/hasPublicationYear';
                annoBody.literal = annoData.content.object;
                break;
            case 'hasAuthor':
                annoBody.predicate = 'http://purl.org/dc/terms/creator';
                annoBody.resource = {
                    id: annoData.content.object,
                    label: annoData.content.object
                };
                break;
            case 'hasURL':
                annoBody.predicate = 'http://purl.org/spar/fabio/hasURL';
                annoBody.literal = annoData.content.object;
                break;
            case 'hasDOI':
                annoBody.predicate = 'http://prismstandard.org/namespaces/basic/2.0/doi';
                annoBody.literal = annoData.content.object;
                break;
            case 'hasComment':
                annoBody.predicate = 'http://schema.org/comment';
                annoBody.literal = annoData.content.object;
                break;
            case 'denotesRhetoric':
                annoBody.predicate = 'http://www.ontologydesignpatterns.org/cp/owl/semiotics.owl#denotes';
                annoBody.resource = annoData.content.object;
                break;
            case 'cites':
                annoBody.predicate = 'http://purl.org/spar/cito/cites';
                annoBody.resource = {
                    id: annoData.content.object,
                    label: annoData.content.value
                };
                break;
            default:
                console.warn("Missing or wrong type");
        }

        return result;
    }


    /**
     * Genera un'annotazione completa a partire dai dati minimi
     * passati dal form
     */
    function _fillTheBlanks(annot) {
        let resultArray;
        annot.typeLabel = utilityService.labelFromType(annot.type);
        annot.group = 'http://vitali.web.cs.unibo.it/raschietto/graph/ltw1543';

        // Genera subject
        annot.content.subject = annot.target.source.replace(/\.html$/, '') + '_ver1';
        switch (annot.type) {
            case 'hasTitle':
                annot.content.label = `Il titolo del documento è "${annot.content.value}"`;
                annot.content.object = annot.content.value;
                break;
            case 'hasPublicationYear':
                annot.content.label = `Questo documento è stato pubblicato nel ${annot.content.value}`;
                annot.content.object = annot.content.value;
                break;
            case 'hasAuthor':
                if (!Array.isArray(annot.content.value))
                    annot.content.value = [annot.content.value];
                resultArray = annot.content.value.map(val => {
                    let item = $.extend(true, {}, annot);
                    item.content.label = `Un autore del documento è ${val}`;
                    item.content.object = val;
                    item.content.value = val;
                    return item;
                });
                return resultArray;
            case 'hasURL':
                annot.content.label = `L'URL del documento è ${annot.content.value}`;
                annot.content.object = annot.content.value;
                break;
            case 'hasDOI':
                annot.content.label = `Il DOI associato a questo documento è ${annot.content.value}`;
                annot.content.object = annot.content.value;
                break;
            case 'hasComment':
                annot.content.label = `${annot.provenance.author.name} ha commentato: ${annot.content.value}`;
                annot.content.object = annot.content.value;
                break;
            case 'denotesRhetoric':
                annot.content.value = utilityService.expandRhetoricURI(annot.content.value);
                let sep = annot.content.value.includes('sro') ? '#' : '/';
                let humanFriendly = annot.content.value.split(sep).pop();
                annot.content.label = `La funzione retorica di questo frammento è "${humanFriendly}"`;
                annot.content.subject = `${annot.content.subject}#${annot.target.id}-${annot.target.start}-${annot.target.end}`;
                annot.content.object = annot.content.value;
                break;
            case 'cites':
                const num = utilityService.getCitedNumber(annot);
                annot.content.object = `${annot.content.subject}_cited_${num}`;
                annot.content.value = annot.content.cited.title;
                annot.content.label = `Questo articolo cita ${annot.content.value}`;
                resultArray = [annot];
                resultArray = resultArray.concat(_prepareCitation(annot.content.cited, annot));
                return resultArray;
        }
        return [annot];
    }

    /**
     * Genera un array di annotazioni relative ad un articolo citato
     */
    function _prepareCitation(citations, fullAnnotObject) {

        let subject = fullAnnotObject.content.object;
        let resultArray = [];

        for (let key in citations) {

            if (key && citations[key] === undefined)
                continue;

            let newAnnotation = $.extend(true, {}, fullAnnotObject);
            newAnnotation.content = {
                subject: subject
            };

            switch (key) {
                case 'title':
                    newAnnotation.type = 'hasTitle';
                    newAnnotation.typeLabel = utilityService.labelFromType(newAnnotation.type);
                    newAnnotation.content.label = `Il documento citato ha come titolo "${citations.title}"`;
                    newAnnotation.content.object = citations.title;
                    newAnnotation.content.value = citations.title;
                    resultArray.push(newAnnotation);
                    break;
                case 'year':
                    newAnnotation.type = 'hasPublicationYear';
                    newAnnotation.typeLabel = utilityService.labelFromType(newAnnotation.type);
                    newAnnotation.content.label = `Il documento citato è stato pubblicato nel ${citations.year}`;
                    newAnnotation.content.object = citations.year;
                    newAnnotation.content.value = citations.year;
                    resultArray.push(newAnnotation);
                    break;
                case 'authors':
                    let authorsResultArray = citations.authors.map(val => {
                        let item = $.extend(true, {}, newAnnotation);
                        item.type = 'hasAuthor';
                        item.typeLabel = 'Autore';
                        item.content.label = `Un autore del documento citato è ${val}`;
                        item.content.object = val;
                        item.content.value = val;
                        return item;
                    });
                    resultArray = resultArray.concat(authorsResultArray);
                    break;
                case 'url':
                    newAnnotation.type = 'hasURL';
                    newAnnotation.typeLabel = utilityService.labelFromType(newAnnotation.type);
                    newAnnotation.content.label = `L'URL del documento citato è ${citations.url}`;
                    newAnnotation.content.object = citations.url;
                    newAnnotation.content.value = citations.url;
                    resultArray.push(newAnnotation);
                    break;
                case 'doi':
                    newAnnotation.type = 'hasDOI';
                    newAnnotation.typeLabel = utilityService.labelFromType(newAnnotation.type);
                    newAnnotation.content.label = `Il DOI associato al documento citato è ${citations.doi}`;
                    newAnnotation.content.object = citations.doi;
                    newAnnotation.content.value = citations.doi;
                    resultArray.push(newAnnotation);
                    break;
            }
        } // END ciclo for

        return resultArray;
    }


    /**
     * genera annotzioni dallo scraper
     */
    function _generateFromScraper(data) {
        console.log(data);
        let doc = angular.fromJson(data.document);
        let cit = angular.fromJson(data.citations);
        let src = doc.hasURL;
        let annotations = [];

        for (let k in doc) {
            let skel = {
                type: k,
                content: {
                    value: doc[k]
                },
                target: {
                    start: '',
                    end: '',
                    id: '',
                    source: src
                },
                provenance: {
                    author: {
                        name: 'TeapotScraper',
                        email: 'scraper@ltw1543'
                    },
                    time: new Date()
                }
            };
            annotations = annotations.concat(_fillTheBlanks(skel));
        }

        console.log(annotations);


        for (let c in cit) {
            let item = cit[c];
            if (!item || !Array.isArray(item) || item[0] === "") continue;
            let title = item.pop();
            if (!title) {
                // niente titolo?
                continue;
            }

            let target = _generateScrapedAnnotationRange(title, src);

            let skel = {
                type: 'cites',
                content: {
                    value: title,
                    cited: {
                        title: title,
                        authors: item[0] ? item[0].trim().split(', ') : []// Dovrebbero essere rimasti solo gli autori
                    }
                },
                target: target,
                provenance: {
                    author: {
                        name: 'TeapotScraper',
                        email: 'scraper@ltw1543'
                    },
                    time: new Date()
                },
            };
            annotations = annotations.concat(_fillTheBlanks(skel));
        }

        _clearScraped();
        _saveLocal(annotations);
    }


    // Genera le informazioni per compilare il campo 'target'
    // dell'annotazione
    function _generateScrapedAnnotationRange(annoText, src) {
        console.log("HEY");
        let range = rangy.createRange();
        let target = {source: src, id: '', start: '', end: ''};
        let containerElement;

        range.findText(annoText);

        if (range.toString() === "") {
            // Niente di utile
            return target;
        }

        // Questo probabilmente non serve più..
        if (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE) {
            containerElement = range.commonAncestorContainer;
        } else {
            containerElement = range.commonAncestorContainer.parentElement;
        }

        let path = _generateRemotePath(containerElement, src);

        // per semplicità calcoliamo start ed end su tutto
        // il testo contenuto nell'elemento
        range.selectNode(containerElement);
        let start = 0;
        let end = range.toString().length;

        target.id = path;
        target.source = src;
        target.start = start;
        target.end = end;

        return target;
    }


    /**
     * rimuovi le annotazioni dello scraper
     */
    function _clearScraped() {
        let local = _retrieveLocal();
        for (let i in local) {
            if (local[i].provenance.author.name === 'TeapotScraper') {
                local.splice(i, 1);
            }
        }
        _deleteLocal();
        _saveLocal(local);

    }

    function _generateRemotePath(element, src) {
        // Stabilisci l'id per l'elemento
        let localPath = utilityService.getXPathTo(element);
        let path;

        if (src.match('dlib')) {
            path = Dlib.convertFromRaschietto(localPath);
        } else {
            path = Riviste.convertFromRaschietto(localPath);
        }

        return path;
    }

}
