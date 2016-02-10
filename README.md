# Raschietti per tutti

Progetto di techweb 2015/16!!

## Requisiti
* server apache 2.4
* python 2.7
* python virtualenv
* nodejs + npm (una versione recente magari.. consiglio di usare [nvm](https://github.com/creationix/nvm))
* jspm (installare con "npm install --global jspm")


## Installazione
1. Clonare il repository da qualche parte:

  ```bash
    $ git clone https://github.com/418imateapot/new-raschietto.git
    ```
2. Eseguire lo script di setup

  ```bash
  $ raschietto/setup.py
  ```
3a. Installare i file di configurazione appropriata dalla subdirectory "apache_files" (dopo aver letto il secondo README che li accompagna).
    --OPPURE--
3b. Eseguire lo script di installazione nella dalla subdirectory "apache_files" con permessi di root e sperare per il meglio...

4. Nel dubbio, riavviare apache non ha mai fatto male a nessuno.
