// Javascript functions for the Bus Stop client

/* eslint max-lines-per-function: ["warn", 1000], no-console: "off" */

/*jslint browser: true */
/*jshint esversion: 6 */
/*global $, L, */

$(document).ready(function () {

    'use strict';

    var naptan_data,
        osm_data,
        osm_atco_index,
        osm_matched = L.layerGroup(),
        osm_notmatched = L.layerGroup(),
        osm_unmatchable = L.layerGroup(),
        naptan_matched = L.layerGroup(),
        naptan_notmatched = L.layerGroup(),
        naptan_not_a_bus_stop = L.layerGroup(),
        joiner = L.layerGroup(),
        map = L.map('map');

    /*

    [
      {
        "rowid": 23137,
        "AtcoCode": "0500CCITY055",          <*** Note 'Atco', not 'ATCO'
        "NaptanCode": "CMBDAGAP",
        "CommonName": "Storey's Way",
        "ShortCommonName": "Storey's Way",
        "Landmark": "Churchill College",
        "Street": "Madingley Road",
        "Crossing": null,
        "Indicator": "near",
        "Bearing": "E",
        "NptgLocalityCode": "E0055326",
        "LocalityName": "Cambridge",
        "Town": null,
        "Longitude": 0.10481260687,
        "Latitude": 52.2114061236,
        "StopType": "BCT",
        "BusStopType": "MKD",
        "TimingStatus": "TIP",
        "Notes": null,
        "AdministrativeAreaCode": 71,
        "Status": "act",
        "PlusbusZoneCode": "CAMBDGE",         <*** [1]
        "AltCommonName": "Churchill College", <*** [1]
        "AltShortName": null,                 <*** [1]
        "AltLandmark": null,                  <*** [1]
        "AltStreet": null,                    <*** [1]
        "AltCrossing": null,                  <*** [1]
        "AltIndicator": null                  <*** [1]
      },
        ...
    }

    [1] JSON null if no value. Multiple-values ';' separated

    */


    function load_naptan_busstops(new_stops, token) {

        console.log('Running load_naptan_busstops');

        if (!new_stops) {
            new_stops = [];
        }
        if (!token) {
            token = 0;
        }

        var url = 'https://naptan.herokuapp.com/naptan/merged_stops.json' +
            '?minlong=-0.755235&minlat=52.0085564' +
            '&maxlong=0.63038&maxlat=52.8346291' +
            '&_shape=array&token=' + token;
        console.log('Url: ' + url);

        $.ajax({url: url}
        ).done(
            function (data) {
                console.log(data);
                console.log('Got ' + data.length + ' stops');
                // If we got some data, try to get more
                if (data.length) {
                    console.log('Got stops');
                    new_stops = new_stops.concat(data);
                    var last = data[data.length - 1];
                    load_naptan_busstops(new_stops, last.rowid);
                }
                // Otherwise we are dome
                else {
                    console.log('No more stops');
                    naptan_data = {};
                    for (var i = 0; i < new_stops.length; ++i) {
                        var stop = new_stops[i];
                        naptan_data[stop['AtcoCode']] = stop;
                    }
                    if (osm_data) {
                        console.log('Loaded NaPTAN, have OSM');
                        display_stops();
                    }
                    else {
                        console.log('Loaded NaPTAN, no OSM yet');
                    }
                }
            }
        ).fail(
            function (ignore, ignore1, error_thrown) {
                alert(error_thrown);
            }
        );

    }


    function naptan_stop_as_text(stop) {

        var result = [];

        Object.keys(stop).sort().forEach(function(key) {
            if (stop[key]) {
                result.push(`<tr><th align="right">${key}</th><td>${stop[key]}</td></tr>`);
            }
        });

        return ('<h1>NaPTAN</h1><table>' + result.join(' ') + '</table>');
    }


    /*

    Overpass query (all nodes with highway=bus_stop or naptan:AtcoCode in the bounding box,
    and all relations containing them with site=stop_area or public_transport=stop_area:

    [out:json][bbox:52.0085564,-0.755235,52.8346291,0.63038];
    (
    node [highway=bus_stop];
    node ["naptan:AtcoCode"];
    )->.stops;
    .stops out;
    (
    rel(bn.stops) [site=stop_area];
    rel(bn.stops) [public_transport=stop_area];
    );
    out;

    Result

    {
      "version": 0.6,
      "generator": "Overpass API 0.7.54.12 054bb0bb",
      "osm3s": {
        "timestamp_osm_base": "2018-02-04T13:46:02Z",
        "copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL."
      },
      "elements": [
        {
          "type": "node",
          "id": 288064983,
          "lat": 52.2014247,
          "lon": 0.1146675,
          "tags": {
            "bus": "yes",
            "description": "Silver Street Eastbound.",
            "highway": "bus_stop",
            "name": "Queens' College",
            "naptan:AtcoCode": "0500CCITY417",
            "naptan:Bearing": "NE",
            "naptan:CommonName": "Queens' College",
            "naptan:Indicator": "near",
            "naptan:Landmark": "Queens' College",
            "naptan:NaptanCode": "cmbdgdjt",
            "naptan:PlusbusZoneRef": "CAMBDGE",
            "naptan:ShortCommonName": "Queens' College",
            "naptan:Street": "Silver Street",
            "naptan:verified": "no",
            "note": "CMBDGDJT Silver Street Queen's College stop. Has a bus times display.",
            "public_transport": "platform",
            "ref": "1",
            "shelter": "no",
            "source": "naptan_import;survey",
            "wheelchair": "yes"
          }
        },
        {
          "type": "relation",
          "id": 256979,
          "members": [
            {
              "type": "node",
              "ref": 502322878,
              "role": ""
            },
            {
              "type": "node",
              "ref": 502322879,
              "role": ""
            }
          ],
          "tags": {
            "name": "Ermine Way",
            "naptan:StopAreaCode": "270G00013051",
            "naptan:StopAreaType": "GPBS",
            "naptan:verified": "no",
            "site": "stop_area",
            "source": "naptan_import",
            "type": "site"
          }
        },
      ]
    }

    */


    function load_osm_busstops() {

        console.log('Running load_osm_busstops');

        $.ajax({
            url: 'http://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%3B%28node%5B%22highway%22%3D%22bus%5Fstop%22%5D%2852%2E0085564%2C%2D0%2E755235%2C52%2E8346291%2C0%2E63038%29%3Bnode%5B%22naptan%3AAtcoCode%22%5D%2852%2E0085564%2C%2D0%2E755235%2C52%2E8346291%2C0%2E63038%29%3B%29%2D%3E%2Estops%3B%2Estops%20out%3B%28relation%28bn%2Estops%29%5B%22site%22%3D%22stop%5Farea%22%5D%3Brelation%28bn%2Estops%29%5B%22public%5Ftransport%22%3D%22stop%5Farea%22%5D%3B%29%3Bout%3B%0A'
        }).done(
            function (data) {
                //console.log(data);
                var elements = data.elements;
                var area_map = {};

                osm_atco_index = [];
                osm_data = [];

                // loop over the returned elements
                for (var i = 0; i < elements.length; i++) {
                    // Nodes are all bus stops - push to osm_data and osm_atco_index
                    if (elements[i].type === 'node') {
                        osm_atco_index.push(elements[i].tags['naptan:AtcoCode']);
                        osm_data.push(elements[i]);
                    }
                    // Relations are stop areas - grab id->area_code mapping
                    else if (elements[i].type === 'relation') {
                        var area_code = elements[i].tags['naptan:StopAreaCode'];
                        for (var j = 0; j < elements[i].members.length; j++) {
                            if (area_map.hasOwnProperty(elements[i].members[j].ref)) {
                                area_map[elements[i].members[j].ref].push(area_code);
                            }
                            else {
                                area_map[elements[i].members[j].ref] = [area_code];
                            }
                        }
                    }
                    else {
                        console.log('Unexpected OSM element type', elements[i].type);
                    }
                }

                // add all the area codes to the elements of osm_data
                for (var k = 0; k < osm_data.length; k++) {
                    if (area_map.hasOwnProperty(osm_data[k].id)) {
                        osm_data[k].tags['naptan:StopAreaCode'] = area_map[osm_data[k].id].join(', ');
                    }
                }

                if (naptan_data) {
                    console.log('Loaded OSM, have NaPTAN');
                    display_stops();
                }
                else {
                    console.log('Loaded OSM, no NaPTAN yet');
                }
            }
        ).fail(
            function (ignore, ignore1, error_thrown) {
                alert(error_thrown);
            }
        );

    }


    function osm_stop_as_text(stop, errors) {

        var result = [];

        result.push('<table>');
        Object.keys(stop.tags).sort().forEach(function(key) {
            result.push(`<tr><th align="right">${key}:</th><td>${stop.tags[key]}</td></tr>`);
        });
        result.push('</table>');

        if (errors.length > 0) {
            result.push('<ul>');
            for (var i = 0; i < errors.length; i++) {
                result.push('<li>' + errors[i] + '</li>');
            }
            result.push('</ul>');
        }

        return '<h1>OSM</h1>' +
               `<h2>Id: ${stop.id}</h2>` +
               result.join(' ');
    }

    function compare_naptan_osm(naptan, osm_raw) {

        var osm = osm_raw.tags;

        var errors = [];

        // Want OSM highway=bus_stop except for non-physically_present stops
        if (!osm.physically_present === 'no') {
            if (!osm.highway) {
                errors.push(`Missing OSM tag "${'highway'}", expecting 'bus_stop'`);
            }
            else if (osm.highway !== 'bus_stop') {
                errors.push(`OSM tag '${'highway'}' has wrong value, expecting '${'bus_stop'}', got '${vspace(osm.highway)}'`);
            }
        }

        // Check if any osm naptan tags don't actually appear in naptan
        Object.keys(osm).sort().forEach(function(osm_tag) {
            if (osm_tag.startsWith('naptan:') && osm_tag !== 'naptan:verified') {
                var naptan_tag = osm_tag.substring(7);
                if (! naptan[naptan_tag]) {
                    errors.push(`OSM tag '${osm_tag}' with value '${vspace(osm[osm_tag])}' does not appear in NapTAN`);
                }
            }
        });

        //AltCommonname === alt_name

        // Check if all naptan tags that should be mapped are correctly reflected in osm
        var expected_naptan = [
            'AltCommonName', 'AltShortName', 'AltLandmark', 'AltStreet', 'AltCrossing',
            'AltIndicator', 'AtcoCode', 'Bearing', 'CommonName', 'Crossing', 'Indicator',
            'Landmark', 'Notes', 'ShortCommonName', 'Street', 'Type', 'StopAreaCode'];
        for (var j = 0; j < expected_naptan.length; j++) {
            var naptan_tag = expected_naptan[j];
            if (naptan[naptan_tag]) {
                var osm_tag = 'naptan:' + naptan_tag;
                if (! osm[osm_tag]) {
                    errors.push(`Missing OSM tag '${osm_tag}', expecting '${vspace(naptan[naptan_tag])}'`);
                }
                else if (osm[osm_tag].trim() !== naptan[naptan_tag].trim()) {
                    errors.push(`OSM tag '${osm_tag}' has wrong value, expecting '${vspace(naptan[naptan_tag])}', got '${vspace(osm[osm_tag])}'`);
                }
            }
        }

        // Cambridge seems to have loaded all their NaptanCode in upper case
        // while OSM has them in lower...
        if (naptan.NaptanCode) {
            if (! osm['naptan:NaptanCode']) {
                errors.push(`Missing OSM tag '${'naptan:NaptanCode'}', expecting '${vspace(naptan.NaptanCode)}'`);
            }
            else if (osm['naptan:NaptanCode'].toLowerCase() !== naptan.NaptanCode.toLowerCase()) {
                errors.push(`OSM tag 'naptan:NaptanCode' has wrong value, expecting '${vspace(naptan.NaptanCode.toLowerCase())}', got "${vspace(osm['naptan:NaptanCode'].toLowerCase())}'`);
            }
        }


        // Checking for expected naptan:BusStopType=CUS key
        //if (naptan.BusStopType === 'CUS' && osm['naptan:BusStopType'] !== 'CUS') {
        //    results.push('Missing OSM tag/value "naptan:BusStopType=CUS"');
        //}

        return errors;

    }

    function vspace(text) {
        // Convert ' ' into Unicode 'visable space' character
        return ('' + text).replace(/ /g, '\u2423');
    }


    function display_stops() {

        console.log('Doing display_stops');

        var naptan_marker_opts = {
            radius: 5,
            weight: 1,
            color: 'red',
            fill: true,
            stroke: true,
            fillOpacity: 0.8
        };

        var osm_marker_opts = {
            radius: 10,
            weight: 5,
            color: 'red',
            fill: false,
            stroke: true,
            opacity: 0.8,
            lineCap: 'but'
        };

        var join_opts = {
            weight: 4,
            color: 'green',
            fill: false,
            stroke: true,
            opacity: 0.8,
        };

        var stop, marker;

        // Stops in NaPTAN
        for (var id in naptan_data) {
            if (naptan_data.hasOwnProperty(id)) {
                stop = naptan_data[id];
                //if (stop.status === 'act' &&
                //   (stop.stoptype === 'BCT' || stop.stoptype == 'BCS' || stop.stoptype == 'BCQ' ||
                //       stop.stoptype == 'BST' || stop.stoptype == 'BCE' || stop.stoptype == 'BCP')) {

                marker = L.circleMarker([stop.Latitude, stop.Longitude], naptan_marker_opts)
                    .bindPopup(naptan_stop_as_text(stop));

                // Inactive or 'wrong type' stops
                if (stop.Status !== 'act' ||
                    (stop.StopType !== 'BCT' && stop.StopType !== 'BCS' && stop.StopType !== 'BCQ' &&
                     stop.StopType !== 'BST' && stop.StopType !== 'BCE' && stop.StopType !== 'BCP')) {
                    marker.setStyle({color: 'black'})
                        .addTo(naptan_not_a_bus_stop);
                }
                // Stops with an AtcoCode match in OSM
                else if (osm_atco_index.indexOf(stop.AtcoCode) !== -1) {
                    marker.setStyle({color: 'green'})
                        .addTo(naptan_matched);
                }
                // Everything else
                else {
                    marker.addTo(naptan_notmatched);
                }

            }
        }

        // Stops in OSM
        for (var i = 0; i < osm_data.length; i++) {
            stop = osm_data[i];

            marker = L.circleMarker([stop.lat, stop.lon], osm_marker_opts);

            if (stop.tags.hasOwnProperty('naptan:AtcoCode')) {
                // Stops also in NaPTAN
                if (naptan_data.hasOwnProperty(stop.tags['naptan:AtcoCode'])) {
                    var naptan_stop = naptan_data[stop.tags['naptan:AtcoCode']];
                    var errors = compare_naptan_osm(naptan_stop, stop);
                    // Stops with NaPTAN<->OSM labelling mismatches
                    if (errors.length > 0) {
                        marker.setStyle({dashArray: '5,1'});
                    }
                    marker.setStyle({color: 'green'})
                        .bindPopup(osm_stop_as_text(stop, errors))
                        .addTo(osm_matched);
                    L.polyline([[stop.lat, stop.lon],
                        [naptan_stop.Latitude, naptan_stop.Longitude]],
                    join_opts).addTo(joiner);
                }
                // Stops with a naptan:AtcoCode that doesn't appear in NaPTAN
                else {
                    marker.bindPopup(osm_stop_as_text(stop, []))
                        .addTo(osm_notmatched);
                }
            }
            // OSM stops with no naptan:AtcoCode
            else {
                marker.setStyle({color: 'orange'})
                    .bindPopup(osm_stop_as_text(stop, []))
                    .addTo(osm_unmatchable);
            }

        }

    }


    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a></a>',
        maxZoom: 20
    });


    var transport = L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=4154756cc3ab4f7f855acfc4f0a362a8', {
        attribution: 'Maps &copy; <a href="http://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom: 20
    });

    var university = L.tileLayer('https://map.cam.ac.uk/tiles/{z}/{x}/{y}.png', {
        attribution: '"Base map data copyright &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>. Map tiles from the <a href="https://map.cam.ac.uk/">University of Cambridge Official Map</a>, provided and managed by <a href="https://map.cam.ac.uk/">University Information Services</a>"',
        maxZoom: 19,
        minZoom: 13
    });

    var cambridge = L.latLng(52.20038, 0.1197);
    map.setView(cambridge, 14)
        .addLayer(osm)
        .addLayer(osm_matched)
        .addLayer(osm_notmatched)
        .addLayer(osm_unmatchable)
        .addLayer(naptan_matched)
        .addLayer(naptan_notmatched);

    var base_layers = {
        'OSM:': osm,
        'Transport': transport,
        'University': university
    };
    var overlay_layers = {
        'OSM matched': osm_matched,
        'OSM not matched': osm_notmatched,
        'OSM unmatchable': osm_unmatchable,
        'NaPTAN matched': naptan_matched,
        'NaPTAN not matched': naptan_notmatched,
        'NaPTAN not a bus stop': naptan_not_a_bus_stop,
        'Joins': joiner};

    L.control.layers(base_layers, overlay_layers, {collapsed: false}).addTo(map);
    base_layers['Transport'].addTo(map);

    // var all_layers = Object.assign({}, base_layers, overlay_layers);
    // var hash = new L.Hash(map, all_layers);


    L.rectangle([[52.0085564, -0.755235], [52.8346291, 0.63038]], {fill: false}).addTo(map);

    load_osm_busstops();
    load_naptan_busstops();

});

