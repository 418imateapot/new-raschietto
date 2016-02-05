userConfig.$inject = ['$rootScope', '$state', '$stateParams', 'userService', 'loginModal'];

/**
 * Ogni volta che l'applicazione cambia stato, verifica se sia
 * necessaria l'autenticazione per accedere al nuovo stato.
 */
export default function userConfig($rootScope, $state, $stateParams, userService, loginModal) {

    $rootScope.$on('$stateChangeSuccess', (event, toState, toParams) => {

        let needsAuthentication = ($stateParams.mode === "annotator");

        if (!needsAuthentication || userService.isLoggedIn) {
            console.log('niente da fare');
            return;
        }

        event.preventDefault();
        loginModal(event)
            .then(() => $state.go('.', {mode: 'annotator'}))
            .catch((err) => {
                console.error(err);
                return $state.go('.', {mode: 'reader'});
            });

    });
}
