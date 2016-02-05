# -*- coding: utf-8 -*-

#
# NOTE: install httplib, lxml or use other modules
#

import re
from json import JSONEncoder
from lxml import html
import httplib, json
from urlparse import urlparse


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
    date = my_page.xpath("//p[1][@class='blue']/text()[following-sibling::br]")[0].encode("utf8")
    date = re.findall('\d\d\d\d', date)[0]
    url = url_string

    result = {"title": title, "doi": doi, "authors": authors, "date": date, "url": url}
    return JSONEncoder().encode(result)


def _scrape_statistica(url_string):
    url = urlparse(url_string)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()

    my_page = html.fromstring(body)

    title = my_page.xpath("//*[@id='articleTitle']/h3")[0].text_content().encode("utf8")
    doi = my_page.xpath("//meta[@name='DC.Identifier.DOI']/@content")[0]
    authors = my_page.xpath("//*[@id='authorString']/em/text()")[0].split(', ')
    date = my_page.xpath("//*[@id='breadcrumb']/a[2]/text()")[0]
    date = re.findall('\d\d\d\d', date)[0]
    url = url_string

    result = {"title": title, "doi": doi, "authors": authors, "date": date, "url": url}
    return JSONEncoder().encode(result)


def scrapeit(url_string):

    if "dlib.org" in url_string:
        return _scrape_dlib(url_string)
    elif "rivista-statistica" in url_string:
        return _scrape_statistica(url_string)
    else:
        return "<h1>NOPE</h1>"


if __name__ == '__main__':
    print(scrapeit('http://rivista-statistica.unibo.it/article/view/4594'))
    print(scrapeit('http://www.dlib.org/dlib/november14/beel/11beel.html'))
