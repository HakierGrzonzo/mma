output "bucket" {
  value = aws_s3_bucket.bucket
}
output "distribution" {
  value = aws_cloudfront_distribution.distribuition
}
