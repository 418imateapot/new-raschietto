/**
 * Questo modulo visualizza la lista dei documenti disponibili e permette di
 * sceglierne uno da visualizzare.<br/>
 * Su Desktop appare come un barra di ricerca con autocompletamento
 * Su Mobile lo sa la Madonna.
 *
 * ##### Componenti:
 *   - Direttiva: {@link teapot.modules.docArea.docAreaDirective}
 *   - Controller: {@link teapot.modules.docArea.DocumentController}
 */

import DocumentController from './DocAreaController.js';
import docAreaDirective from './docAreaDirective.js';
import docBarDirective from './docBarDirective.js';

export default angular.module('teapot.modules.docArea', ['teapot.sharedServices'])
    .directive('docArea', docAreaDirective)
    .directive('docBar', docBarDirective)
    .controller('DocumentController', DocumentController)
    .name;
