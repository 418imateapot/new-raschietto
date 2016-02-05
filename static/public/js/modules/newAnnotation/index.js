import NewAnnotationController from './NewAnnotationController.js';
import newAnnotationDirective from './newAnnotationDirective.js';

export default angular.module('teapot.modules.newAnnotation', [])
    .directive('newAnnotation', newAnnotationDirective)
    .controller('NewAnnotationController', NewAnnotationController)
    .name;
