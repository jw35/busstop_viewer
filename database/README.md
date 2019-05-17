Building the NaPTAN database
============================

This is a set of tools to build a SQLite database containing all the
data from [NaPTAN](https://data.gov.uk/dataset/ff93ffc1-6656-47d8-9155-85ea0b8f2251/national-public-transport-access-nodes-naptan)
suitable for serving using [datasette](https://github.com/simonw/datasette)
using [csvs-to-sqlite] to do the import.


`get_naptan.sh`
---------------

Downloads and unzips a copy of the NaPTAN csv files to `./NaPTANcsv/`

`build_database.sh`
-------------------

Loads all the NaPTAN csv files in `./NaPTANcsv/` into the SQLite database
`naptan.sqlite`. Adds a small number of indexes and a custom view to support
extracting NaPTAN data of interest to OpenStreetMap (see below).

`serve_database.sh`
-------------------

Serve the database using a local datasette server.

`publish_database.sh`
---------------------

Publish the database to Heroku. Assumes the Heroku command-line client
is available and configured - see dataset documentation.

Views
-----

### StopAltZoneArea view

This view joins the `Stops`, `StopPlusBusZones`, `StopsInArea` and
`AlternativeDescriptors` tables to collect together the NaPTAN data
that is represented in OpenStreetMap.

In the NaPTAN data model, Stops have a 'zero or one to many' relation
with StopAreas, PlusbusZones and AlternativeDescriptors. However
OpenStreetMap effectively assumes a 'zero-or-one' relationship with
StopAreas, PlusbusZones and with the individual components of
AlternativeDescriptors. To simplify processing, this view collects all
available values of each of these fields into a semi-colon-separated list
which can be compared fairly easily with values extracted from OSM.

### StopAreaStop view

This view joins the `StopAreas` and `StopsInArea` tables in much the same
way as above.

Canned queries
--------------

`metadata.json` contains a small amount of metadata about the databases
and also defines some handy canned queries against the data:

* `merged_stops`: All stop data from the StopAltZoneArea view, filtered
by a lat/long box and paginated by rowid.
* `merged_stop`: All stop data from the StopAltZoneArea view for a single stop
* `merged_stop_area`: All stop area data from the StopAreaStop view for a single
stop area