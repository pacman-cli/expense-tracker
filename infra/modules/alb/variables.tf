variable "project_name" {}
variable "environment" {}
variable "vpc_id" {}
variable "public_subnet_ids" {
  type = list(string)
}
variable "certificate_arn" {
  type    = string
  default = ""
}
variable "health_check_path" {
  type    = string
  default = "/"
}

variable "enable_logging" {
  type    = bool
  default = false
}

variable "log_bucket_name" {
  type    = string
  default = ""
}
