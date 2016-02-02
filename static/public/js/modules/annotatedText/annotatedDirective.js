export
default

function annotatedText() {
    return {
        restrict: 'AE',
        transclude: true,
        bindToController: {
            getAnnotations: '&annotatedText'
        },
        templateUrl: 'js/modules/annotatedText/annotatedView.html',
        controller: 'AnnotatedTextController',
        controllerAs: 'annoText',
        link: annotatedTextLink
    };


    function annotatedTextLink(scope, el, attrs, ctrl, transclude) {
        let annotationIndexes = attrs.annotations.trim().split(' ');
        let minStartRange = 0;
        let maxEndRange = 0;
        let annoType = '';

        ctrl.managedAnnotations = ctrl.getAnnotations({
            indexes: annotationIndexes
        });

        /* Individua il range più grande delle annotazioni  *
         * su questo elemento, inoltra determina il tipo    */
        ctrl.managedAnnotations.forEach((elem, index) => {
            if (index === 0) {
                minStartRange = elem.start.value;
                maxEndRange = elem.end.value;
                annoType = elem.type.value;
            } else {
                minStartRange = (minStartRange < elem.start.value) ? minStartRange : elem.start.value;
                maxEndRange = (maxEndRange > elem.end.value) ? maxEndRange : elem.end.value;
                annoType = (annoType === elem.type.value) ? annoType : 'mixed';
            }
        });

        let substring = el.text().substring(minStartRange, maxEndRange);

        /* Thanks SO!
         * https://stackoverflow.com/questions/16090487/find-a-string-of-text-in-an-element-and-wrap-some-span-tags-round-it
        */
        el.html(function(_, html) {
            return html.replace(substring,
                `<span class="annotation anno-${annoType}">${substring}</span>`
            );
        });
        // Non posso usare ng-click se no mi tocca
        // ricompilare la direttiva e succedono
        // Brutte Cose (R)
        ctrl.theSpan = el.find('.annotation'); // Questo mi serve poi
        ctrl.theSpan.bind('click', ctrl.showAnnotations);
    }

}
