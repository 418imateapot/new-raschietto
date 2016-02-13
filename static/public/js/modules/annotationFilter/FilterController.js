FilterController.$inject = [];

/**
 * Controller per i filtri delle annotazioni
 */
export default function FilterController() {

    const model = this;

    // model.filters ->injected by appCtrl
    console.log(model.filters);

    model.isTypeFilter = _isTypeFilter;
    model.isProvenanceFilter = _isProvenanceFilter;
    model.isOwnFilter = _isOwnFilter;

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
        return !(_isTypeFilter(filter) || _isOwnFilter(filter));
    }

    function _isOwnFilter(filter) {

    }

    function _toggle(item) {
        // Bit flippin' man
        model.filters[item].display = !model.filters[item].display;
    }

    function _exists(item) {
        return model.filters[item].display;
    }

}
