

/**
 * @module teapot/conf
 * @desc
 * Funzioni eseguite in fase di configurazione dell'applicazione
 */
import userConfig from './user.js';
import routerConfig from './routes.js';

var conf = {
    user: userConfig,
    router: routerConfig
};

export {conf as default};
