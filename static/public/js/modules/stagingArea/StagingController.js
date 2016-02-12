StagingController.$inject = ['newAnnotationService'];

/**
 * Controller per l'area di sosta
 */
export default function StagingController(newAnnotationService) {

    const model = this;

    model.pending = [];

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
        console.log(model.pending);
    }
}
