provider "aws" {
  region = "us-east-1"
}

locals {
  applicationARN    = "arn:aws:resource-groups:us-east-1:767397670578:group/mma/0epa3txbvzptdclxtbl6yiw89s"
  one_hour_cache_id = "67394ec7-583a-41c0-8fc7-3f62f7d59947"
  caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
}

resource "aws_ecr_repository" "mma-scraper" {
  name                 = "scraper"
  image_tag_mutability = "MUTABLE"
  tags = {
    Environment    = "Dev"
    awsApplication = local.applicationARN
  }
}
resource "aws_ecr_repository" "mma-front" {
  name                 = "front"
  image_tag_mutability = "MUTABLE"
  tags = {
    Environment    = "Dev"
    awsApplication = local.applicationARN
  }
}


resource "aws_route53_zone" "mma" {
  name = "moringmark.grzegorzkoperwas.site"
  tags = {
    awsApplication = local.applicationARN
  }
}

module "mma_images" {
  source                   = "./bucket"
  bucket_domain            = "img.moringmark.grzegorzkoperwas.site"
  bucket_name              = "mma-images"
  bucket_caching_policy_id = local.caching_optimized
  route_53_zone_id         = aws_route53_zone.mma.id
  applicationARN           = local.applicationARN
}

module "random_lambda" {
  source                  = "./lambda"
  lambda_source_file_path = "./get-random-comic/lambda_function.py"
  lambda_name             = "get-random-comic"
  environment_variables = {
    BUCKET = module.mma_images.bucket.id
  }
}

module "mma_webroot" {
  source                   = "./bucket"
  bucket_domain            = "moringmark.grzegorzkoperwas.site"
  bucket_name              = "mma-web"
  bucket_caching_policy_id = local.one_hour_cache_id
  route_53_zone_id         = aws_route53_zone.mma.id
  applicationARN           = local.applicationARN
  random_function_domain = trimprefix(
    trimsuffix(
      module.random_lambda.url,
      "/"
    ),
    "https://"
  )
}

