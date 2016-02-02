#!/usr/bin/env python2
# coding: utf-8

import os
from os import path

REPO_DIR = path.abspath(path.join(path.dirname(path.realpath(__file__)), '..'))
CURRENT_DIR = os.getcwd()
VIRTUALENV_NAME = 'env'
REQ_FILE = path.join(REPO_DIR, 'requirements.txt')
