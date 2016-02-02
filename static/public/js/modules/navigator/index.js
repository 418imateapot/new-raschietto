import angular from 'angular';

import NavController from './NavController.js';
import ToolsDialogController from './ToolsDialogController.js';
import {navDirective, menuButton} from './navDirective.js';

let module = angular.module('teapot.modules.navigator', [])
.directive('teapotNavigator', navDirective)
.directive('teapotMenubutton', menuButton)
.controller('NavController', NavController)
.controller('ToolsDialogController', ToolsDialogController);

export default module.name;
