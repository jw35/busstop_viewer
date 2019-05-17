#!/bin/bash

csvs-to-sqlite --replace-tables \
               --index ATCOCode \
               --index Latitude \
               --index Longitude \
               NaPTANcsv/Stops.csv \
               naptan.sqlite

csvs-to-sqlite --replace-tables \
               --index AtcoCode \
               NaPTANcsv/StopPlusbusZones.csv \
               NaPTANcsv/AlternativeDescriptors.csv \
               NaPTANcsv/StopsInArea.csv \
               naptan.sqlite

csvs-to-sqlite --replace-tables \
               NaPTANcsv/AirReferences.csv \
               NaPTANcsv/AreaHierarchy.csv \
               NaPTANcsv/CoachReferences.csv \
               NaPTANcsv/FerryReferences.csv \
               NaPTANcsv/Flexible.csv \
               NaPTANcsv/HailRide.csv \
               NaPTANcsv/LocalityMainAccessPoints.csv \
               NaPTANcsv/MetroReferences.csv \
               NaPTANcsv/RailReferences.csv \
               NaPTANcsv/StopAreas.csv \
               NaPTANcsv/StopAvailability.csv \
               NaPTANcsv/StopLocalities.csv \
               naptan.sqlite

sqlite3 naptan.sqlite < add_views.sql
