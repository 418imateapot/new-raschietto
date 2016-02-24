FilterController.$inject = ['$scope', '$rootScope', '$state', '$mdToast', 'annotationService', 'userService', 'utilityService'];

/**
 * Controller per i filtri delle annotazioni
 */
export
default
function FilterController($scope, $rootScope, $state, $mdToast, annotationService, userService, utilityService) {

    const model = this;

    model.filters = annotationService.filters;
    model.getLabel = (filter) => utilityService.labelFromType(filter);
    model.isTypeFilter = _isTypeFilter;
    model.isProvenanceFilter = _isProvenanceFilter;
    model.isGroupFilter = _isGroupFilter;
    model.hide = () => filter.show = false;
    model.hasAnnotations = Boolean(annotationService.filters);

    model.exists = _exists;
    model.toggle = _toggle;
    model.toggleOwn = _toggleOwn;
    model.toggleAll = _toggleAll;
    model.hideOthers = _hideOthers;


    $scope.$on('annotations_loaded', () => model.filters = annotationService.filters);

    function _isTypeFilter(filter) {
        return filter.type === 'type';
    }

    function _isProvenanceFilter(filter) {
        return filter.type === 'provenance';
    }

    function _isGroupFilter(filter) {
        return filter.type === 'group';
    }

    function _exists(item) {
        return item.display;
    }


    function _toggleOwn(value) {
        let user = userService.userEmail;
        if (user && model.filters[user]) {
            _toggle(user, value);
        } else {
            $mdToast.showSimple('Non hai ancora effettuato alcuna annotazione.');
        }
    }

    function _hideOthers() {
        _toggleAll(false);
        _toggleOwn(true);
    }


    function _toggle(item, silent, value) {
        // Determina se dobbiamo settare il valore o
        // solo invertirlo
        let display = model.filters[item].display;
        if (value === undefined) {
            value = !display;
        }
        model.filters[item].display = value;
        if (!silent) {
            // Usato per toggleAll e affini
            $rootScope.$broadcast('filter_toggled');
        }
    }

    function _toggleAll(value) {
        for (let f in model.filters)
            _toggle(f, true, value);
        $rootScope.$broadcast('filter_toggled');
    }


}
