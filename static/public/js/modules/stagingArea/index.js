import StagingController from './StagingController.js';
import stagingDirective from './stagingDirective.js';

export default angular.module('teapot.modules.stagingArea', [])
.directive('stagingArea', stagingDirective)
.controller('StagingController',StagingController)
.name;
