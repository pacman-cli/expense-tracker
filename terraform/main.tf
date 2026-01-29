module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

module "acm" {
  source = "./modules/acm"

  domain_name    = var.domain_name
  subdomain_name = var.subdomain_name
  project_name   = var.project_name
  environment    = var.environment
}

module "eks" {
  source = "./modules/eks"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnets
}

module "rds" {
  source = "./modules/rds"

  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnets
  db_username    = var.db_username
  db_password    = var.db_password
  allowed_sg_ids = [module.eks.node_security_group_id]
}
