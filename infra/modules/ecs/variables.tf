variable "project_name" {}
variable "environment" {}
variable "vpc_id" {}
variable "private_subnet_ids" {
  type = list(string)
}
variable "alb_security_group_id" {}
variable "target_group_arn" {}
variable "execution_role_arn" {}
variable "task_role_arn" {}
variable "container_image" {}
variable "container_port" {
  default = 8080
}
variable "cpu" {
  default = 512
}
variable "memory" {
  default = 1024
}
variable "desired_count" {
  default = 1
}

# Environment variables for the container
variable "container_environment" {
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}
# Secrets for the container
variable "container_secrets" {
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}
