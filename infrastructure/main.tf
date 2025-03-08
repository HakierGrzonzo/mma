locals {
  applicationARN = "arn:aws:resource-groups:us-east-1:767397670578:group/mma/0epa3txbvzptdclxtbl6yiw89s"
  root_domain    = "moringmark.grzegorzkoperwas.site"
  image_domain   = "img.${local.root_domain}"
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      awsApplication = local.applicationARN
    }
  }
}

variable "reddit_api_secret" {
  type      = string
  sensitive = true
}


resource "aws_route53_zone" "mma" {
  name = local.root_domain
}

resource "aws_acm_certificate" "mma-cert" {
  domain_name               = local.root_domain
  subject_alternative_names = [local.image_domain]
  validation_method         = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert" {
  for_each = {
    for dvo in aws_acm_certificate.mma-cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.mma.zone_id
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_cache_policy" "one_hour_cache" {
  name        = "one-hour-cache-policy"
  default_ttl = 60 * 30
  max_ttl     = 60 * 60
  min_ttl     = 60 * 15
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_response_headers_policy" "mma" {
  for_each = tomap({
    optimized = data.aws_cloudfront_cache_policy.caching_optimized
    onehour   = aws_cloudfront_cache_policy.one_hour_cache
  })
  name = "mma-cache-${each.value.name}"
  custom_headers_config {
    items {
      header   = "Cache-Control"
      value    = "max-age=${each.value.max_ttl}, public"
      override = false
    }
  }
}
module "mma_images" {
  bucket_caching_policy_id          = data.aws_cloudfront_cache_policy.caching_optimized.id
  bucket_certificate_arn            = aws_acm_certificate.mma-cert.arn
  bucket_domain                     = local.image_domain
  bucket_name                       = "mma-images"
  route_53_zone_id                  = aws_route53_zone.mma.id
  default_response_header_policy_id = aws_cloudfront_response_headers_policy.mma["optimized"].id
  source                            = "./bucket"
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
  bucket_caching_policy_id          = aws_cloudfront_cache_policy.one_hour_cache.id
  bucket_certificate_arn            = aws_acm_certificate.mma-cert.arn
  bucket_domain                     = local.root_domain
  bucket_name                       = "mma-web"
  route_53_zone_id                  = aws_route53_zone.mma.id
  source                            = "./bucket"
  default_response_header_policy_id = aws_cloudfront_response_headers_policy.mma["onehour"].id
  random_function_domain = trimprefix(
    trimsuffix(
      module.random_lambda.url,
      "/"
    ),
    "https://"
  )
  cloudfront_cache_behaviors = [{
    path                       = "/_next/*"
    policy_id                  = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.mma["optimized"].id
    }, {
    path                       = "/assets/*"
    policy_id                  = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.mma["optimized"].id
  }]
}

