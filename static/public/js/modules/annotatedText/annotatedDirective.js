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

        /* Thanks SO!
         * https://stackoverflow.com/questions/16090487/find-a-string-of-text-in-an-element-and-wrap-some-span-tags-round-it
        */
        el.html(function(_, html) {
            return el.text().replace(substring,
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
