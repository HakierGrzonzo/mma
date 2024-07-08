variable "bucket_name" {
  type = string
}

variable "bucket_domain" {
  type = string
}

variable "bucket_caching_policy_id" {
  type = string
}
variable "bucket_certificate_arn" {
  type = string
}

variable "route_53_zone_id" {
  type = string
}

variable "random_function_domain" {
  type     = string
  nullable = true
  default  = null
}

variable "cloudfront_cache_behaviors" {
  type = list(object({
    path                       = string
    policy_id                  = string
    response_headers_policy_id = string
  }))
  default = []
}

variable "default_response_header_policy_id" {
  type = string
}
