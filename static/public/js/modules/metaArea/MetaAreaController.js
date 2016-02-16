MetaController.$inject = ['$scope', '$stateParams', 'documentService', 'annotationService'];

/**
 * Controller per la metaArea
 */
export default function MetaController($scope, $stateParams, documentService, annotationService) {
    var model = this;

    model.annotations = annotationService.annotations;
    model.isFiltered = _isFiltered;
    model.notEmpty = Boolean(model.annotations);

    // se true, l'annotazione è filtrata
    function _isFiltered(annot) {
        let groupFilter = annotationService.filters.get(annot.group);
        let typeFilter = annotationService.filters.get(annot.type);
        let provenanceFilter = annotationService.filters.get(annot.provenance.author.name);

        return !(groupFilter.display && typeFilter.display && provenanceFilter.display);
    }

    model.toggle = function(item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    };
    model.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };

}
