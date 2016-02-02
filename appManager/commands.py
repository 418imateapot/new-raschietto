#!/usr/bin/env python2
# coding: utf-8

import os
import sys
import subprocess
from os import path

from . import CURRENT_DIR, REPO_DIR, REQ_FILE


def run_command(command, directory):
    """
    Takes a string representing a command and executes it
    in a subprocess, piping output to an iterator
    """
    p = subprocess.Popen(command,
                         cwd=directory,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT)
    return iter(p.stdout.readline, b'')


def which(program):
    """ Finds the path of the executable for a given command """
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


def checkDir():
    """ Checks that we are in the correct directory """
    if CURRENT_DIR != REPO_DIR:
        os.chdir(REPO_DIR)
        print "cd into {}".format(REPO_DIR)


def setupPyDeps():
    """
    Install python dependencies listed in requirements.txt
    along with a virtualenv, if necessary
    """
    # Setup a virtualenv if there isn't any
    if not os.path.isdir('env'):
        virtualenv_executable = which('virtualenv')
        command = [virtualenv_executable, 'env']
        yield "==================================\n"
        yield "Setting up the virtual environment\n"
        yield "==================================\n"
        for line in run_command(command, '.'):
            yield line

    # Install deps
    pip_executable = path.join(REPO_DIR, 'env', 'bin/pip')
    command = [
        pip_executable,
        'install',
        '-r',
        REQ_FILE
        ]
    yield "====================================\n"
    yield "Installing required python libraries\n"
    yield "====================================\n"
    for line in run_command(command, '.'):
        yield line
    yield "\nAll done!\n======\n"


def setupNodeDeps():
    """ Runs npm install in the static directory """
    npm_path = which('npm')
    command = [npm_path, 'install', '--parseable']
    for line in run_command(command, 'static'):
        yield line


def buildStaticFiles(watch=False):
    if watch:
        command = ['gulp']
    else:
        command = ['gulp', 'build']
    for line in run_command(command, 'static'):
        yield line


def setupApacheStuff():
    """
    Compiles the configuration file template for apache
    and creates the logs directory
    """
    os.chdir('apache_files/')
    yield "========================================\n"
    yield "Creating apache config and log directory\n"
    yield "========================================\n"
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
    yield """Fatto!\n----
Ora puoi eseguire come amministratore

  apache_files/install.sh

per installare il sito su macchina locale,
oppure copiare a mano le cartelle e il file
"apache_files/renameme.htaccess" sul server
remoto per mettere su tutta la baracca
"""


def lastMessage():
    print """
Setup completato!
=================
Ora puoi eseguire come amministratore

  apache_files/install.sh

per installare il sito su macchina locale,
oppure copiare a mano le cartelle e il file
"apache_files/renameme.htaccess" sul server
remoto per mettere su tutta la baracca
"""


##################################################
def setup():
    checkDir()
    makeVirtualenv('env')
    installPyLibs(REQ_FILE)
    setupNodeDeps()
    buildStaticFiles()
    setupApacheStuff()
    lastMessage()


if __name__ == "__main__":
    setup()
