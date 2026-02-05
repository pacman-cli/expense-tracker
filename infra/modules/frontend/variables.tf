variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment (e.g. prod, dev)"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of the ALB for backend API proxying"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for the frontend"
  type        = string
  default     = ""
}

variable "hosted_zone_name" {
  description = "Route53 Hosted Zone name"
  type        = string
  default     = ""
}
