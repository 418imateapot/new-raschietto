TopbarController.$inject = ['$scope', '$mdSidenav', '$state', '$stateParams'];

export default function TopbarController($scope, $mdSidenav, $state, $stateParams) {
    var model = this;

    model.showSearch = false;
    model.showTools = !!($stateParams.toolId);

    model.toggleFilters = () => {
        model.showFilters = !model.showFilters;
    };

    model.toggleSidenav = side => $mdSidenav(side).toggle();
    model.toggleSearch = () => model.showSearch = !model.showSearch;
    model.closeTools = () => {
        $state.go('mode.docs.document', {
                toolId: undefined
            })
            .then(() => model.showTools = false);
    };

    $scope.$on('$stateChangeSuccess', () => {
        model.showTools = !!($stateParams.toolId);
    });

}
