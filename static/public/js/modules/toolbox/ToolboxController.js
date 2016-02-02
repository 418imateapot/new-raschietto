ToolboxController.$inject = ['$scope', '$state', '$stateParams'];

export
default
function ToolboxController($scope, $state, $stateParams) {
    var model = this;

    model.active = _selectActiveTab();
    $scope.syncURL = (id) => $state.go('.', {toolId: id});

    function _selectActiveTab() {
        switch ($stateParams.toolId) {
            case 'documents':
                return '0';
            case 'annotations':
                return '1';
            case 'filters':
                return '2';
        }
    }

}
