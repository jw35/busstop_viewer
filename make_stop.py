#!/usr/bin/env python3

import sys
import requests
import os

SOURCE = 'https://naptan.herokuapp.com/naptan.json'
TARGET = 'http://localhost:8111/add_node'

# Map NaPTAN column names to OSM tag names
# https://wiki.openstreetmap.org/wiki/NaPTAN/Tag_mappings
TAG_MAPPING = [
    ['CommonName', 'name'],
    ['AtcoCode', 'naptan:AtcoCode'],
    ['Bearing', 'naptan:Bearing'],
    ['CommonName', 'naptan:CommonName'],
    ['AltCommonName', 'naptan:AltCommonName'],
    ['AltCommonName', 'alt_name'],
    ['Crossing', 'naptan:Crossing'],
    ['AltCrossing', 'naptan:AltCrossing'],
    ['Indicator', 'naptan:Indicator'],
    ['AltIndicator', 'naptan:AltIndicator'],
    ['Landmark', 'naptan:Landmark'],
    ['AltLandmark', 'naptan:AltLandmark'],
    ['NaptanCode', 'naptan:NaptanCode'],
    ['Notes', 'naptan:Notes'],
    ['PlusbusZoneRef', 'naptan:PlusbusZoneRef'],
    ['ShortCommonName', 'naptan:ShortCommonName'],
    ['AltShortName', 'naptan:AltShortName'],
    ['Street', 'naptan:Street'],
    ['AltStreet', 'naptan:AltStreet'],
]

if (len(sys.argv[1:]) == 0):
    print('Usage: make_stops: atcocode [atcocode...]')
    sys.exit()

for code in sys.argv[1:]:

    req_params = {
        'sql': 'select * from StopAltZoneArea where AtcoCode="{}";'.format(code),
        '_shape': 'array',
        }

    r = requests.get(SOURCE, req_params)
    r.raise_for_status()

    stop = (r.json())[0]

    tags = []
    for (naptan_tag, osm_tag) in TAG_MAPPING:
        if naptan_tag in stop and stop[naptan_tag] is not None:
            tags.append('{}={}'.format(osm_tag, stop[naptan_tag]))

    tags.append('highway=bus_stop')
    tags.append('bus=yes')
    tags.append('public_transport=platform')
    tags.append('source=naptan;make_stop.py')

    add_params = {
        'lon': stop['Longitude'],
        'lat': stop['Latitude'],
        'addtags': '|'.join(tags)
        }

    print(add_params)

    r = requests.get(TARGET, add_params)
    r.raise_for_status()
