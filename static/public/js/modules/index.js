/**
 * Questo modulo fa da contenitore per tutte le componenti
 * dell'applicazione.
 */
import metaArea from './metaArea/index.js';
import mainArea from './mainArea/index.js';
import docArea from'./docArea/index.js';
import login from './loginModal/index.js';
import navigator from './navigator/index.js';
import toolbox from './toolbox/index.js';
import annotationCard from './annotationCard/index.js';
import topbar from './topbar/index.js';
import annotatedText from './annotatedText/index.js';
import newAnnotation from './newAnnotation/index.js';
import editAnnotation from './editAnnotation/index.js';
import annotationFilter from './annotationFilter/index.js';
import stagingArea from './stagingArea/index.js';

export default angular.module('teapot.modules', [
    annotationCard,
    metaArea,
    docArea,
    mainArea,
    navigator,
    topbar,
    newAnnotation,
    editAnnotation,
    annotationFilter,
    annotatedText,
    stagingArea,
    toolbox,
    login
]).name;
