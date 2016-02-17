TopbarController.$inject = ['$mdSidenav'];

export default function TopbarController($mdSidenav) {

    const model = this;

    model.showSearch = false;

    model.toggleFilters = () => {
        model.showFilters = !model.showFilters;
    };

    model.toggleSidenav = side => $mdSidenav(side).toggle();
    model.toggleSearch = () => model.showSearch = !model.showSearch;

}
