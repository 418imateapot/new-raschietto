# -*- coding: utf-8 -*-

#
# NOTE: install httplib, lxml or use other modules
#

from lxml import html
import httplib, json

conn = httplib.HTTPConnection("dlib.org")
conn.request("GET","/dlib/january14/musgrave/01musgrave.html")
res = conn.getresponse()
body = res.read()

my_data = []
my_page = html.fromstring(body)

for row in my_page.xpath("/html"):
    first_cell = row.xpath("//title")[0].text_content().encode("utf8")
    second_cell = row.xpath("//meta[@name='DOI']/@content")
    third_cell = row.xpath("//p[@class='blue']/b/text()")
    fourth_cell = row.xpath("//p[1][@class='blue']/text()[following-sibling::br]")[0].encode("utf8"

    my_row = 'title: ', first_cell, 'doi: ',second_cell, 'Author: ', third_cell, 'data: ',fourth_cell
    my_data += my_row

for p in my_data:
	print
	print p

with open('my_row.json', 'w') as f:
   json.dump(my_data, f)





