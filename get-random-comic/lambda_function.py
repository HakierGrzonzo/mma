import json
from os import environ
import boto3
import random

BUCKET = environ["BUCKET"]

def get_current_comic_ids() -> list[str]:
    client = boto3.client('s3')
    response = client.get_object(Bucket=BUCKET, Key="ids.json")
    body = response["Body"]

    body_json = json.load(body)

    return body_json

list_of_comic_ids = get_current_comic_ids()

def get_host_from_referer(referer_header_value: str):
    DEFAULT_DOMAIN = "https://moringmark.grzegorzkoperwas.site/"
    ALLOWED_REFERRERS = [
        "http://localhost:3000/",
        "https://dev.moringmark.grzegorzkoperwas.site/",
        DEFAULT_DOMAIN
    ]
    if referer_header_value in ALLOWED_REFERRERS:
        return referer_header_value

    return DEFAULT_DOMAIN

def get_comic_candidates(queryParams: dict) -> list[str]:
    except_comic_id = queryParams.get("except")
    if except_comic_id is None:
        return list_of_comic_ids
    possible_ids = filter(lambda c: c != except_comic_id, list_of_comic_ids)
    return list(possible_ids)

def lambda_handler(event, context):
    referer = event.get("headers", {}).get("Referer")
    host_with_trailing_slash = get_host_from_referer(referer)
    
    queryParams = event.get("queryStringParameters", {})
    acceptable_comics = get_comic_candidates(queryParams)

    random_comic_id = random.choice(acceptable_comics)
    url = f"{host_with_trailing_slash}comic/{random_comic_id}/"

    return {
        "statusCode": 307,
        "headers": {
            "Location": url,
            "Content-type": "text/html"
        },
        "body": f'<a href="{url}">Click Here</a>',
    }
