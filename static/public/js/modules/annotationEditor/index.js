import NewAnnotationController from './NewAnnotationController.js';
import newAnnotationDirective from './newAnnotationDirective.js';
import AnnotationEditorController from './AnnotationEditorController.js';
import modifyAnnotationDirective from './modifyAnnotationDirective.js';
import ModifyAnnotationController from './ModifyAnnotationController.js';

export default angular.module('teapot.modules.annotationEditor', [])
    .directive('newAnnotation', newAnnotationDirective)
    .directive('modifyAnnotation', modifyAnnotationDirective)
    .controller('NewAnnotationController', NewAnnotationController)
    .controller('ModifyAnnotationController', ModifyAnnotationController)
    .name;
