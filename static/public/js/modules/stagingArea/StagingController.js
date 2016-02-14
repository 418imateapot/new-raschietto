StagingController.$inject = ['newAnnotationService'];

/**
 * Controller per l'area di sosta
 */
export default function StagingController(newAnnotationService) {

    const model = this;

    model.pending = [];
    model.loading = true;
    model.delete = _delete;

    _init();

    //
    ////////////////////
    // Implementation //
    ////////////////////

    function _init() {
        let pending = newAnnotationService.retrieveLocal();
        console.log(pending);
        pending.forEach(anno => {
            model.pending = model.pending.concat(newAnnotationService.fusekify(anno));
        });
        model.loading = false;
    }

    function _delete(elem) {
        model.pending.splice(elem, 1);
        let pending = model.pending.map(el => newAnnotationService.defusekify(el));
        newAnnotationService.saveLocal(pending, true);
    }
}
