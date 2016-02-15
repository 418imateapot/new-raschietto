# coding: utf-8

from rdflib import Graph, Namespace, BNode, Literal, URIRef, RDF, RDFS, XSD
from SPARQLWrapper import SPARQLWrapper
import unicodedata



def edit_graph(serialized_graph, action='INSERT'):
    """
    Upload stuff
    """
    tps_graph = "http://vitali.web.cs.unibo.it/raschietto/graph/ltw1543"

    query = """%s DATA {
        GRAPH <%s> { %s }
    }""" % (action, tps_graph, serialized_graph)

    # NB: Usare 'DELETE' al posto di 'INSERT' per rimuovere
    # i dati dal triplestore

    sparql = SPARQLWrapper(
        "http://tweb2015.cs.unibo.it:8080/data/update?user{}&pass={}".format(
            "ltw1543", "43het5=!X"))
    sparql.setQuery(query)
    sparql.setMethod('POST')
    return str(sparql.query())


# denotesRhetoric ha come oggetto un resource semplice,
# hasAuthor oggetto: resource con {id, label}
# cites oggetto: resource con {id, label}
## gli altri tipi di annotazione hanno come oggetto un literal (cioè nel json c'è quella come chiave)

def generateGraphFromJSON(jsonAnn):
    """
    Data un'annotazione in formato JSON genera i corrispondenti statement RDF.
    :param dict: jsonAnn annotazione in formato JSON.
    :returns string: Il grafo serializzato in formato turle
    """
    FABIO = Namespace("http://purl.org/spar/fabio/")
    FOAF = Namespace("http://xmlns.com/foaf/0.1/")
    OA = Namespace("http://www.w3.org/ns/oa#")
    RSCH = Namespace("http://vitali.web.cs.unibo.it/raschietto/")
    SCHEMA = Namespace("http://schema.org/")
    SKOS = Namespace("http://www.w3.org/2004/02/skos/core#")

    g = Graph()

    uriEmail = URIRef("mailto:" + jsonAnn['provenance']['author']['email'])

    targetSource = URIRef(jsonAnn['target']['source'])
    targetId = Literal(jsonAnn['target']['id'])
    targetStart = Literal(jsonAnn['target']['start'], datatype=XSD.nonNegativeInteger)
    targetEnd = Literal(jsonAnn['target']['end'], datatype=XSD.nonNegativeInteger)

    annTime = Literal(jsonAnn['provenance']['time'], datatype=XSD.dateTime)
    autName = Literal(jsonAnn['provenance']['author']['name'])
    autEmail = Literal(jsonAnn['provenance']['author']['email'])

    g.add((uriEmail, FOAF.name, autName))  # dettagli provenance
    g.add((uriEmail, SCHEMA.email, autEmail))


    for annotation in jsonAnn['annotations']:
        bodyObject = None
        ann = BNode()
        body = BNode()
        target = BNode()
        fragmentSel = BNode()

        annType = Literal(annotation['type'])
        annLabel = Literal(annotation['label'])
        bodyLabel = Literal(annotation['body']['label'])

        bodySubject = URIRef(annotation['body']['subject'])
        bodyPredicate = URIRef(annotation['body']['predicate'])

        g.add((ann, RDF.type, OA.Annotation))
        g.add((ann, RSCH.type, annType))
        g.add((ann, RDFS.label, annLabel))
        g.add((ann, OA.hasTarget, target))  # inizia target

        g.add((target, RDF.type, OA.SpecificResource))
        g.add((target, OA.hasSource, targetSource))
        g.add((target, OA.hasSelector, fragmentSel))  # inizia fragmentSelector

        g.add((fragmentSel, RDF.type, OA.FragmentSelector))
        g.add((fragmentSel, RDF.value, targetId))
        g.add((fragmentSel, OA.start, targetStart))
        g.add((fragmentSel, OA.end, targetEnd))  # fine target

        g.add((ann, OA.hasBody, body))  # provenance
        g.add((ann, OA.annotatedBy, uriEmail))
        g.add((ann, OA.annotatedAt, annTime))

        g.add((body, RDF.type, RDF.Statement))  # body annotazione
        g.add((body, RDFS.label, bodyLabel))

        g.add((body, RDF.subject, bodySubject))
        g.add((body, RDF.predicate, bodyPredicate))

        if annotation['type'] in ['hasComment', 'hasDOI', 'hasPublicationYear', 'hasTitle', 'hasURL']:
            if annotation['type'] in ['hasComment', 'hasDOI', 'hasTitle']:
                bodyObject = Literal(annotation['body']['literal'], datatype=XSD.string)
            elif annotation['type'] == 'hasPublicationYear':
                bodyObject = Literal(annotation['body']['literal'], datatype=XSD.date)
            else:  # type == 'hasURL'
                bodyObject = Literal(annotation['body']['literal'], datatype=XSD.anyURI)
        elif annotation['type'] == 'denotesRethoric':
            bodyObject = URIRef(annotation['body']['resource'])
            g.add((bodyObject, RDF.type, SKOS.Concept))
        else:
            if annotation['type'] == 'hasAuthor':
                bodyObject = URIRef(string2rschAuthor(annotation['body']['resource']['label']))
                g.add((bodyObject, RDF.type, FOAF.Person))
            else:  # type == 'cites'
                bodyObject = URIRef(annotation['body']['resource']['id'])
                g.add((bodyObject, RDF.type, FABIO.Expression))
            resourceLabel = Literal(annotation['body']['resource']['label'])
            g.add((bodyObject, RDFS.label, resourceLabel))

        g.add((body, RDF.object, bodyObject))

    return g.serialize(format="nt")


