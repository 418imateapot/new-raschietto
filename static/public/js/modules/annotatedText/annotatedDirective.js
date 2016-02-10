export default function annotatedText() {
    return {
        restrict: 'AE',
        transclude: true,
        bindToController: {
            getAnnotations: '&annotatedText',
            isFiltered: '&annotationFilters'
        },
        templateUrl: 'js/modules/annotatedText/annotatedView.html',
        controller: 'AnnotatedTextController',
        controllerAs: 'annoText',
        link: annotatedTextLink
    };


    function annotatedTextLink(scope, el, attrs, ctrl, transclude) {

        let annotationInfo = ctrl.elementConfig(attrs);
        let annoType = annotationInfo.annoType;

        let range = buildRange(el.get(0), annotationInfo.minStartRange, annotationInfo.maxEndRange);

        // Usa rangy.highlighter per applicare le classi
        // ed evidenziare il testo sul nostro range
        let h = rangy.createHighlighter();
        //h.addClassApplier(rangy.createClassApplier('annotation'));
        h.addClassApplier(rangy.createClassApplier(`anno-${annoType}`));
        try {
            //h.highlightRanges('annotation', [range]);
            h.highlightRanges(`anno-${annoType}`, [range]);
        } catch (e) {
            console.error(e);
            console.error(annotationInfo);
        }

        // DEBUG
        if (el.get(0).nodeName === 'p') {
            console.log('ww');
            console.log(h);
        }
        console.log(el);
        console.log(h);

        let ancestor = range.commonAncestorContainer;
        if (ancestor.nodeType === ancestor.TEXT_NODE) {
            // Se l'antenato è un text node dobbiamo
            // risalire, se no element.bind non funziona
            ancestor = ancestor.parentNode;
        }
        ctrl.element = angular.element(ancestor);
        // Non posso usare ng-click se no mi tocca
        // ricompilare la direttiva e succedono
        // Brutte Cose (R)
        ctrl.element.bind('click', ctrl.showAnnotations);
        if (annoType === 'hasTitle') console.log(ctrl.element);

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
                if (node.data.match(/^\s+$/)) {
                    // scarta i nodi vuoti
                    return;
                }
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
