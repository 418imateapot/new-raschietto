FilterController.$inject = ['$scope', 'annotationService', 'userService', 'utilityService'];

/**
 * Controller per i filtri delle annotazioni
 */
export default function FilterController($scope, annotationService, userService, utilityService) {

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
    model.hasAnnotations = Boolean(model.filters);

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
        _toggle(user);
    }

    function _toggleAll() {
        for (let f in model.filters)
            _toggle(f);
    }

    function _toggle(item) {
        // Bit flippin' man
        let entry = model.filters[item];
        entry.display = !entry.display;
    }

    function _exists(item) {
        return model.filters[item].display;
    }

}
