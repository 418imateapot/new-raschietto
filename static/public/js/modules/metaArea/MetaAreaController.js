MetaController.$inject = ['$scope', '$stateParams', 'documentService', 'annotationService'];

/**
 * @class
 * Controller per la metaArea
 */
export default function MetaController($scope, $stateParams, documentService, annotationService) {
    var model = this;

    /* Passate da appctrl
    model.loading
    model.annotations
    */
   model.annotations = annotationService.annotations;

    model.selected = [
        'hasTitle',
        'hasAuthor',
        'hasPublicationYear',
        'hasURL',
        'hasDOI',
        'hasComment',
        'denotesRethoric',
        'cites'
    ];

    model.toggle = function(item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
    };
    model.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };

}
