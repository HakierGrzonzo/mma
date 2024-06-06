FROM python:3.12
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install poetry==1.7.1
RUN poetry config virtualenvs.in-project true --local

WORKDIR /scraper

COPY ./poetry.lock ./pyproject.toml .
RUN poetry install --only=main
COPY . .
ENTRYPOINT poetry run python -m src
