variable "project_name" {}
variable "environment" {}
variable "vpc_id" {}
variable "private_subnet_ids" {
  type = list(string)
}
variable "allowed_security_groups" {
  type        = list(string)
  description = "List of security group IDs that can access the database"
  default     = []
}
variable "db_username" {
  default = "takatrack_user"
}

variable "db_name" {
  default     = "takatrack"
  description = "Name of the database"
}
