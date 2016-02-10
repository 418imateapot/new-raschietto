import filterDirective from './filterDirective.js';
import FilterController from './FilterController.js';

export default angular.module('teapot.modules.annotationFilter', [])
    .directive('annotationFilter', filterDirective)
    .controller('FilterController', FilterController)
    .name;

