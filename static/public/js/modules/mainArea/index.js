import angular from 'angular';

/**
 * @module teapot/modules/mainArea
 *
 * @description
 * Questo modulo visualizza il documento caricato e, si spera, permetterà un
 * giorno di leggere e scrivere le sue annotazioni
 *
 * ##### Componenti:
 *   - Direttiva: {@link teapot.modules.mainArea.mainAreaDirective}
 *   - Controller: {@link teapot.modules.mainArea.MainAreaController}
 */

import 'angular-sanitize';

import MainAreaController from './MainAreaController.js';
import mainAreaDirective from './mainAreaDirective.js';

export default angular.module('teapot.modules.mainArea', ['ngSanitize'])
    .directive('mainArea', mainAreaDirective)
    .controller('MainAreaController', MainAreaController)
    .name;
