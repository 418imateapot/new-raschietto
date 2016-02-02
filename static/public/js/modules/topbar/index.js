import TopbarController from './TopbarController.js';
import topbarDirective from './topbarDirective.js';

export default angular.module('teapot.modules.topbar', [])
.controller('TopbarController', TopbarController)
.directive('topBar', topbarDirective)
.name;
