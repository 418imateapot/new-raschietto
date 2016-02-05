newAnnotationService.$inject = ['$cookies'];

export default function newAnnotationService($cookies) {

    const service = this;


    ////////////////////
    // Implementation //
    ////////////////////

    function _saveLocal(newAnnotations) {
        $cookies.putObject('pending', newAnnotations);
    }

}
