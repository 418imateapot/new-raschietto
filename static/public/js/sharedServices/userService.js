userService.$inject = ['$cookies'];

export default function userService($cookies) {

    const service = this;

    service.isLoggedIn = false;
    service.userName = '';
    service.userEmail = '';


    service.storeLastDocument = function(doi) {
        //TODO implementation
        console.info("Saving last open document");
    };

    /**
     * Esegue il login e setta un cookie
     */
    service.login = function(username, email) {

        let credenziali = {
            username: username,
            email: email
        };

        service.userName = username;
        service.userEmail = email;

        $cookies.put('credenziali', JSON.stringify(credenziali));
        service.isLoggedIn = true;
        return username;
    };

    service.logout = function() {

        $cookies.remove('credenziali');
        service.isLoggedIn = false;
        service.userName = '';
        service.userEmail = '';

    };


}
