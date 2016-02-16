import angular from 'angular';

import NavController from './NavController.js';
import {navDirective, menuButton} from './navDirective.js';

export default angular.module('teapot.modules.navigator', [])
.directive('teapotNavigator', navDirective)
.directive('teapotMenubutton', menuButton)
.controller('NavController', NavController)
.name;
