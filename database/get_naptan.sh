#!/bin/bash

# Retrieve a copy of the NaPTAN data

mkdir -p NaPTANcsv
cd NaPTANcsv || exit 1

TMPFILE=$(mktemp)

curl -o "${TMPFILE}" 'http://naptan.app.dft.gov.uk/DataRequest/Naptan.ashx?format=csv'
unzip -o "${TMPFILE}"

rm "${TMPFILE}"
