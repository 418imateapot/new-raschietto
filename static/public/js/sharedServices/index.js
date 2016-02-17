import ngCookies from 'angular-cookies';

import documentService from './documentService.js';
import annotationService from './annotationService.js';
import userService from './userService.js';
import newAnnotationService from './newAnnotationService.js';
import utilityService from './utilityService.js';
import selectionService from './selectionService.js';

/**
 * Questo modulo espone i servizi condivisi utilizzati
 * dal resto dell'applicazione:
 */
export default angular.module('teapot.sharedServices', ['ngCookies'])
    .service('documentService', documentService)
    .service('annotationService', annotationService)
    .service('userService', userService)
    .service('newAnnotationService', newAnnotationService)
    .service('utilityService', utilityService)
    .service('selectionService', selectionService)
    .name;
