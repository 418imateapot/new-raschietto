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
        let substring = el.text()
            .substring(
                annotationInfo.minStartRange,
                annotationInfo.maxEndRange);

        //console.log(annotationInfo);

        /*
        let range = document.createRange();
        let span = angular.element('<span', {
            'class': `annotation anno-${annoType}`,
        });
        range.selectNode(el.get(0));
        console.log(el.get(0));console.log(range);return;
        range.setStart(el.get(0), annotationInfo.minStartRange);
        range.setEnd(el.get(0), annotationInfo.maxEndRange);
        range.surroundContents(span.get(0));
*/
        /* Thanks SO!
         * https://stackoverflow.com/questions/16090487/find-a-string-of-text-in-an-element-and-wrap-some-span-tags-round-it
        el.html(function(_, html) {
            return el.text().replace(substring,
                `<span class="annotation anno-${annoType}">${substring}</span>`
            );
        });
        */
        // Non posso usare ng-click se no mi tocca
        // ricompilare la direttiva e succedono
        // Brutte Cose (R)
        ctrl.theSpan = span; // Questo mi serve poi
        ctrl.theSpan.bind('click', ctrl.showAnnotations);
    }

}
