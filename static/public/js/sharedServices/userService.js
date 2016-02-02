export default class userService {

    constructor($cookies) {
        this.cookies = $cookies;
        this.isLoggedIn = false;
        this.userName = '';
    }

    storeLastDocument(doi) {
        //TODO implementation
        console.info("Saving last open document");
    }

    /**
     * Esegue il login e setta un cookie
     * @return {object} Un dizionario con le credenziali di accesso
     */
    login(email, password) {

        var credenziali = {
            email: email,
            password: password
        };

        $cookies.put('credenziali', JSON.stringify(credenziali));
        return email;
    }

}

userService.$inject = ['$cookies'];
