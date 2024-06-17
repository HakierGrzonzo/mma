variable "bucket_name" {
  type = string
}

variable "bucket_domain" {
  type = string
}

variable "applicationARN" {
  type = string
}

variable "bucket_caching_policy_id" {
  type = string
}
variable "bucket_certificate_arn" {
  type    = string
  default = "arn:aws:acm:us-east-1:767397670578:certificate/e9263c10-140d-4b45-a27d-2dd10269d145"
}

variable "route_53_zone_id" {
  type = string
}

variable "random_function_domain" {
  type     = string
  nullable = true
  default  = null
}
