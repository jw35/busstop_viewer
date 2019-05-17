#!/usr/bin/env python3

import sys
import requests
import os
from xml.etree.ElementTree import Element, SubElement, Comment, tostring
from xml.etree import ElementTree
from xml.dom import minidom

SOURCE = 'https://naptan.herokuapp.com/naptan.json'
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
        'sql': 'select * from StopAreas where StopAreaCode="{}";'.format(code),
        '_shape': 'array',
        }

    r = requests.get(SOURCE, req_params)
    r.raise_for_status()

    stop = (r.json())[0]

#<osm version="0.6" generator="CGImap 0.6.1 (9436 thorn-03.openstreetmap.org)" copyright="OpenStreetMap and contributors" attribution="http://www.openstreetmap.org/copyright" license="http://opendatacommons.org/licenses/odbl/1-0/">
#<relation id="291398" visible="true" version="2" changeset="3891683" timestamp="2010-02-16T12:52:48Z" user="Pink Duck" uid="91657">
#<member type="node" ref="533796080" role=""/>
#<member type="node" ref="533796095" role=""/>
#<member type="node" ref="533796101" role=""/>
#<tag k="name" v="Station Road"/>
#<tag k="naptan:StopAreaCode" v="050GGS009020"/>
#<tag k="naptan:StopAreaType" v="GCLS"/>
#<tag k="naptan:verified" v="no"/>
#<tag k="site" v="stop_area"/>
#<tag k="source" v="naptan_import"/>
#<tag k="type" v="site"/>
#</relation>
#</osm>

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
