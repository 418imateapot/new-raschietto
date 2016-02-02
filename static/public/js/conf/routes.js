//TODO redirect a tutorial se l'utente è nuovo, se no carica ultimo doc

routerConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

/**
 * @function
 * Configura le routes all'interno dell'applicazione
 */
export
default

function routerConfig($stateProvider, $urlRouterProvider, $locationProvider) {

    /* html5Mode permette di avere url puliti (senza abuso di #) */
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
    });
    /* Default route, se nessun altro fa match */
    $urlRouterProvider
    // Se nessun documento è caricato, redirect alla lista
        .when('/{mode}', [
            '$match',
            ($match) => $match.doi ? false : `/${$match.mode || 'reader'}/docs`
        ])
    /* Se nessuna tab del toolbox e' specificata, apri annotations */
        .when('/{mode}/docs/{doi}/tools', [
            '$match',
            ($match) => `/${$match.mode}/docs/${$match.doi}/tools/annotations`
        ])
        .otherwise('/reader');

    $stateProvider
    /* Il secondo segmento dell'url determina
     * la modalita' (reader o annotator)
     */
        .state('mode', {
            url: '/{mode:reader|annotator}' // regex path matching
        })
        /* Pagina tutorial */
        .state('mode.tutorial', {
            url: '/tutorial',
            templateUrl: 'js/modules/tutorial/tutorialView.html',
        })
        /* Lista dei documenti */
        .state('mode.docs', {
            url: '/docs',
            views: {
                '@': {
                    template: '<doc-area></doc-area>'
                }
            }
        })
        /* Singolo documento caricato */
        .state('mode.docs.document', {
            url: '/:doi',
            views: {
                '@': {
                    template: '<main-area content="app.content"></main-area>'
                }
            }

        })
        /* Toolbox */
        .state('mode.docs.document.tools', {
            url: '/tools',
            views: {
                '@': {
                    template: `
<teapot-toolbox annotations-loading="{{app.annotationsLoading}}"
                    annotations="app.annotations">
</teapot-toolbox>`
                }
            }

        })
        /* Toolbox tab */
        .state('mode.docs.document.tools.tab', {
            url: '/:toolId',
        });



    //////////////////////////
    //-- Funzioni interne --//
    //////////////////////////

    redirectToReader.$inject = ['$match'];

    function redirectToReader($match) {
        let doi = $match.doi;
        return doi ? `/raschietto/docs/${doi}/reader` : false;
    }


}
