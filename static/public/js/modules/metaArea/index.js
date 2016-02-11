import MetaController from './MetaAreaController.js';
import metaAreaDirective from './metaAreaDirective.js';

export default angular.module('teapot.modules.metaArea', [])
.directive('metaArea', metaAreaDirective)
.controller('MetaController', MetaController)
.name;
