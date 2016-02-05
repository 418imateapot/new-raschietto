userService.$inject = ['$cookies'];

export default function userService($cookies) {

    const service = this;

    service.isLoggedIn = false;
    service.userName = '';


    service.storeLastDocument = function(doi) {
        //TODO implementation
        console.info("Saving last open document");
    };

    /**
     * Esegue il login e setta un cookie
     * @return {object} Un dizionario con le credenziali di accesso
     */
    service.login = function(email, password) {

        let credenziali = {
            email: email,
            password: password
        };

        $cookies.put('credenziali', JSON.stringify(credenziali));
        service.isLoggedIn = true;
        return email;
    };

}
