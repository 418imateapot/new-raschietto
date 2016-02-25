StagingController.$inject = ['$scope', '$state', '$mdToast', 'documentService', 'newAnnotationService'];

/**
 * Controller per l'area di sosta
 */
export
default
function StagingController($scope, $state, $mdToast, documentService, newAnnotationService) {

    const model = this;

    model.pending = [];
    model.loading = true;
    model.delete = _delete;
    model.saveAll = _saveAll;
    model.deleteAll=_deleteAll;
    model.isVisible = _isVisible;
    model.isEmpty = true;

    // Pagination vars
    model.currentPage = 1;
    model.pagesize = 10;

    $scope.$on('save_all', _saveAll);
    $scope.$on('delete_all', _deleteAll);

    _init();

    //
    ////////////////////
    // Implementation //
    ////////////////////

    function _init() {
        model.pending = newAnnotationService.retrieveLocal();
        if (model.pending.length > 0) {
            model.isEmpty = false;
        }
        model.loading = false;
    }

    function _saveAll() {
        newAnnotationService.updateRemote(model.pending)
            .then(r => {
                $mdToast.showSimple('Annotazioni salvate');
                newAnnotationService.nuke();
                model.pending = [];
            })
            .catch(e => $mdToast.showSimple('C\'è stato un problema!'));
    }

    function _deleteAll(){
        newAnnotationService.nuke();
        $mdToast.showSimple('Annotazioni eliminate');
        model.pending=[];
        }

    function _delete(elem) {
        model.pending.splice(elem, 1);
        newAnnotationService.nuke();
        newAnnotationService.saveLocal(model.pending);
        if (model.pending.length === 0) {
            model.isEmpty = true;
        }
        $mdToast.showSimple('Annotazione eliminata');
        $state.go('.', {}, {
            reload: true
        });
    }

    function _isVisible(annot) {
        let type = annot.type;
        let author = annot.provenance.author.email;
        let url = documentService.currentUrl;
        console.log(annot.target.source, url);

        if (annot.target.source !== url)
            return false;

        return true;

        //author = model.filters[author] ? model.filters[author].display : true;
        //return (model.filters[type].display && author);
    }
}
