annotatedText.$inject = ['annotationService'];

export
default

function annotatedText(annotationService) {
    return {
        restrict: 'AE',
        transclude: true,
        templateUrl: 'js/modules/annotatedText/annotatedView.html',
        controller: 'AnnotatedTextController',
        controllerAs: 'annoText',
        link: annotatedTextLink
    };



    /**
     * Inizializza la direttiva recuperando le
     * annotazioni da annotationService
     */
    function _init(attrs, ctrl) {
        let annotationIndexes = attrs.annotations.trim().split(' ');
        // Le annots sono già filtrate
        ctrl.managedAnnotations = annotationIndexes.map(index => annotationService.getAnnotations(false, index));
    }


    function annotatedTextLink(scope, el, attrs, ctrl, transclude) {

        // Usa rangy.highlighter per applicare le classi
        // ed evidenziare il testo sul nostro range
        let h = rangy.createHighlighter();
        _init(attrs, ctrl);
        ctrl.rangesInfo = []; // tutti i range correntemente evidenziati e i loro metadati

        let transcluded_el = el.find('.annotation'); // Questo è il container in cui dobbiamo trovare l'offset

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
        ctrl.managedAnnotations.forEach((annot, index) => {
            let newRange = rangy.createRange();
            let newRangeBookmark = {
                containerNode: transcluded_el.get(0),
                end: annot.target.end,
                start: annot.target.start
            };
            newRange.moveToBookmark(newRangeBookmark);
            let annoType = annot.type;
            let annotations = [annot];

            // Prepara l'entry per questa annotazione
            let result = {
                rangeBookmark: newRangeBookmark,
                type: annoType,
                annotations: annotations,
                indexes: new Set([index])
            };
            let overlap = false;

            // Se ci sono intersezioni, unisci le annotazioni e
            // modifica il risultato di conseguenza
            for (let i in ctrl.rangesInfo) {
                let oldRangeInfo = ctrl.rangesInfo[i];
                let oldRange = rangy.createRange();
                oldRange.moveToBookmark(oldRangeInfo.rangeBookmark);

                if (newRange.intersectsRange(oldRange)) {
                    overlap = true;
                    newRange = newRange.union(oldRange);
                    if (oldRangeInfo.type !== annoType) {
                        annoType = 'mixed';
                    }
                    annotations = oldRangeInfo.annotations.concat([annot]);
                    // E qui abbiamo finito
                    result = {
                        rangeBookmark: newRange.getBookmark(transcluded_el.get(0)),
                        type: annoType,
                        annotations: annotations,
                        indexes: oldRangeInfo.indexes
                    };
                    result.indexes.add(index);
                    ctrl.rangesInfo[i] = result;
                }
            }

            if (!overlap)
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
                console.log(className);
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
                if (!c.attr('data-bound')) {
                    // Unbound, crea la click function
                    c.attr('data-bound', newIndexesString);
                    c.bind('click', (event) => {
                        event.preventDefault();
                        ctrl.showAnnotations(event, newIndexes);
                    });
                } else {
                    // Già bound, sostituisci l'handler
                    let boundAnnots = c.attr('data-bound');
                    c.attr('data-bound', `${boundAnnots} ${newIndexesString}`);
                    let annotationIndexes = c.attr('data-bound').trim().split(' ');
                    c.unbind('click');
                    c.bind('click', (event) => {
                        event.preventDefault();
                        ctrl.showAnnotations(event, annotationIndexes);
                    });
                }
            });

        });


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

    }
}
