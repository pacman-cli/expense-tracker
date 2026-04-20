# 🏗️ TakaTrack: AWS Production Infrastructure Guide

This comprehensive guide covers the professional setup of the **TakaTrack** infrastructure on AWS. We use a "Secure-by-Design" architecture with isolated private subnets, managed databases, and enterprise-grade Kubernetes scaling.

---

## 🛠️ Phase 0: macOS Environment Setup

Ensure you have [Homebrew](https://brew.sh/) installed, then run:

### 1. Install DevOps Toolchain
```bash
brew install awscli terraform kubectl helm
```

### 2. AWS Student Account Authentication
If using a Student Account (Educate/Academy), you MUST handle **Session Tokens**:
1. Open your AWS Portal and copy the **AWS CLI Credentials**.
2. Run `aws configure` and input Key/Secret.
3. Open `~/.aws/credentials` and paste the `aws_session_token` provided by the portal.
4. Verify access: `aws sts get-caller-identity`

---

## 🏗️ Phase 1: Infrastructure as Code (Terraform)

The Terraform configuration builds a production-grade VPC, Eks Cluster, and RDS Database.

### 1. Configure Variables
Navigate to `terraform/` and create `terraform.tfvars`:
```hcl
aws_region     = "us-east-1"
project_name   = "takatrack"
db_username    = "admin"
db_password    = "your_SUPER_secure_password" # Use min 16 chars
domain_name    = "puspo.online"
subdomain_name = "takatrack.puspo.online"
```

### 2. Deployment
```bash
terraform init
terraform plan
terraform apply --auto-approve
```

### 3. Capture Outputs
After successful application, note the following from the console:
- `eks_cluster_name`
- `rds_endpoint`
- `acm_certificate_arn`

---

## ☸️ Phase 2: Kubernetes Orchestration

### 1. Connect to Cluster
```bash
aws eks update-kubeconfig --name takatrack-production --region us-east-1
```

### 2. Database Integration
Update `kubernetes/secrets.yaml` with your RDS endpoint and credentials:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: takatrack-secrets
stringData:
  SPRING_DATASOURCE_URL: "jdbc:postgresql://<RDS_ENDPOINT>:5432/takatrack"
  SPRING_DATASOURCE_USERNAME: "admin"
  SPRING_DATASOURCE_PASSWORD: "<DB_PASSWORD>"
```

### 3. Ingress & SSL Setup
Edit `kubernetes/ingress.yaml` and replace `<ACM_CERTIFICATE_ARN>` with the ARN from Terraform outputs.

### 4. Deploy Manifests
```bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/backend.yaml
kubectl apply -f kubernetes/frontend.yaml
kubectl apply -f kubernetes/ingress.yaml
kubectl apply -f kubernetes/hpa.yaml
```

---

## 🌐 Phase 3: Networking & DNS

### 1. Retrieve ALB DNS
Wait ~5 minutes for the AWS Application Load Balancer to provision:
```bash
kubectl get ingress -n takatrack
```
Copy the **ADDRESS** (e.g., `k8s-takatrac-xxxxx.us-east-1.elb.amazonaws.com`).

### 2. Configure Namecheap
1. Log in to Namecheap -> Domain List -> **Manage**.
2. **Advanced DNS** -> Add New Record.
3. Select **CNAME Record**:
   - Host: `takatrack`
   - Value: `<ALB_DNS_NAME>`
4. Save All Changes.

---

## 📊 Phase 4: Monitoring & Maintenance

### 1. Install Prometheus & Grafana
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

### 2. Apply Custom Dashboards & Alerts
The repository includes pre-configured monitoring assets:
- **Prometheus Alerts**: `kubectl apply -f monitoring/prometheus-alerts.yaml`
- **Grafana Dashboard**: Import the `monitoring/grafana-dashboard.json` file into your Grafana instance to visualize TakaTrack-specific metrics (RPS, Error Rates, HPA Status).

---

## 🔒 Security Hardening

To maintain a secure environment:
1. **Rotate Secrets**: Regularly update `SPRING_DATASOURCE_PASSWORD` and other secrets.
2. **Private Subnets**: Ensure EKS nodes and RDS remain in private subnets with no direct internet access.
3. **IAM Least Privilege**: Use IAM Roles for Service Accounts (IRSA) for pod-level AWS permissions.

---

## 💡 Troubleshooting & Tips

- **Student Credits ($113)**: EKS costs ~$2.40/day. Run `terraform destroy` when you are not actively developing or presenting to save funds.
- **Pod Logs**: `kubectl logs -l app=backend -n takatrack`
- **DB Connection**: Ensure EKS Security Groups allow outbound 5432 to the RDS Security Group (Terraform handles this by default).

---
*Created by Antigravity AI for TakaTrack Production Excellence.*
