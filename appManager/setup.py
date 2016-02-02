#!/usr/bin/env python2
# coding: utf-8

import os
import sys
import subprocess
from os import path, fork, execv, waitpid

from __init__ import REPO_DIR, CURRENT_DIR, VIRTUALENV_NAME, REQ_FILE


def run_command(command):
    """
    Takes a string array representing a command and executes it
    in a subprocess, piping output to an iterator
    """
    p = subprocess.Popen(command,
                         cwd=REPO_DIR,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT)
    return iter(p.stdout.readline, b'')


def spacer(func):
    """ Decorator to space the output of my functions """
    def inner(*args, **kwargs):
        for i in range(1, 4):
            print ""
        return func(*args, **kwargs)
    return inner


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


@spacer
def makeVirtualenv(name=VIRTUALENV_NAME):
    """ Creates a default virtualenv """
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


@spacer
def installPyLibs(requirements_file=REQ_FILE):
    """ Installs all required libraries in the virtualenv """
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


@spacer
def setupNodeDeps():
    """ Runs npm install in the static directory """
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


@spacer
def buildStaticFiles():
    """ Runs gulp to build the static files """
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


@spacer
def setupApacheStuff():
    """
    Compiles the configuration file template for apache
    and creates the logs directory
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


@spacer
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
def main():
    checkDir()
    makeVirtualenv('env')
    installPyLibs(REQ_FILE)
    setupNodeDeps()
    buildStaticFiles()
    setupApacheStuff()
    lastMessage()


def ugly_hack():
    comm = 'python setup.py'.split()
    return run_command(comm)

if __name__ == "__main__":
    main()
