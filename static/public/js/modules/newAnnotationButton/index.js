import NewAnnotationController from './NewAnnotationController.js';
import newAnnotationDirective from './newAnnotationDirective.js';
import EditorController from '../annotationEditor/AnnotationEditorController.js';

export default angular.module('teapot.modules.newAnnotationButton', [])
    .directive('newAnnotation', newAnnotationDirective)
    .controller('NewAnnotationController', NewAnnotationController)
    .controller('EditorController', EditorController)
    .name;
