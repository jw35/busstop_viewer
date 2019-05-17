#!/bin/bash

datasette serve \
    --metadata metadata.json \
    --config sql_time_limit_ms:3000 \
    --config max_returned_rows:4000 \
    naptan.sqlite
