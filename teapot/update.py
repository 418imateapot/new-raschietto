# coding: utf-8

from rdflib import Graph, Namespace, BNode, Literal, URIRef, RDF, RDFS, XSD
import unicodedata



# denotesRhetoric ha come oggetto un resource semplice, 
# hasAuthor oggetto: resource con {id, label}
# cites oggetto: resource con {id, label}
## gli altri tipi di annotazione hanno come oggetto un literal (cioè nel json c'è quella come chiave)

#### gli statement con work, expression e item devono esserci anche per gli articoli citati?


def generateGraphFromJSON(jsonAnn):
    """
    Data un'annotazione in formato JSON genera i corrispondenti statement RDF.
    :param dict: jsonAnn annotazione in formato JSON.
    :returns string: Il grafo serializzato in formato turle
    """
    FABIO = Namespace("http://purl.org/spar/fabio/")
    FOAF = Namespace("http://xmlns.com/foaf/0.1/")
    OA = Namespace("http://www.w3.org/ns/oa#")
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
        ann = BNode()
        body = BNode()
        target = BNode()
        fragmentSel = BNode()

        annLabel = Literal(annotation['label'])
        bodyLabel = Literal(annotation['body']['label'])

        bodySubject = URIRef(annotation['body']['subject'])
        bodyPredicate = URIRef(annotation['body']['predicate'])

        g.add((ann, RDF.type, OA.Annotation))
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
        elif annotation['type'] == 'denotesRhetoric':
            bodyObject = URIRef(annotation['body']['resource'])
            g.add((bodyObject, RDF.type, SKOS.Concept))            
        else:
            bodyObject = URIRef(annotation['body']['resource']['id'])
            resourceLabel = Literal(annotation['body']['resource']['label'])
            g.add((bodyObject, RDFS.label, resourceLabel))
            if annotation['type'] == 'hasAuthor':
                g.add((bodyObject, RDF.type, FOAF.Person))
            else:  # type == 'cites'
                g.add((bodyObject, RDF.type, FABIO.Expression))

        g.add((body, RDF.object, bodyObject))

    return g.serialize(format="turtle")


j = {
    "annotations": [
    {
            "type": "hasAuthor" ,
            "label": "Autore",
            "body": {
                "label": "Un autore del documento è Heather Lea Moulaison" ,
                "subject": "dlib:03moulaison" ,
                "predicate": "dcterms:creator",
                "resource": {
                    "id": "rsch:moulaison-h" ,
                    "label": "Heather Lea Moulaison"
                }
            }
    }] , 
    "target": {
        "source": "dlib:03moulaison.html" ,
        "id": "form1_table3_tbody1_tr1_td1_table5_tbody1_tr1_td2_p2" ,
        "start": 0,
        "end": 21
    } ,
    "provenance": {
        "author": {
            "name": "Pinco Pallino" ,
            "email": "pinco.pallino@studio.unibo.it" 
        } ,
        "time": "2015-03-12T15:46"
    }
}

k = {
    "annotations": [
        {
            "type": "cites" ,
            "label": "Citazione" ,
            "body": {
                "label": "Questo articolo cita ‘Institutional repositories, open access, and scholarly communication: A study of conflicting paradigms.’" ,
                "subject": "dlib:03moulaison_ver1" ,
                "predicate": "cito:cites" ,
                "resource": {
                    "id": "dlib:03moulaison_ver1_cited_3" ,
                    "label": "[3] Cullen, R., & Chawner, B. (2011). Institutional repositories, open access, and scholarly communication: A study of conflicting paradigms. The Journal of Academic Librarianship, 37(6), 460-470. http://doi.org/10.1016/j.acalib.2011.07.002"
                }
            }
        },
        {
            "type": "hasTitle" ,
            "label": "Titolo" ,
            "body": {
                "label": "il titolo è blabla",
                "subject": "dlib:03moulaison_ver1_cited_3" ,
                "predicate": "dcterms:title" ,
                "literal": "Institutional repositories, open access, and scholarly communication: A study of conflicting paradigms"
            }
        }
    ],
    "target": {
        "source": "dlib:03moulaison.html" ,
        "id": "form1_table3_tbody1_tr1_td1_table5_tbody1_tr1_td2_p38",
        "start": 0,
        "end": 21000
    },
    "provenance": {
        "author": {
            "name": "Pinco Pallino",
            "email": "pinco.pallino@studio.unibo.it" 
        } ,
        "time": "2014-03-12T15:46"
    }
}



print generateGraphFromJSON(k)
#print generateGraphFromJSON(j)



















##########################################################################################################################
def string2rschAuthor(fullname):
    """
    Genera un nome nel formato di Raschietto a partire dalla stringa passata come argomento.
    :param string: fullname il nome e cognome di un autore.
    :returns string: il nome opportunamente modificato
    """    
    fullname = unicodedata.normalize('NFKD',unicode(fullname,"utf-8")).encode("ascii","ignore")
    # sostituisce i caratteri accentati con i "corrispettivi" caratteri ASCII
    # http://stackoverflow.com/questions/3704731/replace-non-ascii-chars-from-a-unicode-string-in-python

    fullname = fullname.lower()  # trasforma eventuali maiuscole in minuscole

    for n in (range(33, 48) + range(58, 97) + range(123, 127)):  # rimuove la punteggiatura  
        fullname = fullname.replace(chr(n),'')

    parts = fullname.split()
    if len(parts) == 2:
        return parts[0][0] + '-' + parts[1]
    elif len(parts) >= 2:
        return parts[0][0] + '-' + parts[-2] + parts[-1]
    else:
        return fullname



# s = "M.A. Ròòsso"
# print string2rschAuthor(s)

##########################################################################################################################
