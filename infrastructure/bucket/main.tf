resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name
  tags = {
    Name = var.bucket_name
  }
}

resource "aws_s3_bucket_ownership_controls" "ownership" {
  bucket = aws_s3_bucket.bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "acl" {
  bucket = aws_s3_bucket.bucket.id
  depends_on = [
    aws_s3_bucket_ownership_controls.ownership,
    aws_s3_bucket_public_access_block.public_access,
  ]

  acl = "public-read"
}

resource "aws_s3_bucket_website_configuration" "website_config" {
  bucket = aws_s3_bucket.bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

resource "aws_cloudfront_distribution" "distribuition" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.website_config.website_endpoint
    origin_id   = var.bucket_name
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }
  }

  dynamic "origin" {
    for_each = var.random_function_domain != null ? [var.random_function_domain] : []
    iterator = domain
    content {
      domain_name = domain.value
      origin_id   = "random-function"
      custom_origin_config {
        http_port                = "80"
        https_port               = "443"
        origin_protocol_policy   = "https-only"
        origin_read_timeout      = 30
        origin_keepalive_timeout = 5
        origin_ssl_protocols     = ["TLSv1.2"]
      }
    }
  }

  dynamic "ordered_cache_behavior" {
    for_each = var.random_function_domain != null ? [var.random_function_domain] : []
    iterator = domain
    content {
      cached_methods         = ["GET", "HEAD"]
      cache_policy_id        = data.aws_cloudfront_cache_policy.caching_disabled.id
      allowed_methods        = ["GET", "HEAD"]
      target_origin_id       = "random-function"
      path_pattern           = "/random"
      viewer_protocol_policy = "redirect-to-https"
      compress               = true
    }
  }

  dynamic "ordered_cache_behavior" {
    for_each = var.cloudfront_cache_behaviors
    iterator = behaviour
    content {
      cached_methods             = ["GET", "HEAD"]
      allowed_methods            = ["GET", "HEAD"]
      cache_policy_id            = behaviour.value.policy_id
      target_origin_id           = var.bucket_name
      path_pattern               = behaviour.value.path
      viewer_protocol_policy     = "redirect-to-https"
      compress                   = true
      response_headers_policy_id = behaviour.value.response_headers_policy_id
    }
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
  }

  enabled         = true
  is_ipv6_enabled = true

  aliases = [var.bucket_domain]

  default_cache_behavior {
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
    cache_policy_id            = var.bucket_caching_policy_id
    allowed_methods            = ["GET", "HEAD"]
    target_origin_id           = var.bucket_name
    response_headers_policy_id = var.default_response_header_policy_id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }


  viewer_certificate {
    acm_certificate_arn      = var.bucket_certificate_arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }
}

resource "aws_route53_record" "record" {
  zone_id  = var.route_53_zone_id
  name     = trimsuffix(trimsuffix(var.bucket_domain, "moringmark.grzegorzkoperwas.site"), ".")
  for_each = toset(["A", "AAAA"])
  type     = each.key
  alias {
    name                   = aws_cloudfront_distribution.distribuition.domain_name
    zone_id                = aws_cloudfront_distribution.distribuition.hosted_zone_id
    evaluate_target_health = false
  }
}
