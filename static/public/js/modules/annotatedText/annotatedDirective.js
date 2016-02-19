annotatedText.$inject = ['$compile'];

export
default

function annotatedText($compile) {
    return {
        restrict: 'AE',
        transclude: true,
        templateUrl: 'js/modules/annotatedText/annotatedView.html',
        controller: 'AnnotatedTextController',
        controllerAs: 'annoText',
        link: annotatedTextLink
    };


    function annotatedTextLink(scope, el, attrs, ctrl, transclude) {

        // Usa rangy.highlighter per applicare le classi
        // ed evidenziare il testo sul nostro range
        let h = rangy.createHighlighter();
        ctrl.init(attrs);
        ctrl.rangesInfo = []; // tutti i range correntemente evidenziati e i loro metadati

        /**
         *  rangeinfo = {
         *      rangeBookmark: bookmark,
         *      type: string,
         *      annotations: array,
         *      indexes: array
         *  };
         */
        /**
         * Crea una lista di range, fondendo insieme i range che sono in
         * sovrapposizione
         */
        ctrl.activeAnnotations.forEach((annot, index) => {
            let newRange = rangy.createRange();
            let newRangeBookmark = {
                containerNode: el.get(0),
                end: annot.target.end,
                start: annot.target.start
            };
            newRange.moveToBookmark(newRangeBookmark);
            //let newRange = buildRange(el.get(0), annot.target.start, annot.target.end);
            let annoType = annot.type;
            let annotations = [annot];

            // Se ci sono intersezioni, unisci le annotazioni
            for (let i in ctrl.rangesInfo) {
                let oldRangeInfo = ctrl.rangesInfo[i];
                let oldRange = rangy.createRange();
                oldRange.moveToBookmark(oldRangeInfo.rangeBookmark);

                if (newRange.intersectsRange(oldRange)) {
                    newRange = newRange.union(oldRange);
                    if (oldRangeInfo.type !== annoType) {
                        annoType = 'mixed';
                    }
                    annotations = oldRangeInfo.annotations.concat([annot]);
                    // E qui abbiamo finito
                    let result = {
                        rangeBookmark: newRange.getBookmark(),
                        type: annoType,
                        annotations: annotations,
                        indexes: oldRangeInfo.indexes
                    };
                    result.indexes.add(index);
                    ctrl.rangesInfo[i] = result;
                    return;
                }
            }

            let result = {
                rangeBookmark: newRangeBookmark,
                type: annoType,
                annotations: annotations,
                indexes: new Set([index])
            };
            ctrl.rangesInfo.push(result);
        });

        // console.log(ctrl.rangesInfo);

        /**
         * Per ogni range determinato al passo precedente,
         * applica la classe con l'highlight e assegna
         * la funzione callback per click.
         */
        ctrl.rangesInfo.forEach((rInfo, index) => {
            // Il range è sempre ricostruito dal bookmark perchè il riferimento
            // che avevamo potrebbe non essere più valido (se il DOM è mutato)
            let range = rangy.createRange();
            let className = `anno-${rInfo.type}`;
            range.moveToBookmark(rInfo.rangeBookmark);

            // Evidenzia il range
            h.addClassApplier(rangy.createClassApplier(className));
            try {
                h.highlightRanges(className, [range]);
            } catch (e) {
                console.warn(className + ' ha qualche problema?');
            }

            // Determina su che elemento attaccare l'event listener per i click
            let container = GetAllCreatedElements(rInfo.rangeBookmark, className);
            /*
            let container = range.getNodes(false, (el) => {
                return el.className && el.className.match(className);
            });
            */
            if (container.length === 0) {
                // A volte il primo metodo fallisce..
                container = range.commonAncestorContainer;
                if (container.nodeType === container.TEXT_NODE) {
                    // Se l'antenato è un text node dobbiamo
                    // risalire, se no element.bind non funziona
                    container = container.parentNode;
                }
                container = [container];
            }

            // Assegna la callback
            container.forEach(c => {
                c = angular.element(c);
                let newIndexes = Array.from(rInfo.indexes);
                let newIndexesString = newIndexes.join(' ');
                // Questo balletto dovrebbe evitarmi di
                // bindare duemila callback allo stesso
                // elemento
                if (!c.attr('bound')) {
                    // Unbound, crea la click function
                    c.attr('bound', newIndexesString);
                    c.bind('click', (event) => {
                        event.preventDefault();
                        ctrl.showAnnotations(event, newIndexes);
                    });
                } else {
                    // Già bound, sostituisci l'handler
                    let boundAnnots = c.attr('bound');
                    c.attr('bound', `${boundAnnots} ${newIndexesString}`);
                    let annotationIndexes = c.attr('bound').trim().split(' ');
                    c.unbind('click');
                    c.bind('click', (event) => {
                        event.preventDefault();
                        ctrl.showAnnotations(event, annotationIndexes);
                    });
                }
            });

        });

    }
    //function annotatedTextLink(scope, el, attrs, ctrl, transclude) {

        //ctrl.init(attrs);
        //let resultAnnotations = [];

        //// Aggrega le annotazioni sovrapposte
        //for (let i = 0; i < ctrl.activeAnnotations.length; i++) {

            //let anno1 = ctrl.activeAnnotations[i];
            //if (anno1.processed) {
                //// Già esaminata
                //continue;
            //}
            //let overlapped = [anno1];

            //for (let j = 0; j < ctrl.activeAnnotations.length; j++) {
                //let intersect = false;
                //let anno2 = ctrl.activeAnnotations[j];
                //if (anno2.processed) {
                    //continue;
                //}
                //let target1 = anno1.realTarget || anno1.target;
                //let target2 = anno2.target;
                //// Scopri se si sovrappongono
                //if (target1.start <= target2.start) {
                    //if(target2.start <= target1.end) {
                        //intersect = true;
                    //}
                //} else {
                    //if(target1.start <= target2.end) {
                        //intersect = true;
                    //}
                //}
                //if(intersect) {
                    //anno1.realTarget = {};
                    //anno1.realTarget.start = Math.min(target1.start, target2.start);
                    //anno1.realTarget.end = Math.max(target1.end, target2.end);
                    //anno1.realType = anno1.type === anno2.type ? anno1.type : 'mixed';
                    //overlapped.push(anno2);
                    //anno2.processed = true;
                //}
            //}
            //anno1.processed = true;
            //resultAnnotations.push(overlapped);
        //}

        //let span = $('<span>',{class:'anno-hasTitle'}).get(0);

        //for (let i in resultAnnotations) {
            //let bundle = resultAnnotations[i];
            //if(bundle.length < 1) {
                //continue;
            //}
            //let target = bundle[0].realTarget || bundle[0].target;
            //let nativeEl = el.get(0);
            //let tNodes = (nativeEl.nodeType === nativeEl.TEXT_NODE) ? [nativeEl] : getTextNodesIn(nativeEl, true);
            //let startNotFound = true;

            //for (let n in tNodes) {
                //let node = tNodes[n];
                //let s = node.length;

                //if (s < target.start && startNotFound) {
                    //// Cerchiamo l'offset iniziale
                    //target.start -= s;
                    //target.end -= s;
                    //startNotFound = false;
                //} else {
                    ////let secondHalf = rNodes[n].splitText();
                    //if (startNotFound) {
                        //// Abbiamo trovato il primo offset
                        //let sr = rangy.createRange();
                        //sr.setStart(node, target.start);
                        //sr.setEnd(node, node.length);
                        //sr.surroundContents(span);
                    //} else {
                        //// Cerchiamo l'offset finale
                        //if (s < target.end) {
                            //// Intanto tagghiamo tutti i nodi intermedi
                            //let sr = rangy.createRange();
                            //sr.setStart(node, 0);
                            //sr.setEnd(node, node.length);
                            //sr.surroundContents(span);
                            //target.end -= s;
                        //} else {
                            //// Trovato l'offset finale
                            //let sr = rangy.createRange();
                            //sr.setStart(node, 0);
                            //sr.setEnd(node, target.end);
                            //sr.surroundContents(span);
                            //break;
                        //}
                    //}
                //}
            //}

        //}

    //}
    
    //function getTextNodesIn(node, includeWhitespaceNodes) {
        //var textNodes = [], nonWhitespaceMatcher = /\S/;

        //function getTextNodes(node) {
            //if (node.nodeType == 3) {
                //if (includeWhitespaceNodes || nonWhitespaceMatcher.test(node.nodeValue)) {
                    //textNodes.push(node);
                //}
            //} else {
                //for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                    //getTextNodes(node.childNodes[i]);
                //}
            //}
        //}

        //getTextNodes(node);
        //return textNodes;
    //}

    /**
     * SO, cosa farei senza di te..
     * https://stackoverflow.com/questions/14710290/rangy-how-can-i-get-the-span-element-that-is-created-using-the-highlighter-modu
     */
    function GetAllCreatedElements(rangeBookmark, className) {
        var range = rangy.createRange();
        range.moveToBookmark(rangeBookmark);
        var nodes = range.getNodes(false, function(el) {
            return el.className && el.className.match(className);
            //return el.parentNode && el.parentNode.className == className;
        });

        var spans = [];

        for (var i = 0; i < nodes.length; i++) {
            spans.push(nodes[i].parentNode);
        }

        return nodes;
    }

    /**
     * Restituisce un array con tutti i nodi testuali ottenuti
     * percorrendo il DOM a partire dal nodo 'el'
     * @param {node} el L'elemento di partenza
     * @return {Array} La lista ordinata dei nodi testuali
     */
    function oldGetTextNodes(el) {
        let result = [];

        $.each(el.childNodes, function(i, node) {
            if (node.nodeType === node.TEXT_NODE) {
                // se è un text_node lo vogliamo
                /* A quanto pare i nodi vuoti sono importanti
                   if (node.data.match(/^\s+$/)) {
                // scarta i nodi vuoti
                return;
                }
                */
                result.push(node);
            } else {
                // se no, andiamo di ricorsione..
                result = result.concat(getTextNodes(node));
            }
        });

        return result;
    }

    /**
     * Dato un elemento e gli estremi, costruisce un range usando la libreria
     * cross-platform rangy
     */
    function buildRange(parent, start, end) {
        let telems = getTextNodes(parent); // text elements
        let r = rangy.createRange(); // empty range
        r.selectNodeContents(parent);

        // Identifica nodo e offset iniziale
        for (let i in telems) {
            let len = telems[i].length;
            if (len < start) {
                start -= len;
            } else {
                // Fatto!
                r.setStart(telems[i], start);
                break;
            }
        }

        // Identifica nodo e offset finale
        for (let i in telems) {
            let len = telems[i].length;
            if (len < end) {
                end -= len;
            } else {
                // Fatto!
                r.setEnd(telems[i], end);
                break;
            }
        }

        return r;
    }

}


