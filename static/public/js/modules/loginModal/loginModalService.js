loginModal.$inject = ['$mdDialog', '$rootScope', 'userService'];

export
default
function loginModal($mdDialog, $rootScope, userService) {

    return function(event) {
        let promise = $mdDialog.show({
            controller: DialogController,
            controllerAs: 'loginModal',
            templateUrl: 'js/modules/loginModal/loginView.html',
            parent: angular.element(document.body),
            targetEvent: event,
            clickOutsideToClose: true
        });
        return promise;
    };


    function DialogController($mdDialog) {
        const dialog = this;

        dialog.hide = function() {
            $mdDialog.cancel("cancelled");
        };
        dialog.cancel = function() {
            $mdDialog.cancel("cancelled");
        };
        dialog.submit = function(email, password) {
            let user = userService.login(email, password);
            $mdDialog.hide(user);
        };
    }


    function assignCurrentUser(user) {
        $rootScope.currentUser = user;
        return user;
    }

}
