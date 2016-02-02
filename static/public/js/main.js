/**
 * Questo è l'entry point dell'applicazione, dove
 * vengono registrate tutte le componenti necessarie
 * al suo funzionamento.
 *
 * @module teapot
 */

// Load the Angular Material CSS associated with ngMaterial
// then load the main.css to provide overrides, etc.
import 'angular-material/angular-material.css!';
import 'styles/main.scss!';

import $ from 'jquery';
import angular from 'angular';
import ngAnimate from 'angular-animate';
import material from 'angular-material';
import ngMessages from 'angular-messages';
import router from 'angular-ui-router';

// Componenti dell'applicazione
import conf from './conf/index.js';
import sharedServices from './sharedServices/index.js';
import teapotModules from './modules/index.js';
import ApplicationController from './application/ApplicationController.js';
import appService from './application/appService.js';

var app = angular.module('teapot', [
    'ui.router',
    'ngAnimate',
    material,
    ngMessages,
    sharedServices,
    teapotModules
]);

/* Registra le ROUTE */
app.config(conf.router);
//app.run(conf.auth);
app.controller('ApplicationController', ApplicationController);
app.service('appService', appService);
