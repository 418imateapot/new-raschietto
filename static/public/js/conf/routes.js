//TODO redirect a tutorial se l'utente è nuovo, se no carica ultimo doc

routerConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

/**
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
    $urlRouterProvider.otherwise(() => {
        console.log('REDIRECT');
        return '/teapot/reader';
    });

    $stateProvider
    /* Il secondo segmento dell'url determina
     * la modalita' (reader o annotator)
     */
        .state('teapot', {
            url: '/teapot'
        })
        // reader || annotator
        .state('teapot.mode', {
            url: '/{mode:reader|annotator}', // regex path matching
            views: {
                '@': {
                    template: '<main-area></main-area>'
                }
            }
        })
        /* Pagina tutorial */
        .state('teapot.mode.tutorial', {
            url: '/tutorial',
            templateUrl: 'js/modules/tutorial/tutorialView.html',
            views: {
                '@': {
                    templateUrl: 'js/modules/tutorial/tutorialView.html'
                }
            }
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
