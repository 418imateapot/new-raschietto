import annotatedText from './annotatedDirective.js';
import AnnotatedTextController from './AnnotatedController.js';

export default angular.module('teapot.modules.annotatedText', [])
    .directive('annotatedText', annotatedText)
    .controller('AnnotatedTextController', AnnotatedTextController)
    .name;

