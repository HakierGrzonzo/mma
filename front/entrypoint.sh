#!/bin/bash
npm run build && cd ./out && aws s3 sync . "s3://$DESTINATION/" --acl public-read
