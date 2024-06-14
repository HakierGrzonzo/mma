#!/bin/bash

# If you are unable to run the scraper, then this script returns some example 
# results

wget https://www.grzegorzkoperwas.site/transfer/example_results.zip \
  --output-document /tmp/example_results.zip
rm -r ./scraper/results/*
mkdir ./scraper/results
unzip /tmp/example_results.zip -d ./scraper/results

