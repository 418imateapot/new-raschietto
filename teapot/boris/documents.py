# coding: utf-8
"""
Funzioni utili per recuperare i documenti dai server remoti
"""

from lxml import html, etree
from lxml.html.clean import Cleaner
import httplib
import urlparse
import json


def fix_links(content, absolute_prefix):
    """Riscrive i link relativi come link assoluti

    Vedi `questa domanda \
    <https://stackoverflow.com/questions/26167690/\
    lxml-how-to-change-img-src-to-absolute-link>`_ su StackOverflow

    :param string content: Una stringa contenente un documento HTML
    :param string absolute_prefix: L'URL base da cui costruire i link assoluti
    :returns: Il documento HTML con i link riscritti
    """
    def join(base, url):
        """
        Join relative URL
        """
        if not (url.startswith("/") or "://" in url):
            return urlparse.urljoin(base, url)
        else:
            # Already absolute
            return url

    for node in content.xpath('//*[@src]'):
        url = node.get('src')
        url = join(absolute_prefix, url)
        node.set('src', url)
    for node in content.xpath('//*[@href]'):
        href = node.get('href')
        url = join(absolute_prefix, href)
        node.set('href', url)

    return content


def _dlib_get(url_string):
    """Implementa la logica per estrarre documento e metadati da dlib.org"""
    url = urlparse.urlparse(url_string)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()

    my_page = html.fromstring(body)

    title = my_page.xpath('//h3[@class="blue-space"][2]')
    full_content = my_page.xpath('//table[3]//table[5]//table[1]//td[2]/*')
    doi = my_page.xpath('/html/head/meta[@name="DOI"]/@content')

    full_content = ''.join(
        [etree.tostring(fix_links(el, url_string)) for el in full_content])

    result = {
        'title': title[0].text_content(),
        'content': full_content,
        'doi': doi[0]
        }

    return json.JSONEncoder().encode(result)


def _statistica_(url_string):
    """Implementa la logica per estrarre documento
    e metadati da rivista-statistica
    """
    url = urlparse.urlparse(url_string)
    conn = httplib.HTTPConnection(url.hostname)
    conn.request("GET", url.path)
    res = conn.getresponse()
    body = res.read()

    my_page = html.fromstring(body)

    # Rimuovi il banner dei cookie del *****
    for el in my_page.xpath('//*[@id="cookiesAlert"]'):
        el.getparent().remove(el)

    # Rimuovi tutti i tag script e il loro contenuto
    cleaner = Cleaner()
    cleaner.javascript = True
    my_page = cleaner.clean_html(my_page)

    title = my_page.xpath('//*[@id="articleTitle"]/h3')
    full_content = my_page.xpath('//*[@id="content"]')
    doi = my_page.xpath('//*[@id="pub-id::doi"]')

    full_content = ''.join(
        [etree.tostring(fix_links(el, url_string)) for el in full_content])

    result = {
        'title': title[0].text_content(),
        'content': full_content,
        'doi': doi[0].text_content()
        }

    return json.JSONEncoder().encode(result)


def get_doc(url_string):
    """Recupera l'HTML di un documento

    :param string url_string: L'URL del documento da scaricare
    :returns: Dizionario contenente il documento richiesto e alcuni metadati
    """
    if "dlib.org" in url_string:
        return _dlib_get(url_string)
    elif "rivista-statistica" in url_string:
        return _statistica_(url_string)
    else:
        return "<h1>NOPE</h1>"
