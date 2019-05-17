#!/bin/bash

datasette publish heroku \
    --metadata metadata.json \
    --extra-options '--config sql_time_limit_ms:6000 --config max_returned_rows:4000' \
    --install datasette-cluster-map \
    --name naptan \
    naptan.sqlite