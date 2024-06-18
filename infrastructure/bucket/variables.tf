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