##########################################################################################################################
def string2rschAuthor(fullname):
    """
    Genera un nome nel formato di Raschietto a partire dalla stringa passata come argomento.
    :param string: fullname il nome e cognome di un autore.
    :returns string: il nome opportunamente modificato
    """
    # fullname = unicodedata.normalize('NFKD',unicode(fullname,"utf-8")).encode("ascii","ignore")
    # sostituisce i caratteri accentati con i "corrispettivi" caratteri ASCII
    # http://stackoverflow.com/questions/3704731/replace-non-ascii-chars-from-a-unicode-string-in-python

    fullname = fullname.lower()  # trasforma eventuali maiuscole in minuscole

    if ',' in fullname: #  cioè è del tipo "Cognome, Nome" o "Cognome, N.eccetera"
        parts = fullname.split(',', 1) 
        for c in parts[1]: 
            if ord(c) not in (range(65, 91) + range(97, 123)): # c non è un carattere, ovvero non è in quel range ascii
                continue
            # se sono qui vuol dire che c è il primo carattere
            return c + '-' + parts[0]


        # con parts[1].split() mi toglie gli eventuali spazi prima del primo carattere del nome
        # ma potrebbero esserci altri segni di punteggiatura (improbabile ma non si sa mai)
        return parts[1][1] + '-' + parts[0]

    # se sono qui vuol dire che il fullname è una variazione sul tema "nome cognome"
    for n in (range(33, 48) + range(58, 97) + range(123, 127)):  # rimuove la punteggiatura
        fullname = fullname.replace(chr(n),'')

    parts = fullname.split()
    if len(parts) == 2:
        return parts[0][0] + '-' + parts[1]
    elif len(parts) >= 2:
        return parts[0][0] + '-' + parts[-2] + parts[-1]
    else:
        return fullname.strip()


rovescio = "Lee,  ,7.\][]  W.C."
#rovescio = Lee, W.C.
#Yu, H.
#Cohen, K. 

#M.-Q. Nghiem
#Nghiem M.-Q.

# quanti punti ci possono essere nel cognome? zero
# stringa senza punti seguita da , --> cognome
# prima lettera dopo lo spazio --> nome
# la virgola c'è solo nella versione invertita e assumiamo pure che ce ne sia una sola

s = "M.A. Ròòsso"
#print string2rschAuthor(s)
print string2rschAuthor(rovescio)
##########################################################################################################################
