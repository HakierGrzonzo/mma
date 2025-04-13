#!/bin/bash
export DB=/tmp/mma.sqlite

aws s3 cp s3://$BUCKET/mma.sqlite $DB && \
  cp -v $DB ./public/assets/ && \
  npm run build && \
  cd ./out && \
  aws s3 sync . "s3://$DESTINATION/" --acl public-read
