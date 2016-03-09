# -*- coding: utf-8 -*-

#
# NOTE: install httplib, lxml or use other modules
#

import re
from json import JSONEncoder
from lxml import html
import httplib
import json
from urlparse import urlparse

# DLIB SCRAPING PAGINA NORMALE
print 'DLIBBBBB'


def _scrape_dlib(url_string):
    url = urlparse(url_string)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()

    my_page = html.fromstring(body)

    title = my_page.xpath("//title")[0].text_content().encode("utf8")
    doi = my_page.xpath("//meta[@name='DOI']/@content")[0]
    authors = my_page.xpath("//p[@class='blue']/b/text()")
    date = my_page.xpath(
        "//p[1][@class='blue']/text()[following-sibling::br]")[0].encode("utf8")
    date = re.findall('\d\d\d\d', date)[0]
    url = url_string

    result = {"hasTitle": title, "hasDOI": doi,
              "hasAuthor": authors, "hasPublicationYear": date, "hasURL": url_string}
    return JSONEncoder().encode(result)

# DLIB SCRAPING CITAZIONI PAGINA NORMALE


def _scrape_dlib2(url_string2):

    url = urlparse(url_string2)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()
    my_page = html.fromstring(body)
    my_data = []

    allTitleCitation = my_page.xpath("//a[@name]/../text()")

    titleC = []

    for tit in allTitleCitation:

        titleC.append(tit.rsplit(' "')[0] and (tit.replace(",", " ")))

    url = url_string2
    my_data += titleC

    return JSONEncoder().encode(my_data)


# DLIB SCRAPING CITAZIONI PAGINA CON '"'

def _scrape_dlib3(url_string2):

    url = urlparse(url_string2)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()
    my_page = html.fromstring(body)
    my_data = []

    allAuthorCitation = my_page.xpath("//a[@name]/../text()")

    allTitleCitation = my_page.xpath("//a[@name]/../text()")

    citationWhere = my_page.xpath("//p/a[@name]/following::i/text() ")
    allDoiCitation = my_page.xpath(
        "//p/a[@name]/following-sibling::a[@href]/text()")

    titleC = []
    authorC = []

    for tit in allTitleCitation:

        titleC.append((tit.rpartition('"')[0]) and (tit.split('"')[1]))

    for aut in allAuthorCitation:

        authorC.append((aut.rpartition('"')[0]) and (
            aut.split(', "')[0]))  # autori e titolo and split

        # titleC.append( (tit.rpartition('"')[2])) data e pagina citation

    url = url_string2
    citat2 = []
    result = {"DLIB Author Citation": authorC, "DLIB Title Citation": titleC}
    my_data += zip(authorC, titleC)

    return JSONEncoder().encode(my_data)



def _scrape_statistica(url_string):
    url = urlparse(url_string)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()

    my_page = html.fromstring(body)

    title = my_page.xpath(
        "//*[@id='articleTitle']/h3")[0].text_content().encode("utf8")
    doi = my_page.xpath("//meta[@name='DC.Identifier.DOI']/@content")[0]
    authors = my_page.xpath("//*[@id='authorString']/em/text()")[0].split(', ')
    date = my_page.xpath("//*[@id='breadcrumb']/a[2]/text()")[0]
    date = re.findall('\d\d\d\d', date)[0]
    url = url_string


    result = {"hasTitle": title, "hasDOI": doi,
              "hasAuthor": authors, "hasPublicationYear": date, "hasURL": url_string}
    return JSONEncoder().encode(result)


def _scrape_statistica2(url_string2):

    url = urlparse(url_string2)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()
    # text.lower().split(None)
    my_page = html.fromstring(body)
    my_data = []
    citat = []
    articleC = []
    authorC = []

    citation = my_page.xpath("//*[@id='articleCitations']/div/p/text()")
    titleCitation = my_page.xpath(
        "//*[@id='articleCitations']/div/p/text()")[1].partition(').')[2]
    authorCitation = my_page.xpath(
        "//*[@id='articleCitations']/div/p/text()")[1].split('(')[0]
 #   dataCitation = my_page.xpath("//*[@id='articleCitations']/div/p/text()")[0].split_before(').')[0]

    allTitleCitation = my_page.xpath(
        "//*[@id='articleCitations']/div/p/text()")
    allAuthorCitation = my_page.xpath(
        "//*[@id='articleCitations']/div/p/text()")

    # print(allTitleCitation)

    for tit in allTitleCitation:
         #articleC += allTitleCitation
        articleC.append(tit.partition('),')[2])

    for aut in allAuthorCitation:
        authorC.append(aut.split('(')[0])

    url = url_string2
    my_data += zip(authorC, articleC)
    citat += citation
    # print articleC
    # print result

    return JSONEncoder().encode(my_data) #se metti 'result' sono divisi in
    # gruppi


