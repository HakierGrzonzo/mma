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

resource "aws_s3_bucket_cors_configuration" "mma-images" {
  bucket = aws_s3_bucket.mma-images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*.grzegorzkoperwas.site"]
  }
}

resource "aws_s3_bucket" "mma-web" {
  bucket = "mma-web"
  tags = {
    Name        = "mma-web"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_ownership_controls" "mma-web" {
  bucket = aws_s3_bucket.mma-web.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "mma-web" {
  bucket = aws_s3_bucket.mma-web.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "mma-web" {
  depends_on = [
    aws_s3_bucket_ownership_controls.mma-web,
    aws_s3_bucket_public_access_block.mma-web,
  ]

  bucket = aws_s3_bucket.mma-web.id
  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "mma-web" {
  bucket = aws_s3_bucket.mma-web.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}
