TopbarController.$inject = ['$mdSidenav', '$mdToast', 'annotationService'];

export
default
function TopbarController($mdSidenav, $mdToast, annotationService) {

    const model = this;

    model.showSearch = false;
    model.infoText = "Mostra filtri";

    // Controlla il pulsante mostra/nascondi filtri
    model.toggleFilters = () => {
        if ($.isEmptyObject(annotationService.filters)) {
            // Non mostrare i filtri se non c'è nulla da filtrare
            $mdToast.showSimple('Nessuna annotazione da filtrare');
            model.showFilters = false;
        } else {
            model.showFilters = !model.showFilters;

            if (model.showingFilters) {
                model.infoText = "Mostra filtri";
                model.showingFilters = false;
            } else {
                model.infoText = "Nascondi filtri";
                model.showingFilters = true;
            }
        }
    };

    model.toggleSidenav = side => $mdSidenav(side).toggle();
    model.toggleSearch = () => model.showSearch = !model.showSearch;

}
