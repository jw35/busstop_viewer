// Javascript functions for the Bost Stop viewer

/*jslint browser: true */
/*jshint esversion: 6 */
/*global $, jQuery, L, format */

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
    var limit_warning = L.control({position: 'topright'});
    limit_warning.onAdd = function () {
        var div = L.DomUtil.create('div', 'info warning');
        div.innerHTML = '<b>Too many points</b> - zoom in or filter';
        return div;
    };
*/

/*

{
  "0500CCITY055": {
    "administrativeareacode": "071",
    "altdescriptors": [
      {
        "commonname": "Churchill College",
        "commonnamelang": "en",
        "creationdatetime": "2006-05-19 00:00:00+01",
        "crossing": "",
        "crossinglang": "",
        "indicator": "",
        "indicatorlang": "",
        "landmark": "",
        "landmarklang": "",
        "modification": "new",
        "modificationdatetime": "2007-03-12 00:00:00+00",
        "revisionnumber": "",
        "shortcommonnamelang": "",
        "shortname": "",
        "street": "",
        "streetlang": ""
      }
    ],
    "atcocode": "0500CCITY055",
    "bearing": "E",
    "busstoptype": "MKD",
    "cleardowncode": null,
    "commonname": "Storey's Way",
    "commonnamelang": "en",
    "creationdatetime": "Sat, 01 Nov 2003 00:00:00 GMT",
    "crossing": null,
    "crossinglang": null,
    "defaultwaittime": null,
    "easting": 543908,
    "grandparentlocalityname": null,
    "gridtype": "U",
    "indicator": "near",
    "indicatorlang": "en",
    "landmark": "Churchill College",
    "landmarklang": "en",
    "latitude": 52.2114061236,
    "localitycentre": "0",
    "localityname": "Cambridge",
    "longitude": 0.10481260687,
    "modification": "rev",
    "modificationdatetime": "Wed, 02 Apr 2008 00:00:00 GMT",
    "naptancode": "CMBDAGAP",
    "northing": 259108,
    "notes": null,
    "noteslang": null,
    "nptglocalitycode": "E0055326",
    "parentlocalityname": null,
    "pbcreationdatetime": "Sat, 01 Nov 2003 00:00:00 GMT",
    "pbmodification": "rev",
    "pbmodificationdatetime": "Wed, 02 Apr 2008 00:00:00 GMT",
    "platecode": null,
    "plusbuszonecode": "CAMBDGE",
    "revisionnumber": 3,
    "shortcommonname": "Storey's Way",
    "shortcommonnamelang": "en",
    "status": "act",
    "stopareacodes": [
      "050GCC054055"
    ],
    "stoptype": "BCT",
    "street": "Madingley Road",
    "streetlang": "en",
    "suburb": null,
    "suburblang": null,
    "timingstatus": "TIP",
    "town": null,
    "townlang": null
  }
}

*/

    function load_naptan_busstops() {

        console.log('Running load_naptan_busstops');
        $.ajax({
            url: 'http://127.0.0.1:5000/stops?bbox=-0.755235,52.0085564,0.63038,52.8346291&limit=1000000&key=E44C5B4E-D3ED-4A5B-AC40-16C8EF53F195'
        }).done(
            function (data) {
                //console.log(data);
                naptan_data = data;
                if (osm_data) {
                    console.log('Loaded NaPTAN, have OSM');
                    display_stops();
                }
                else {
                    console.log('Loaded NaPTAN, no OSM yet');
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
        var interesting = [ "administrativeareacode", "atcocode", "bearing", "busstoptype",
                            "commonname", "crossing", 
                            "indicator", "landmark", 
                            "localityname", "naptancode", "notes", "nptglocalitycode",
                            "plusbuszonecode", "shortcommonname", "status",
                            "stopareacodes", "stoptype", "street", "timingstatus",
                            "town"];

        for (var i = 0; i < interesting.length; i++) {
            result.push(`<tr><th align="right">${interesting[i]}</th><td>${stop[interesting[i]]}</td></tr>`);
        }
        var alt_interesting = ["commonname", "crossing", "indicator", "landmark", "shortname",
                               "street"];
        for (var j = 0; j < stop.altdescriptors.length; j++) {
            var descriptor = stop.altdescriptors[j];
            for (var k = 0; k < alt_interesting.length; k++) {
                result.push(`<tr><th align="right">alt ${alt_interesting[k]}</th><td>${descriptor[alt_interesting[k]]}</td></tr>`);
            }
        }

        return ("<h1>NaPTAN</h1><table>" + result.join(" ") + "</table>");
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

                // loop over the retruned elements
                for (var i = 0; i < elements.length; i++) {
                    // Nodes are all bus stops - push to osm_data ans osm_atco_index
                    if (elements[i].type == 'node') {
                        osm_atco_index.push(elements[i].tags['naptan:AtcoCode']);
                        osm_data.push(elements[i]);
                    }
                    // Relations are stop areas - grab id->area_code mapping
                    else if (elements[i].type == 'relation') {
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
                        osm_data[k].tags.stopareacode = area_map[osm_data[k].id];
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


    function osm_stop_as_text(stop,errors) {

        var result = [];
        result.push('<table>');
        for (var key in stop.tags) {
            if (stop.tags.hasOwnProperty(key)) {
                result.push(`<tr><th align="right">${key}:</th><td>${stop.tags[key]}</td></tr>`);
            }
        }
        result.push('</table>');
        if (errors.length > 0) {
           result.push('<ul>');
           for (var i = 0; i < errors.length; i++) {
               result.push('<li>' + errors[i] + '</li>');
           }
           result.push('</ul>');
        }
        return "<h1>OSM</h1>" +
               `<h2>Id: ${stop.id}</h2>` +
               result.join(" ");
    }

    // Mapping tables between NaPTAN (via the API) keys and OSM tags
    var naptan_to_osm = {
        atcocode: 'naptan:AtcoCode',
        bearing: 'naptan:Bearing',
        commonname: 'naptan:CommonName',
        crossing: 'naptan:Crossing',
        indicator: 'naptan:Indicator',
        landmark:  'naptan:Landmark',
        naptancode: 'naptan:NaptanCode',
        notes: 'naptan:Notes',
        plusbuszonecode: 'naptan:PlusbusZoneRef',
        shortcommonname: 'naptan:ShortCommonName',
        street: 'naptan:Street',
    };
    var osm_to_naptan = {};
    for (var key in naptan_to_osm) {
        if (naptan_to_osm.hasOwnProperty(key)) {
            osm_to_naptan[naptan_to_osm[key]] = key;
        }
    }

    var alt_naptan_to_osm = {
        commonname: "naptan:AltCommonName",
        crossing: "naptan:AltCrossing",
        indicator: "naptan:AltIndicator",
        landmark: "naptan:AltLandmark",
        shortname: "naptan:AltShortname",
        street: "naptan:AltStreet"
    };
    var alt_osm_to_naptan = {};
    for (var key2 in alt_naptan_to_osm) {
        if (alt_naptan_to_osm.hasOwnProperty(key2)) {
            alt_osm_to_naptan[alt_naptan_to_osm[key2]] = key2;
        }
    }


    function compare_naptan_osm(naptan, osm_raw) {

        var osm = osm_raw.tags;
        var naptan_key, osm_tag, i, j, descriptor;

        var results = [];

        // Checking for 'expected' top-level tags
        var expected = ["naptan:AtcoCode", "naptan:Bearing", "naptan:CommonName", "naptan:Crossing",
                        "naptan:Indicator", "naptan:Landmark", "naptan:NaptanCode", "naptan:PlusbusZoneRef",
                        "naptan:Notes", "naptan:ShortCommonName", "Street"];
        for (i = 0; i < expected.length; i++) {
            osm_tag = expected[i];
            naptan_key = osm_to_naptan[osm_tag];
            if (naptan[naptan_key] && ! osm[osm_tag]) {
                results.push("Missing OSM tag '" + osm_tag + "', should be '" + visable_space(naptan[naptan_key]) + "'");
            }
        }

        // Checking for expected naptan:BusStopType=CUS key
        if (naptan.busstoptype === 'CUS' && osm['naptan:BusStopType'] !== 'CUS') {
            results.push("Missing OSM tag/value 'naptan:BusStopType=CUS'");
        }

        // Checking alternate names
        for (i = 0; i < naptan.altdescriptors.length; i++) {
            descriptor = naptan.altdescriptors[i];
            var alt_expected = ["naptan:AltCommonName", "naptan:AltCrossing", "naptan:AltIndicator",
                                "naptan:AltLandmark", "naptan:AltShortname", "naptan:AltStreet"];
            for (j = 0; j < alt_expected.length; j++) {
                osm_tag = alt_expected[j];
                naptan_key = alt_osm_to_naptan[osm_tag];
                if (descriptor[naptan_key] && ! osm[osm_tag]) {
                    results.push("Missing OSM tag '" + osm_tag + "', should be '" + visable_space(descriptor[naptan_key]) + "'");
                }
            }
        }

        // Checking stop areas
        for (i = 0; i < naptan.stopareacodes.length; i++) {
            var code = naptan.stopareacodes[i];
            if (osm.stopareacode === undefined || osm.stopareacode.indexOf(code) === -1) {
                results.push("Missing OSM StopAreaRelation for '" + code + "'");
            }
        }


        // Checking all OSM naptan: tags have a corresponding entry in NaPTAN
        for (osm_tag in osm) {
            if (osm.hasOwnProperty(osm_tag) && osm_tag.startsWith("naptan:")) {
                // Skip this becasue it isn't real
                if (osm_tag === "naptan:verified") {
                    continue;
                }
                // Is an 'Alt' key?
                if (osm_tag in alt_osm_to_naptan) {
                    naptan_key = alt_osm_to_naptan[osm_tag];
                    var found = false;
                    for (i = 0; i < naptan.altdescriptors.length; i++) {
                        descriptor = naptan.altdescriptors[i];
                        if (osm[osm_tag] === descriptor[naptan_key]) {
                            found = true;
                            break;
                        }
                    }
                    if (! found) {
                        results.push(osm_tag + " mismatched: OSM '" + osm[osm_tag] + "' not in NaPTAN");
                    }

                }
                // Otherwise it's a top level one
                else {
                    // Get it from the map and otherwise try to extract it
                    naptan_key = osm_to_naptan[osm_tag] || osm_tag.substring(7).toLowerCase();
                    if (! naptan[naptan_key]) {
                        results.push(osm_tag + " mismatched: OSM '" + osm[osm_tag] + "' not in NaPTAN");
                    }
                    else if (('' + osm[osm_tag]).toLowerCase() != ('' + naptan[naptan_key]).toLowerCase()) {
                        //console.log(('' + osm[key]).toLowerCase(), ('' + naptan[naptan_key]).toLowerCase());
                        results.push(osm_tag + " mismatched: OSM '" + visable_space(osm[osm_tag]) +
                            "' != NaPTAN '" + visable_space(naptan[naptan_key]) + "'");
                    }
                }
            }
        }

        return results;

    }

    function visable_space(text) {
        // Convert ' ' into Unicode 'visable space' character
        return ('' + text).replace(/ /g,'\u2423');
    }


    function display_stops() {

        console.log('Doing display_stops');

        var naptan_marker_opts = {
            radius: 5,
            weight: 1,
            color: "red",
            fill: true,
            stroke: true,
            fillOpacity: 0.8
        };

        var osm_marker_opts = {
            radius: 10,
            weight: 5,
            color: "red",
            fill: false,
            stroke: true,
            opacity: 0.8,
            lineCap: "but"
        };


        var join_opts = {
            weight: 4,
            color: "green",
            fill: false,
            stroke: true,
            opacity: 0.8,
        };

        var stop, marker;

        // Stops in NaPTAN
        for (var id in naptan_data) {
            stop = naptan_data[id];
            //if (stop.status === 'act' &&
             //   (stop.stoptype === 'BCT' || stop.stoptype == 'BCS' || stop.stoptype == 'BCQ' ||
             //       stop.stoptype == 'BST' || stop.stoptype == 'BCE' || stop.stoptype == 'BCP')) {

                marker = L.circleMarker([stop.latitude, stop.longitude], naptan_marker_opts)
                    .bindPopup(naptan_stop_as_text(stop));

                // Inactive or 'wrong type' stops
                if (stop.status != 'act' ||
                    (stop.stoptype != 'BCT' && stop.stoptype != 'BCS' && stop.stoptype != 'BCQ' &&
                     stop.stoptype != 'BST' && stop.stoptype != 'BCE' && stop.stoptype != 'BCP')) {
                    marker.setStyle({color: 'black'})
                        .addTo(naptan_not_a_bus_stop);
                }
                // Stops with an AtcoCode match in OSM
                else if (osm_atco_index.indexOf(stop.atcocode) != -1) {
                    marker.setStyle({color: 'green'})
                        .addTo(naptan_matched);
                }
                // Everything else
                else {
                    marker.addTo(naptan_notmatched);
                }

           //}
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
                        .bindPopup(osm_stop_as_text(stop,errors))
                        .addTo(osm_matched);
                    L.polyline([[stop.lat, stop.lon],
                        [naptan_stop.latitude, naptan_stop.longitude]],
                        join_opts).addTo(joiner);
                }
                // Stops with a naptan:AtcoCode that doesn't appear in NaPTAN
                else {
                    marker.bindPopup(osm_stop_as_text(stop,[]))
                        .addTo(osm_notmatched);
                }
            }
            // OSM stops with no naptan:AtcoCode
            else {
                marker.setStyle({color: 'orange'})
                    .bindPopup(osm_stop_as_text(stop,[]))
                    .addTo(osm_unmatchable);
            }

        }

    }


    var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

    var base_layers =    {'OSM:': osm,
                          'Transport': transport,
                          'University': university};
    var overlay_layers = {'OSM matched': osm_matched,
                          'OSM not matched': osm_notmatched,
                          'OSM unmatchable': osm_unmatchable,
                          'NaPTAN matched': naptan_matched,
                          'NaPTAN not matched': naptan_notmatched,
                          'NaPTAN not a bus stop': naptan_not_a_bus_stop,
                          'Joins': joiner};

    L.control.layers(base_layers, overlay_layers, {collapsed: false}).addTo(map);

    //var hash = new L.Hash(map);
    var all_layers = Object.assign({}, base_layers, overlay_layers);
    var hash = new L.Hash(map, all_layers);


    L.rectangle([[52.0085564,-0.755235],[52.8346291,0.63038]],{fill: false}).addTo(map);

    load_osm_busstops();
    load_naptan_busstops();

});