def _scrape_mont(url_string):
    url = urlparse(url_string)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()

    my_page = html.fromstring(body)

    title = my_page.xpath(
        "//meta[@name='citation_title']/@content")[0].encode("utf8")
    doi = my_page.xpath("//meta[@name='DC.Identifier.DOI']/@content")[0]
    authors = my_page.xpath("//meta[@name='citation_author']/@content")[0]
    date = my_page.xpath("//meta[@name='citation_date']/@content")[0]
    date = re.findall('\d\d\d\d', date)[0]
    url = url_string

    result = {"hasTitle": title, "hasDOI": doi,
              "hasAuthor": authors, "hasPublicationYear": date, "hasURL": url_string}

    return JSONEncoder().encode(result)


def _scrape_mont2(url_string2):

    url = urlparse(url_string2)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()
    my_page = html.fromstring(body)
    my_data = []
    citat = []
    articleC = []
    authorC = []

    allTitleCitation = my_page.xpath("//*[@id='content']/ul/li/text()")
    authorCitation = my_page.xpath("//*[@id='content']/ul/li/text()")

    for tit in allTitleCitation:

        articleC.append(tit.split('.')[0])

    url = url_string2
    my_data += zip(authorC, articleC)

    return JSONEncoder().encode(my_data)



def _scrape_series(url_string):
    url = urlparse(url_string)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()

    my_page = html.fromstring(body)

    title = my_page.xpath("//meta[@name='citation_title']/@content")
    doi = my_page.xpath("//meta[@name='DC.Identifier.DOI']/@content")[0]
    authors = my_page.xpath("//meta[@name='citation_author']/@content")
    date = my_page.xpath("//meta[@name='citation_date']/@content")[0]
    date = re.findall('\d\d\d\d', date)[0]
    url = url_string

    result = {"hasTitle": title, "hasDOI": doi,
              "hasAuthor": authors, "hasPublicationYear": date, "hasURL": url_string}

    return JSONEncoder().encode(result)


def _scrape_series2(url_string2):

    url = urlparse(url_string2)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()
    my_page = html.fromstring(body)
    my_data = []
    citat = []
    articleC = []
    authorC = []

    allTitleCitation = my_page.xpath("//*[@id='content']/ul/li/text()")
    authorCitation = my_page.xpath("//*[@id='content']/ul/li/text()")

    for tit in allTitleCitation:

        articleC.append(tit)

    url = url_string2
    result = {"Series Citation": articleC}
    my_data += zip(authorC, articleC)

    return JSONEncoder().encode(my_data)


def scrapeit2(url_string2):
    if "dlib.org" and "11beel.html" in url_string2:
        return _scrape_dlib3(url_string2)
    elif "rivista-statistica" in url_string2:
        return _scrape_statistica2(url_string2)
    elif "montesquieu" in url_string2:
        return _scrape_mont2(url_string2)
    elif "series" in url_string2:
        return _scrape_series2(url_string2)

    else:
        return _scrape_dlib2(url_string2)


def scrapeit(url_string):

    if "dlib.org" in url_string:
        return _scrape_dlib(url_string)
    elif "rivista-statistica" in url_string:
        return _scrape_statistica(url_string)
    elif "montesquieu" in url_string:
        return _scrape_mont(url_string)
    elif "series" in url_string:
        return _scrape_series(url_string)
    else:
        return "<h1>NOPE</h1>"


def scrape(url):
    doc = scrapeit(url)
    cits = scrapeit2(url)
    result = {"document": doc, "citations": cits}
    return JSONEncoder().encode(result);


# TEST
if __name__ == '__main__':
    # print(scrapeit('http://rivista-statistica.unibo.it/article/view/4594'))
    # print(scrapeit2('http://rivista-statistica.unibo.it/article/view/5303'))
    print(scrapeit('http://www.dlib.org/dlib/november14/knoth/11knoth.html'))
    # print(scrapeit2('http://www.dlib.org/dlib/november14/beel/11beel.html'))
    # print(scrapeit2('http://www.dlib.org/dlib/november14/fedoryszak/11fedoryszak.html'))
    # print(scrapeit('http://montesquieu.unibo.it/article/view/5167'))
    # print(scrapeit2('http://montesquieu.unibo.it/article/view/5167'))
    # print(scrapeit('http://series.unibo.it/article/view/5897'))
    # print(scrapeit2('http://series.unibo.it/article/view/5897'))
