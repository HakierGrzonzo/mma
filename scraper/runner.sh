#!/bin/sh

python -m src.storage_service down && \
  python -m tumblr && \
  python -m src && \
  python -m src.storage_service up && \
  python -m src deploy
