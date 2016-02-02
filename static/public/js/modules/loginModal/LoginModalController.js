LoginModalController.$inject = ['$scope', 'userService'];

export default function LoginModalController($scope, userService) {
    var loginModal = this;

    loginModal.cancel = function() {
        $scope.$dismiss("cancelled");
    };

    loginModal.submit = function(email, password) {
        var user = userService.login(email, password);
        $scope.$close(user);
    };
}
