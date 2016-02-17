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

        console.info('Setting up some dom');

        // Usa rangy.highlighter per applicare le classi
        // ed evidenziare il testo sul nostro range
        let h = rangy.createHighlighter();
        ctrl.init(attrs);
        ctrl.rangesInfo = []; // tutti i range correntemente evidenziati e i loro metadati

        /**
         *  rangeinfo = {
         *      rangeBookmark: bookmark,
         *      type: string,
         *      annotations: array
         *  };
         */
        /**
         * Crea una lista di range, fondendo insieme i range che sono in
         * sovrapposizione
         */
        ctrl.activeAnnotations.forEach(annot => {
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
                        annoType = 'anno-mixed';
                    }
                    annotations = oldRangeInfo.annotations.concat([annot]);
                    // E qui abbiamo finito
                    let result = {
                        rangeBookmark: newRange.getBookmark(),
                        type: annoType,
                        annotations: annotations
                    };
                    ctrl.rangesInfo[i] = result;
                    return;
                }
            }

            let result = {
                rangeBookmark: newRangeBookmark,
                type: annoType,
                annotations: annotations
            };
            ctrl.rangesInfo.push(result);
        });

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
                c.attr('bound', true);
                c.bind('click', (event) => {
                    event.preventDefault();
                    ctrl.showAnnotations(event, rInfo.annotations);
                });
            });

        });

    }

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
    function getTextNodes(el) {
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
