variable "domain_name" {}
variable "subdomain_name" {}
variable "project_name" {}
variable "environment" {}

resource "aws_acm_certificate" "cert" {
  domain_name       = var.subdomain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-cert"
  }
}

output "certificate_arn" {
  value = aws_acm_certificate.cert.arn
}
