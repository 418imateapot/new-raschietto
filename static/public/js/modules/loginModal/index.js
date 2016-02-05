import angular from 'angular';

/**
 * Questo modulo visualizza una finestra modale per l'autenticazione.
 */
import ngCookies from 'angular-cookies';

import loginModal from './loginModalService.js';

export default angular.module('teapot.modules.login', [
    'ngCookies',
    'teapot.sharedServices'
]).service('loginModal', loginModal).name;
