/**
 * Questo è l'entry point dell'applicazione, dove
 * vengono registrate tutte le componenti necessarie
 * al suo funzionamento.
 */

// Load the Angular Material CSS associated with ngMaterial
// then load the main.css to provide overrides, etc.
import 'angular-material/angular-material.css!';
import 'styles/main.scss!';

import $ from 'jquery';
import rangy from 'rangy';
// Questo modo di importare non è ideale, ma il tempo è tiranno...
import '../jspm_packages/github/timdown/rangy-release@1.3.0/rangy-classapplier.js';
import '../jspm_packages/github/timdown/rangy-release@1.3.0/rangy-highlighter.js';
import angular from 'angular';
import ngAnimate from 'angular-animate';
import material from 'angular-material';
import ngMessages from 'angular-messages';
import router from 'angular-ui-router';
import localStorage from 'angular-local-storage';
import pagination from 'angular-utils-pagination';

// Componenti dell'applicazione
import conf from './conf/index.js';
import sharedServices from './sharedServices/index.js';
import teapotModules from './modules/index.js';
import ApplicationController from './ApplicationController.js';

var app = angular.module('teapot', [
    'ui.router',
    'ngAnimate',
    'LocalStorageModule',
    'angularUtils.directives.dirPagination',
    material,
    ngMessages,
    sharedServices,
    teapotModules
]);

/* Registra le ROUTE */
app.config(conf.router);
app.run(conf.user);
app.controller('ApplicationController', ApplicationController);
