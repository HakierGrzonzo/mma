#!/bin/bash
npm run build && cd ./out && aws s3 sync . "s3://$DESTINATION/" --size-only --delete --acl public-read
