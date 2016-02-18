MetaController.$inject = ['$scope', '$stateParams', 'documentService', 'annotationService'];

/**
 * Controller per la metaArea
 */
export
default
function MetaController($scope, $stateParams, documentService, annotationService) {
    var model = this;

    model.annotations = annotationService.annotations;
    model.isFiltered = annotationService.isFiltered;
    model.notEmpty = Boolean(model.annotations);

    model.page = 1;
    model.limit = 10;
    model.onPaginate = (page, limit) => {
        console.log('paggine');
        let range = page * limit;
        return model.annotations.slice(range-limit, range);
    };

    model.length = model.annotations.length;


    model.toggle = function(item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    };
    model.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };

}
