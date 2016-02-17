import NewAnnotationController from './NewAnnotationController.js';
import newAnnotationDirective from './newAnnotationDirective.js';
import AnnotationEditorController from './AnnotationEditorController.js';

export default angular.module('teapot.modules.annotationEditor', [])
    .directive('newAnnotation', newAnnotationDirective)
    .controller('NewAnnotationController', NewAnnotationController)
    .name;
