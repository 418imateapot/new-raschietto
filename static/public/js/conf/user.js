userConfig.$inject = ['$rootScope', '$state', 'userService', 'loginModal'];

/**
 * Ogni volta che l'applicazione cambia stato, verifica se sia
 * necessaria l'autenticazione per accedere al nuovo stato.
 */
export default function userConfig($rootScope, $state, userService, loginModal) {

    $rootScope.$on('$stateChangeStart', (event, toState, toParams) => {

        let needsAuthentication = (toParams.mode === "annotator");

        if (!needsAuthentication || userService.isLoggedIn)
            return;

        event.preventDefault();
        loginModal(event)
            .then((user) => {
                $rootScope.$broadcast('login', {state: toParams.mode, user: user});
                $state.go(toState.name, toParams);
            })
            .catch((err) => {
                console.warn(err);
                toParams.mode = 'reader';
                $rootScope.$broadcast('login', {state: toParams.mode});
                return $state.go(toState.name, toParams);
            });
    });

}
