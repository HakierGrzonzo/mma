provider "aws" {
  region = "us-east-1"
}

locals {
  applicationARN = "arn:aws:resource-groups:us-east-1:767397670578:group/mma/0epa3txbvzptdclxtbl6yiw89s"
  cert_arn = "arn:aws:acm:us-east-1:767397670578:certificate/e9263c10-140d-4b45-a27d-2dd10269d145"
  one_hour_cache_id = "67394ec7-583a-41c0-8fc7-3f62f7d59947"
  caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  random_function_domain = "465euyd151.execute-api.us-east-1.amazonaws.com"
}

resource "aws_ecr_repository" "mma-scraper" {
  name = "scraper"
  image_tag_mutability = "MUTABLE"
  tags = {
    Environment = "Dev"
    awsApplication = local.applicationARN
  }
}
resource "aws_ecr_repository" "mma-front" {
  name = "front"
  image_tag_mutability = "MUTABLE"
  tags = {
    Environment = "Dev"
    awsApplication = local.applicationARN
  }
}


resource "aws_route53_zone" "mma" {
  name = "moringmark.grzegorzkoperwas.site"
  tags = {
    awsApplication = local.applicationARN
  }
}

import {
  to = aws_route53_zone.mma
  id = "Z05374111XE5KFVN016OU"
}

module "mma_images"{
  source = "./bucket"
  bucket_domain = "img.moringmark.grzegorzkoperwas.site"
  bucket_name = "mma-images"
  bucket_caching_policy_id = local.caching_optimized
  route_53_zone_id = aws_route53_zone.mma.id
  applicationARN = local.applicationARN
}

module "mma_webroot"{
  source = "./bucket"
  bucket_domain = "moringmark.grzegorzkoperwas.site"
  bucket_name = "mma-web"
  bucket_caching_policy_id = local.one_hour_cache_id
  route_53_zone_id = aws_route53_zone.mma.id
  applicationARN = local.applicationARN
  random_function_domain = local.random_function_domain
}


