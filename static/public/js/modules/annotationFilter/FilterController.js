FilterController.$inject = ['$state', '$stateParams', 'userService'];

/**
 * Controller per i filtri delle annotazioni
 */
export default function FilterController($state, $stateParams, userService) {

    const model = this;

    // model.filters ->injected by appCtrl
    console.log(model.filters);

    model.isTypeFilter = _isTypeFilter;
    model.isProvenanceFilter = _isProvenanceFilter;
    model.hide = () => filter.show = false;
    model.exists = _exists;
    model.toggle = _toggle;
    model.toggleOwn = _toggleOwn;
    model.toggleAll = _toggleAll;

    function _isTypeFilter(filter) {
        const types = [
            'hasTitle',
            'hasAuthor',
            'hasPublicationYear',
            'hasDOI',
            'hasURL',
            'hasComment',
            'denotesRethoric',
            'cites'
        ];
        return types.indexOf(filter) !== -1;
    }

    function _isProvenanceFilter(filter) {
        return !_isTypeFilter(filter);
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
        model.filters[item].display = !model.filters[item].display;
        if ($stateParams.toolId === undefined) {
            $state.go('.', {}, {reload: true});
        }
    }

    function _exists(item) {
        return model.filters[item].display;
    }

}
