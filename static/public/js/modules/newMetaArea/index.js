import MetaController from './MetaAreaController.js';
import metaAreaDirective from './metaAreaDirective.js';

export default angular.module('teapot.modules.newMetaArea', [])
.directive('newMetaArea', metaAreaDirective)
.controller('MetaController', MetaController)
.name;
