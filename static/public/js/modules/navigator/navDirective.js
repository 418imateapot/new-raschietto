export function navDirective () {
    return {
        restrict: "AE",
        templateUrl: 'js/modules/navigator/navView.html',
        scope: {},
        controller: 'NavController',
        controllerAs: 'navigator'
    };
}

/**
 * Direttiva extra per visualizzare il pulsante
 * menu in alto a sinistra
 */
export function menuButton () {
    return {
        restrict: "AE",
        template: `
        <md-button ng-click="navigator.open()" class="md-icon-button" aria-label="Menu">            <md-icon class="material-icons">menu</md-icon>
        </md-button>`,
        scope: {},
        controller: 'NavController',
        controllerAs: 'navigator'
    };
}
