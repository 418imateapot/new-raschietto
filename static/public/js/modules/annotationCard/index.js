import AnnotationCardController from './AnnotationCardController.js';
import annotationCardDirective from './annotationCardDirective.js';

export default angular.module('teapot.modules.annotationCard', [])
    .directive('annotationCard', annotationCardDirective)
    .controller('AnnotationCardController', AnnotationCardController)
    .name;
