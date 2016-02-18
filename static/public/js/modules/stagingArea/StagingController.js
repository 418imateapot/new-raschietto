StagingController.$inject = ['$mdToast', 'newAnnotationService'];

/**
 * Controller per l'area di sosta
 */
export default function StagingController($mdToast, newAnnotationService) {

    const model = this;

    model.pending = [];
    model.loading = true;
    model.delete = _delete;
    model.saveAll = _saveAll;
    //model.isVisible = _isVisible;
    model.isEmpty = true;

    _init();

    //
    ////////////////////
    // Implementation //
    ////////////////////

    function _init() {
        model.pending = newAnnotationService.retrieveLocal();
        console.log(model.pending);
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

    function _delete(elem) {
        model.pending.splice(elem, 1);
        newAnnotationService.nuke();
        newAnnotationService.saveLocal(model.pending);
        $mdToast.showSimple('Annotazione eliminata');
    }

    function _isVisible(annot) {
        /*
        let type = annot.type.value;
        let author = annot.provenance.value;
        author = model.filters[author] ? model.filters[author].display : true;
        return (model.filters[type].display && author);
        */
    }
}
