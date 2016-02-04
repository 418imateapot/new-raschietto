ToolboxController.$inject = ['$scope', '$state', '$stateParams'];

export
default

function ToolboxController($scope, $state, $stateParams) {
    var model = this;

    model.selected = {};

    model.active = _selectActiveTab();
    model.toggle = _toggle;
    model.exists = _exists;

    $scope.syncURL = (id) => $state.go('.', {
        toolId: id
    });


    //////////////////////////
    //-- Inner funcstions --//
    //////////////////////////

   
    function _toggle(item) {
        // Bit flippin' man
        model.filters[item].display = !model.filters[item].display;
    }

    function _exists(item) {
        return model.filters[item].display;
    }

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
