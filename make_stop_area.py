#!/usr/bin/env python3

import sys
import requests
import os
from xml.etree.ElementTree import Element, SubElement, Comment, tostring
from xml.etree import ElementTree
from xml.dom import minidom

SOURCE = 'https://naptan.herokuapp.com/naptan/merged_stop_area.json'
TARGET = 'http://localhost:8111/load_data'

# Map NaPTAN column names to OSM tag names
# https://wiki.openstreetmap.org/wiki/NaPTAN/Tag_mappings
TAG_MAPPING = [
    ['StopAreaCode', 'naptan:StopAreaCode'],
    ['Name', 'name'],
    ['Name', 'naptan:stoparea_name'],
    ['AdministrativeAreaRef', 'naptan:AdministrativeAreaRef'],
    ['StopAreaType', 'naptan:StopAreaType'],
]

if (len(sys.argv[1:]) == 0):
    print('Usage: make_stops: stopareacode [stopareacode...]')
    sys.exit()

for code in sys.argv[1:]:

    req_params = {
        'stopareacode': code,
        '_shape': 'array',
        }

    r = requests.get(SOURCE, req_params)
    r.raise_for_status()

    stop = (r.json())[0]

    osm = Element('osm')
    osm.set('version', '0.6')
    osm.set('generator', 'make_stoparea.py')
    relation = SubElement(osm, 'relation', {
        'id': '-1',
    })

    for (naptan_tag, osm_tag) in TAG_MAPPING:
        if naptan_tag in stop and stop[naptan_tag] is not None:
            SubElement(relation, 'tag', {
                'k': osm_tag,
                'v': stop[naptan_tag],
                })

    SubElement(relation, 'tag', {'k': 'site', 'v': 'stop_area'})
    SubElement(relation, 'tag', {'k': 'type', 'v': 'site'})
    SubElement(relation, 'tag', {'k': 'public_transport', 'v': 'stop_area'})
    SubElement(relation, 'tag', {'k': 'source', 'v': 'naptan;make_stoparea.py'})

    rough_string = ElementTree.tostring(osm, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    print(reparsed.toprettyxml(indent="  "))

    add_params = {
        'data': tostring(osm),
        'mime_type': 'application/x-osm+xml'
    }

    r = requests.get(TARGET, add_params)
    r.raise_for_status()
