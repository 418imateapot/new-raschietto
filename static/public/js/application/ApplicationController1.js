ApplicationController.$inject = [
    '$scope',
    '$stateParams',
    '$compile',
    '$mdDialog',
    'documentService',
    'annotationService',
    'userService',
    'appService'
];

export
default

function ApplicationController($scope, $stateParams, $compile, $mdDialog, documentService, annotationService, userService, appService) {
    var model = this;

    model.user = '';
    model.content = '';
    model.annotations = [];
    model.annotationsLoading = false;
    model.retrieveAnnotations = _getAnnos;

    model.showTabDialog = () => {};

    // Grazie mille
    // https://stackoverflow.com/questions/24078535/angularjs-controller-as-syntax-and-watch
    $scope.$watch(() => this.content, () => {
        _load_annotations();
    });

    console.info("Raschietto sta scaldando i motori...");

    //////////////////////////
    //-- Funzioni interne --//
    //////////////////////////


    function _getAnnos($event, ...indexes) {
        $event.preventDefault(); // per evitare danni se si clicca su un link
        let result = [];
        for (let i in indexes) {
            result.push(model.annotations[indexes[i]]);
        }

        function _DialogController($mdDialog) {
            let dialog = this;

            dialog.result = result;

            dialog.hide = function() {
                $mdDialog.hide();
            };
            dialog.cancel = function() {
                $mdDialog.cancel();
            };
            dialog.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        }

        model.showTabDialog = function(ev, result) {
            $mdDialog.show({
                    controller: _DialogController,
                    controllerAs: 'dialog',
                    template: `<md-content ng-repeat="res in dialog.result"><p>{{res|json}}</p><br></md-content>`,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        model.showTabDialog($event);
        console.log(result);
        return result;
    }




    /**
     * Carica le annotazioni del doc corrente
     * interrogando annotationService
     */
    function _load_annotations() {
        if (!$stateParams.doi)
            return;

        model.annotationsLoading = true;
        let decodedDoi = documentService.decodeDoi($stateParams.doi);
        console.info(`MetaArea: Loading DOI=${decodedDoi}`);

        documentService.findByDoi(decodedDoi)
            .then(doc => {
                let url = doc.url.value;
                annotationService.query(url).then(response => {
                    model.annotations = annotationService.tidy(response.body);
                    model.annotationsLoading = false;
                    _highlight();
                });
            });
    }

    function _highlight() {

        let newElements = [];

        model.annotations.forEach((val, index) => {
            let source, fragment, type, provenance;
            try {
                //if(val.type.value !== 'hasAuthor') return;
                source = val.src.value.indexOf('dlib') !== -1 ? 'dlib' : 'statistica';
                fragment = val.fragment.value;
                type = val.type.value;
                provenance = val.provenance.value;
            } catch (e) {
                console.warn('Malformed annotation?');
                return;
            }

            // elem === false se l'xpath è balordo
            let elem = appService.getSelector(fragment, type, source, provenance);
            if (!elem || !elem.style)
                return; // Per stare dalla parte dei bottoni

            elem = angular.element(elem);
            let isAlreadyAnnotated = false;
            let span = elem.find('span.text-annotation');

            if (span.length !== 0) {
                isAlreadyAnnotated = true;
                span.addClass(`anno-${val.type.value}`); // just in case

                // aggiungi un parametro ad ng-click
                let updatedFun = span.attr('ng-click')
                    .replace(/\)$/, `, ${index})`);
                span.attr('ng-click', updatedFun);
            } else {

                let substring = elem.html()
                    .substring(val.start.value, (val.start.value + val.end.value));

                let newSpan = `<span ng-click="app.retrieveAnnotations($event, ${index})" class="text-annotation anno-${val.type.value}">${substring}</span>`;

                let text = elem.html().replace(substring, newSpan);

                elem.html(text);
                newElements.push(elem);
                if(type === 'cites') console.warn(elem.html());
            }

        });

        newElements.forEach((el) => $compile(el)($scope));

    }


}
