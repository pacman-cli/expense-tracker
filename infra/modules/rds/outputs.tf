output "db_endpoint" {
  value = aws_db_instance.main.address
}

output "db_name" {
  value = aws_db_instance.main.db_name
}

output "db_port" {
  value = aws_db_instance.main.port
}

output "rds_sg_id" {
  value = aws_security_group.rds.id
}

output "db_password_arn" {
  value = aws_ssm_parameter.db_password.arn
}
