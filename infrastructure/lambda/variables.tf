variable "lambda_source_file_path" {
  type = string
}
variable "lambda_name" {
  type = string
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}
