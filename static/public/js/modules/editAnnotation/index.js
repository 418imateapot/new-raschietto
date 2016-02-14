import EditAnnotationController from './EditAnnotationController.js';
import editAnnotationDirective from './editAnnotationDirective.js';

export default angular.module('teapot.modules.editAnnotation', [])
    .directive('editAnnotation', editAnnotationDirective)
    .controller('EditAnnotationController', EditAnnotationController)
    .name;
