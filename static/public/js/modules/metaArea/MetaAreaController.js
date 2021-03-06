MetaController.$inject = ['$scope', '$stateParams', 'documentService', 'annotationService'];

/**
 * Controller per la metaArea
 */
export default function MetaController($scope, $stateParams, documentService, annotationService) {
    var model = this;

    model.annotations = annotationService.getAnnotations();
    model.isFiltered = annotationService.isFiltered;
    model.notEmpty = Boolean(model.annotations);

    // Pagination vars
    model.currentPage = 1;
    model.pagesize = 10;

    model.toggle = function(item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    };
    model.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };

}
