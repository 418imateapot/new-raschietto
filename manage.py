#!/usr/bin/env python
# coding: utf-8
"""
Funzioni utili per la gestione del server
da riga di comando
"""


# Attiva l'ambiente virtuale python
from os import path
binpath = path.dirname(path.realpath(__file__))
activate_this = path.join(binpath, 'env/bin/activate_this.py')
execfile(activate_this, dict(__file__=activate_this))


from flask.ext.script import Manager

from teapot import app
from appManager import commands

manager = Manager(app)


def _printFuncOutput(func, *args, **kwargs):
    for line in func(*args, **kwargs):
        print line


@manager.command
def info():
    """Stampa una lista di variabili d'ambiente relative a Flask
    nella forma *chiave==valore*
    """
    for c in app.config:
        print "{}=={}".format(c, app.config[c])


@manager.command
def setup(target="all"):
    """
    Installa tutte le dependencies di Raschietto e compilaa i file statici
    """
    fun = None
    if target == "js":
        print "no output available. But it's working, I swear"
        fun = commands.setupNodeDeps
    elif target == "py":
        fun = commands.setupPyDeps
    else:
        from appManager.setup import setup
        fun = setup
    _printFuncOutput(fun)


@manager.command
def addDocument(url):
    """
    Aggiungi un documento a fuseki

    :param string: url L'URL del documento da aggiungere
    """
    if not url:
        print "stocazzo"
    from teapot.boris import docloader
    print docloader.add_document_to_fuseki(url)


@manager.command
def build():
    """
    Compila tutti i file statici di Raschietto
    """
    _printFuncOutput(commands.buildStaticFiles, False)


@manager.command
def watch():
    """
    Compila tutti i file statici di Raschietto e rimane
    in attesa di ulteriori modifiche da ricompilare
    """
    _printFuncOutput(commands.buildStaticFiles, True)


@manager.command
def apacheConf():
    """
    Genera la configurazione di Apache necessaria
    per installare Raschietto.

    .. warning:: Probabilmente è un'idea migliore eseguire l'installazione a manoni...
    """
    _printFuncOutput(commands.setupApacheStuff)


@manager.command
def gui():
    """
    Avvia la *'splendida'* GUI di RaschiettoManager
    """
    from appManager.manager_gui import vp_start_gui
    vp_start_gui()

if __name__ == "__main__":
    manager.run()
