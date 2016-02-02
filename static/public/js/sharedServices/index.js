import ngCookies from 'angular-cookies';

import documentService from './documentService.js';
import annotationService from './annotationService.js';
import userService from './userService.js';

/**
 * @module teapot/sharedServices
 *
 * @description
 * Questo modulo espone alcuni servizi condivisi utili al
 * resto dell'applicazione:
 * <ul>
 *   <li>Annotation Service {@link module:teapot/sharedServices/annotationService}</li>
 *   <li>Document Service {@link module:teapot/sharedServices/documentService}</li>
 * </ul>
 */
export default angular.module('teapot.sharedServices', ['ngCookies'])
    .factory('documentService', documentService)
    .factory('annotationService', annotationService)
    .service('userService', userService)
    .name;
