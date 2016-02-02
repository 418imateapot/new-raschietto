# encoding: utf-8
"""
Gestisce il routing per l'api server-side di raschietto
"""
from flask import request, Response

from .boris.documents import get_doc
from . import app


@app.route('/docs', methods=['GET'])
def get_document():
    """Dato un URL come *querystring*,
    restituisce l'html del documento corrispondente"""
    doc_url = request.args.get('url')
    return get_doc(doc_url)


@app.route('/annotations', methods=['GET'])
def get_annotations():
    doc_url = request.args.get('url')
    # CHIAMA LO SCRAPER
    # RESTITUISCI RISULTATO
    return "<h1>Nulla da vedere</h1>"


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """Restituisci 404 per tutti gli URL
    che non fanno match con nulla
    """
    return Response(status=404, response="{} Not Found".format(path))
