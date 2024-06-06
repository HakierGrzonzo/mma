provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "mma-images" {
  bucket = "mma-images"
  tags = {
    Name        = "mma-images"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket" "mma-web" {
  bucket = "mma-web"
  tags = {
    Name        = "mma-web"
    Environment = "Dev"
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
  }
}
resource "aws_ecr_repository" "mma-front" {
  name = "front"
  image_tag_mutability = "MUTABLE"
  tags = {
    Environment = "Dev"
  }
}

locals {
  cert_arn = "arn:aws:acm:us-east-1:767397670578:certificate/e9263c10-140d-4b45-a27d-2dd10269d145"
  one_hour_cache_id = "67394ec7-583a-41c0-8fc7-3f62f7d59947"
}

resource "aws_cloudfront_distribution" "mma-images" {
  origin {
    domain_name = aws_s3_bucket.mma-images.bucket_domain_name
    origin_id   = "mma-images"
  }
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["img.moringmark.grzegorzkoperwas.site"]

  default_cache_behavior {
    cached_methods = ["GET", "HEAD"]
    compress = true
    viewer_protocol_policy = "redirect-to-https"
    # Using the one-hour policy ID:
    cache_policy_id  = local.one_hour_cache_id
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
}

resource "aws_route53_zone" "mma" {
  name = "moringmark.grzegorzkoperwas.site"
}

import {
  to = aws_route53_zone.mma
  id = "Z05374111XE5KFVN016OU"
}

resource "aws_route53_record" "www" {
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
