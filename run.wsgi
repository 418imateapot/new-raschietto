#!/usr/bin/env python
# coding: utf-8

"""
Entry point dell'applicazione python wsgi
Prepara l'ambiente prima di importare
l'applicazione flask
"""

import os
import sys

# Ottieni il path assoluto della cartella cgi
binpath = os.path.dirname(os.path.realpath(__file__))

# Attiva l'ambiente virtuale python
activate_this = os.path.join(binpath, 'env/bin/activate_this.py')
execfile(activate_this, dict(__file__=activate_this))

# Aggiungi la cartella cgi al python path
sys.path.insert(0, binpath)

# Importa l'applicazione flask come applicazione wsgi
from teapot import app as application  # NOQA  Ignora "errore"
