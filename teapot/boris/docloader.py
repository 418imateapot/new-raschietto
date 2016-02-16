# coding: utf-8
"""
Funzioni per aggiungere titolo, doi e url di un documento al triple store
"""

import requests
import rdflib

from urlparse import urlparse
from rdflib.namespace import RDF
from rdflib import Namespace, Literal, URIRef
from lxml import html
from SPARQLWrapper import SPARQLWrapper


def upload_graph(serialized_graph):
    """
    Upload stuff
    """
    tps_graph = "http://vitali.web.cs.unibo.it/raschietto/graph/ltw1543"

    query = """INSERT DATA {
        GRAPH <%s> { %s }
    }""" % (tps_graph, serialized_graph)

    # NB: Usare 'DELETE' al posto di 'INSERT' per rimuovere
    # i dati dal triplestore

    sparql = SPARQLWrapper(
        "http://tweb2015.cs.unibo.it:8080/data/update?user{}&pass={}".format(
            "ltw1543", "43het5=!X"))
    sparql.setQuery(query)
    sparql.setMethod('POST')
    return sparql.queryAndConvert()

# dato un URL di un'issue di dlib o statistica crea un json con titoli e
# URL degli articoli di quel numero


def _getURLandTitle(url):
    """
    Recupera i metadati di un documento dal web

    :param string: url L'url del docmento da analizzare
    :returns:  Un dizionario contenente url, titolo e doi del documento
    """
    page = requests.get(url)
    tree = html.fromstring(page.content)

    if "dlib" in url:
        title = tree.xpath(
            '/html/body/form/table[3]/tr/td/table[5]/tr/td/table[1]/tr/td[2]/h3[2]/text()')  # noqa
        doi = tree.xpath('/html/head/meta[@name="DOI"]/@content')
    elif "unibo" in url:
        title = tree.xpath('//*[@id="articleTitle"]/h3/text()')
        doi = tree.xpath('//*[@id="pub-id::doi"]/text()')
    else:
        return ''

    return {
        'title': title[0],
        'doi': doi[0],
        'url': url
    }


# in input prende un dizionario con chiavi: url, doi e title.
def _createTriples(page_data):
    """
    Costruisce il grafo RDF con le triple rappresentanti il documento
    e i metadati che ci interessano.

    :param dict: page_data
                 Un dizionario contenente titolo, doi e url di un documento
    :returns: Il grafo rdflib.Graph contenente le triple generate
    """
    FABIO = Namespace("http://purl.org/spar/fabio/")
    FRBR = Namespace("http://purl.org/vocab/frbr/core#")
    DCTERMS = Namespace("http://purl.org/dc/terms/")
    PRISM = Namespace("http://prismstandard.org/namespaces/basic/2.0/")
    XMLS = Namespace("http://www.w3.org/2001/XMLSchema#")

    graph = rdflib.Graph()

    item = URIRef(page_data['url'])
    if '.html' in item:
        work = URIRef(item[0:-5])
    else:
        work = URIRef(item)
    expression = URIRef(work + "_ver1")
    title = Literal(page_data['title'], datatype=XMLS.string)
    doi = Literal(page_data['doi'], datatype=XMLS.string)

    graph.add((item, RDF.type, FABIO.Item))

    graph.add((work, RDF.type, FABIO.Work))
    graph.add((work, FRBR.realization, expression))

    graph.add((expression, RDF.type, FABIO.Expression))
    graph.add((expression, FABIO.hasRepresentation, item))
    graph.add((expression, DCTERMS.title, title))
    graph.add((expression, PRISM.hasDOI, doi))

    return graph


def makeGraph(url):
    """
    Dato l'URL di un documento supportato, restituisce un rdflib.Graph con
    le informazioni necessarie per insere il documento nel triple store.

    :param url: L'URL del documento.
    :returns string: Il grafo serializzato in formato nTriples
    """
    data = _getURLandTitle(url)
    g = _createTriples(data)
    return g.serialize(format="nt")


def add_document_to_fuseki(url):
    """
    Aggiunge a fuseki le informazioni necessarie per gestire il
    documento puntato dall'url passato come parametro

    :param string: url L'URL del documento da aggiungere
    """
    url_obj = urlparse(url)
    if url_obj.scheme != 'http':
        return False
    graph = makeGraph(url)
    return upload_graph(graph)


def getArticles_in_issue(issueURL):
    """
    Data una issue di DLib o una rivista UniBo crea un elenco degli articoli di quel numero

    :param issueURL: stringa con l'URL della issue
    :returns docs: un array con gli URL degli articoli
    """
    page = requests.get(issueURL)
    tree = html.fromstring(page.content)

    docs = []
    if "dlib" in issueURL:
        pref = issueURL.rsplit("/", 1).pop(0) + "/"  # ad esempio http://www.dlib.org/dlib/january16/
        for i, a in enumerate(tree.xpath("(//p[@class='contents']/a)[position()<last()]")):
            ### nota::
            ### l'xpath fatto in questo modo POTREBBE beccare anche eventuali conference reports
            ### ma nell'ultimo numero (gen/feb 2016) ci sono solo articoli standard, quindi tutto ok
            docs.append(pref + a.attrib.get('href'))
    else:
        # trattasi di rivista unibo
        for i, a in enumerate(tree.xpath('//div[@class="tocTitle"]//a')):
            docs.append(a.attrib.get('href'))
    return docs






######################################
#####                            #####
##### aggiungiamo roba a fuseki  #####
#####                            #####
######################################

if __name__ == '__main__':
    articles = []

    articles += getArticles_in_issue("http://www.dlib.org/dlib/january16/01contents.html")
    articles += getArticles_in_issue("http://series.unibo.it/issue/view/549/showToc")
    articles += getArticles_in_issue("http://montesquieu.unibo.it/issue/view/509")

    # articles += getArticles_in_issue("http://jfr.unibo.it/issue/view/554")
    # articles += getArticles_in_issue("http://antropologiaeteatro.unibo.it/")
    # articles += getArticles_in_issue("http://disegnarecon.unibo.it/issue/view/425/showToc")
    # articles += getArticles_in_issue("http://rivista-statistica.unibo.it/issue/view/544")

    # # dlib con conference report, che tuttavia non causa problemi
    # articles += getArticles_in_issue("http://www.dlib.org/dlib/september15/09contents.html")

    for article in articles:
        add_document_to_fuseki(article)
