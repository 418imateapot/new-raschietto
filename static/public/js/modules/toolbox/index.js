import angular from 'angular';

import ToolboxController from './ToolboxController.js';
import toolboxDirective from './toolboxDirective.js';

let module = angular.module('teapot.modules.toolbox', [])
.directive('teapotToolbox', toolboxDirective)
.controller('ToolboxController', ToolboxController);

export default module.name;
