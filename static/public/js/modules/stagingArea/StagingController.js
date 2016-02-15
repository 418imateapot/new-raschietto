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

    _init();

    //
    ////////////////////
    // Implementation //
    ////////////////////

    function _init() {
        let pending = newAnnotationService.retrieveLocal();
        pending.forEach(anno => {
            model.pending = model.pending.concat(newAnnotationService.fusekify(anno));
        });
        model.loading = false;
    }

    function _saveAll() {
        newAnnotationService.updateRemote(model.pending)
        .then(r => $mdToast.showSimple('Annotazioni salvate'))
        .catch(e => $mdToast.showSimple('C\'è stato un problema!'));
    }

    function _delete(elem) {
        model.pending.splice(elem, 1);
        let pending = model.pending.map(el => newAnnotationService.defusekify(el));
        newAnnotationService.saveLocal(pending, true);
        $mdToast.showSimple('Annotazione eliminata');
    }
}
