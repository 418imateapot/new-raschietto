/**
 * Questo modulo fa da contenitore per tutte le componenti
 * dell'applicazione.
 */
import metaArea from './metaArea/index.js';
import mainArea from './mainArea/index.js';
import docArea from'./docArea/index.js';
import login from './loginModal/index.js';
import navigator from './navigator/index.js';
import annotationCard from './annotationCard/index.js';
import topbar from './topbar/index.js';
import annotatedText from './annotatedText/index.js';
import annotationFilter from './annotationFilter/index.js';
import stagingArea from './stagingArea/index.js';
import annotationEditor from './annotationEditor/index.js';

export default angular.module('teapot.modules', [
    annotationCard,
    metaArea,
    docArea,
    mainArea,
    navigator,
    topbar,
    annotationFilter,
    annotatedText,
    stagingArea,
    annotationEditor,
    login
]).name;
