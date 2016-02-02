userConfig.$inject = ['$rootScope', '$state', '$stateParams', 'userService', 'loginModal'];

/**
 * Ogni volta che l'applicazione cambia stato, verifica se sia
 * necessaria l'autenticazione per accedere al nuovo stato.
 */
export default function userConfig($rootScope, $state, $stateParams, userService, loginModal) {

    $rootScope.$on('$stateChangeStart', (event, toState, toParams) => {

        let autenticazione = ($stateParams.mode === "annotator");

        if (!autenticazione || userService.isLoggedIn)
            return;

        event.preventDefault();
        loginModal()
            .then(() => $state.go(toState.name, toParams))
            .catch((err) => {
                console.error(err);
                return $state.go('reader');
            });

    });
}
