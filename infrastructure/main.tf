provider "aws" {
  region = "us-east-1"
}

locals {
  applicationARN = "arn:aws:resource-groups:us-east-1:767397670578:group/mma/0epa3txbvzptdclxtbl6yiw89s"
  cert_arn = "arn:aws:acm:us-east-1:767397670578:certificate/e9263c10-140d-4b45-a27d-2dd10269d145"
  one_hour_cache_id = "67394ec7-583a-41c0-8fc7-3f62f7d59947"
  caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
}

resource "aws_s3_bucket" "mma-images" {
  bucket = "mma-images"
  tags = {
    Name        = "mma-images"
    Environment = "Dev"
    awsApplication = local.applicationARN
  }
}

resource "aws_s3_bucket" "mma-web" {
  bucket = "mma-web"
  tags = {
    Name        = "mma-web"
    Environment = "Dev"
    awsApplication = local.applicationARN
  }
}

resource "aws_s3_bucket_cors_configuration" "mma" {
  for_each = toset([aws_s3_bucket.mma-web.id, aws_s3_bucket.mma-images.id])
  bucket = each.key

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*.grzegorzkoperwas.site", "http://localhost:3000"]
  }
}

resource "aws_s3_bucket_ownership_controls" "mma" {
  for_each = toset([aws_s3_bucket.mma-web.id, aws_s3_bucket.mma-images.id])
  bucket = each.key
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "mma" {
  for_each = toset([aws_s3_bucket.mma-web.id, aws_s3_bucket.mma-images.id])
  bucket = each.key

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "mma" {
  for_each = toset([aws_s3_bucket.mma-web.id, aws_s3_bucket.mma-images.id])
  bucket = each.key
  depends_on = [
    aws_s3_bucket_ownership_controls.mma,
    aws_s3_bucket_public_access_block.mma,
  ]

  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "mma" {
  for_each = toset([aws_s3_bucket.mma-web.id, aws_s3_bucket.mma-images.id])
  bucket = each.key

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
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

resource "aws_cloudfront_distribution" "mma-images" {
  origin {
    domain_name = aws_s3_bucket.mma-images.website_endpoint
    origin_id   = "mma-images"
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }
  enabled             = true
  is_ipv6_enabled     = true

  aliases = ["img.moringmark.grzegorzkoperwas.site"]

  default_cache_behavior {
    cached_methods = ["GET", "HEAD"]
    compress = true
    viewer_protocol_policy = "redirect-to-https"
    # Using the one-hour policy ID:
    cache_policy_id  = local.caching_optimized
    allowed_methods  = ["GET", "HEAD"]
    target_origin_id = "mma-images"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }


  viewer_certificate {
    acm_certificate_arn = local.cert_arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method = "sni-only"
  }
  tags = {
    awsApplication = local.applicationARN
  }
}

resource "aws_cloudfront_distribution" "mma-web" {
  origin {
    domain_name = aws_s3_bucket.mma-web.website_endpoint
    origin_id   = "mma-web"
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }
  enabled             = true
  is_ipv6_enabled     = true

  aliases = ["dev.moringmark.grzegorzkoperwas.site"]

  default_cache_behavior {
    cached_methods = ["GET", "HEAD"]
    compress = true
    viewer_protocol_policy = "redirect-to-https"
    # Using the one-hour policy ID:
    cache_policy_id  = local.one_hour_cache_id
    allowed_methods  = ["GET", "HEAD"]
    target_origin_id = "mma-web"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  tags = {
    awsApplication = local.applicationARN
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
  }


  viewer_certificate {
    acm_certificate_arn = local.cert_arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method = "sni-only"
  }
}
resource "aws_cloudfront_distribution" "mma-prod" {
  origin {
    domain_name = aws_s3_bucket.mma-web.website_endpoint
    origin_id   = "mma-web-prod"
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }
  enabled             = true
  is_ipv6_enabled     = true

  aliases = ["moringmark.grzegorzkoperwas.site"]

  default_cache_behavior {
    cached_methods = ["GET", "HEAD"]
    compress = true
    viewer_protocol_policy = "redirect-to-https"
    # Using the one-hour policy ID:
    cache_policy_id  = local.one_hour_cache_id
    allowed_methods  = ["GET", "HEAD"]
    target_origin_id = "mma-web-prod"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  tags = {
    awsApplication = local.applicationARN
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
  }


  viewer_certificate {
    acm_certificate_arn = local.cert_arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method = "sni-only"
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

resource "aws_route53_record" "img" {
  zone_id = aws_route53_zone.mma.zone_id
  name    = "img"
  for_each = toset(["A", "AAAA"])
  type    = each.key
  alias {
    name = aws_cloudfront_distribution.mma-images.domain_name
    zone_id = aws_cloudfront_distribution.mma-images.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "web" {
  zone_id = aws_route53_zone.mma.zone_id
  name    = "dev"
  for_each = toset(["A", "AAAA"])
  type    = each.key
  alias {
    name = aws_cloudfront_distribution.mma-web.domain_name
    zone_id = aws_cloudfront_distribution.mma-web.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "web-prod" {
  zone_id = aws_route53_zone.mma.zone_id
  name    = ""
  for_each = toset(["A", "AAAA"])
  type    = each.key
  alias {
    name = aws_cloudfront_distribution.mma-prod.domain_name
    zone_id = aws_cloudfront_distribution.mma-web.hosted_zone_id
    evaluate_target_health = false
  }
}
