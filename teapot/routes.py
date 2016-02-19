# encoding: utf-8
"""
Gestisce il routing per l'api server-side di raschietto
"""
from flask import request, Response
from flask import make_response
from json.decoder import JSONDecoder

from .boris.documents import get_doc
# from .boris.remoteScraping import scrape
from .boris.remote_scrapingNUOVO import scrape
from .update import generateGraphFromJSON, edit_graph
from boris.docloader import add_document_to_fuseki
from . import app


@app.route('/docs', methods=['GET', 'POST'])
def get_document():
    """Dato un URL come *querystring*,
    restituisce l'html del documento corrispondente"""
    if request.method == 'POST':
        doc_url = JSONDecoder().decode(request.data)['url']
        return add_document_to_fuseki(doc_url)
    elif request.method == 'GET':
        doc_url = request.args.get('url')
        return get_doc(doc_url)


@app.route('/annotations', methods=['POST', 'PUT'])
def modify_annotations():
    annotations = JSONDecoder().decode(request.data)['items']
    turtle = []
    for a in annotations:
        turtle.append(generateGraphFromJSON(a))
    turtle = ''.join(turtle)
    if request.method == 'PUT':
        return edit_graph(turtle, action='INSERT')
    elif request.method == 'POST':
        return edit_graph(turtle, action='DELETE')


@app.route('/scraper', methods=['GET'])
def scrape_document():
    doc_url = request.args.get('url')
    return scrape(doc_url)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """Restituisci 404 per tutti gli URL
    che non fanno match con nulla
    """
    return Response(status=404, response="{} Not Found".format(path))
