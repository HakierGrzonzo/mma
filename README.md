# MoringMark Archive

https://moringmark.grzegorzkoperwas.site/

An archive of **The Owl House** comics made by [u/makmark](https://www.reddit.com/user/makmark) and posted to the subreddit.

Made cause I wanted to read all the parts of [Grom Factor](https://moringmark.grzegorzkoperwas.site/comic/Grom%20Factor/) in order.

## Features:

- Individual comics are merged into series
- A sortable list of comics
- OCR in alt text
- Automatic update via scheduled jobs

It is just a static website built from json files, what more do you expect from it.

## Technical stuff

I used this project to learn AWS.

The website is hosted by an `s3`, proxied by `cloudfront`.

Two ECS tasks (built by github actions) process reddit posts and store them in `s3`, simple stuff.


## How to develop

### Requirements:

- A unixlike operating system
- `node` and `npm`
- `python 3.12` and `poetry`

### Instructions:

1. Clone the repo
2. Acquire reddit API secret and export it into env variable `SECRET`.
    - Alternatively use the `./get_example_results_from_scraper.sh` to download example 
      data for frontend development
3. Go to `./scraper` and launch `poetry install` to install scraper dependencies
4. Launch `poetry run -m src` to gather the data from reddit
    - You can pass an env parameter `COMIC_LIMIT` to limit the amount of comics
5. Go to `./front` and launch `npm install`
6. Run `npm run dev` to see the development version in your browser
7. Run `npm run build` to see the final result

There is also a docker-compose file, you could add some volumes to make it work
locally or add references to two s3 buckets in `BUCKET` and `DESTINATION` env 
variables.

