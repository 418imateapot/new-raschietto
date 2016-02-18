FilterController.$inject = ['$scope', '$rootScope', '$mdToast', 'annotationService', 'userService', 'utilityService'];

/**
 * Controller per i filtri delle annotazioni
 */
export
default
function FilterController($scope, $rootScope, $mdToast, annotationService, userService, utilityService) {

    const model = this;

    model.filters = annotationService.filters;
    model.getLabel = (filter) => utilityService.labelFromType(filter);
    model.isTypeFilter = _isTypeFilter;
    model.isProvenanceFilter = _isProvenanceFilter;
    model.isGroupFilter = _isGroupFilter;
    model.hide = () => filter.show = false;
    model.exists = _exists;
    model.toggle = _toggle;
    model.toggleOwn = _toggleOwn;
    model.toggleAll = _toggleAll;
    model.hasAnnotations = Boolean(annotationService.filters);

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

    function _toggleOwn() {
        let user = userService.userEmail;
        if (user && model.filters[user]) {
            _toggle(user);
        } else {
            $mdToast.showSimple('Non hai ancora effettuato alcuna annotazione.');
        }
    }

    function _toggleAll() {
        for (let f in model.filters)
            _toggle(f, true);
        $rootScope.$broadcast('reload_view');
    }

    function _toggle(item, silent) {
        // Bit flippin' man
        let display = model.filters[item].display;
        model.filters[item].display = !display;
        if (!silent) {
            $rootScope.$broadcast('reload_view');
        }
    }

    function _exists(item) {
        return item.display;
    }

}
