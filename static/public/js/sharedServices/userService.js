userService.$inject = ['$cookies', 'documentService'];

export default function userService($cookies, documentService) {

    const service = this;

    service.isLoggedIn = false;
    service.userName = '';
    service.userEmail = '';

    service.storeLastDocument = function() {
        if (documentService.currentUrl) {
            if(service.userEmail) {
                $cookies.put(service.userEmail, documentService.currentUrl);
            } else {
                $cookies.put('guest', documentService.currentUrl);
            }
        }
    };

    service.lastDocument = function() {
        let key = service.userEmail || 'guest';
        return $cookies.get(key);
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

        service.storeLastDocument();

        return username;
    };

    service.logout = function() {

        $cookies.remove('credenziali');
        service.isLoggedIn = false;
        service.userName = '';
        service.userEmail = '';

    };


}
