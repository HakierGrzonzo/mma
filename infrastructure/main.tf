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
