#!/usr/bin/env python2
# coding: utf-8

import os
import sys
from os import path, fork, execv, waitpid
from functools import wraps

REPO_DIR = path.dirname(path.realpath(__file__))
CURRENT_DIR = os.getcwd()
VIRTUALENV_NAME = 'env'
REQ_FILE = path.join(path.dirname(path.realpath(__file__)), 'requirements.txt')


def _spacer(func):
    """ Decorator per inserire spazio nell'output delle funzioni"""
    @wraps(func)
    def inner(*args, **kwargs):
        for i in range(1, 4):
            print ""
        return func(*args, **kwargs)
    return inner


def which(program):
    """Trova il path assoluto per il file eseguibile di un comando

    :param str program: Il nome con cui viene invocato il programma
    """
    def is_exe(fpath):
        return os.path.isfile(fpath) and os.access(fpath, os.X_OK)

    fpath, fname = os.path.split(program)
    if fpath:
        if is_exe(program):
            return program
    else:
        for path in os.environ["PATH"].split(os.pathsep):  # noqa
            path = path.strip('"')
            exe_file = os.path.join(path, program)
            if is_exe(exe_file):
                return exe_file
    return None


def _checkDir():
    """Verifica che ci troviamo nella directory corretta"""
    if CURRENT_DIR != REPO_DIR:
        os.chdir(REPO_DIR)
        print "cd into {}".format(REPO_DIR)


@_spacer
def makeVirtualenv(name='env'):
    """ Crea il virtualenv python in cui installare
    le dipendenze di Raschietto

    :param str name: Opzionale. Il nome del nuovo ambiente virtuale
    """
    print "=================================="
    print "Setting up the virtual environment"
    print "=================================="
    VIRTUALENV_NAME = name  # noqa
    pid = fork()
    if pid == 0:
        virtualenv_executable = which('virtualenv')
        execv(virtualenv_executable, ('virtualenv', name))
    else:
        status = waitpid(pid, 0)
        if status[1] != 0:
            print "ERROR! pip exited with status {}".format(status)
            sys.exit(1)


@_spacer
def installPyLibs(requirements_file=REQ_FILE):
    """ Installa le dependencies necessarie nel virtualenv"""
    print "===================================="
    print "Installing required python libraries"
    print "===================================="
    pid = fork()
    if pid == 0:
        pip_executable = path.join(REPO_DIR, VIRTUALENV_NAME, 'bin/pip')
        execv(pip_executable,
              ('pip', 'install', '-r',  requirements_file))
    else:
        status = waitpid(pid, 0)
        if status[1] != 0:
            print "ERROR! pip exited with status {}".format(status)
            sys.exit(1)


@_spacer
def setupNodeDeps():
    """Esegue *npm install* per installare le librerie JavaScript"""
    pid = fork()
    if pid == 0:
        print "==========================="
        print "Installing npm dependencies"
        print "(This may take a while... )"
        print "==========================="
        os.chdir('static')
        npm_path = which('npm')
        execv(npm_path, ('npm', 'i'))
    else:
        status = waitpid(pid, 0)
        if status[1] != 0:
            print "ERROR! npm exited with status {}".format(status)
            sys.exit(1)


@_spacer
def buildStaticFiles():
    """Esegue *gulp build* per compilare i file statici"""
    pid = fork()
    if pid == 0:
        print "==================="
        print "Starting gulp build"
        print "==================="
        os.chdir('static')
        gulp_path = which('gulp')
        execv(gulp_path, ('gulp', 'build'))
    else:
        status = waitpid(pid, 0)
        if status[1] != 0:
            print "ERROR! gulp exited with status {}".format(status)
            sys.exit(1)


@_spacer
def setupApacheStuff():
    """
    Compila i file di configurazione per Apache a partire
    dai template e crea la directory per i *log*
    """
    os.chdir('apache_files/')
    print "========================================"
    print "Creating apache config and log directory"
    print "========================================"
    with open('templates/site-template.conf', 'r') as f:
        template = f.read()
    conf_file = template.replace('_ROOT_DIR_', REPO_DIR)
    with open('010-raschietto.conf', 'w') as f:
        f.write(conf_file)
    os.chdir(REPO_DIR)
    try:
        os.mkdir(os.path.join(REPO_DIR, 'logs'), 0755)
    except OSError as err:
        import errno
        if err.errno != errno.EEXIST:
            raise
    print "Done!"


def makeIcon():
    """
    Crea il file *.desktop* per RaschiettoManager
    """
    with open('Manager.desktop', 'w') as f:
        desktop_file = """
[Desktop Entry]
Name=Raschietto Manager
Type=Application
Exec=python {}/manage.py gui
Terminal=false
""".format(REPO_DIR)
        f.write(desktop_file)
    os.chmod('Manager.desktop', 0o744)


@_spacer
def lastMessage():
    """
    Stampa un messaggio conclusivo
    """
    print """
Setup completato!
=================
Ora puoi eseguire come amministratore

  apache_files/install.sh

per installare il sito su macchina locale,
oppure copiare a mano le cartelle e il file
"apache_files/renameme.htaccess" sul server
remoto per mettere su tutta la baracca

NEW => prova il nuovo favoloso "raschietto manager"!
"""


##################################################
def setup():
    """
    Esegue tutti i task necessari per installare
    localmente Rachietto

    .. note:: This is the function you're looking for!
    """
    _checkDir()
    makeVirtualenv('env')
    installPyLibs(REQ_FILE)
    setupNodeDeps()
    buildStaticFiles()
    setupApacheStuff()
    makeIcon()
    lastMessage()


if __name__ == "__main__":
    setup()
