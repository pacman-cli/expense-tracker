variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "takatrack"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "puspo.online"
}

variable "subdomain_name" {
  description = "Subdomain name"
  type        = string
  default     = "takatrack.puspo.online"
}

variable "db_username" {
  description = "RDS database admin username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "RDS database admin password"
  type        = string
  sensitive   = true
}
