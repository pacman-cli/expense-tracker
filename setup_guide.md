## 💻 Environment Setup (macOS)

Before you begin, ensure you have [Homebrew](https://brew.sh/) installed.

### 1. Install DevOps Tools
Run the following command to install all necessary tools at once:
```bash
brew install awscli terraform kubectl helm
```

### 2. Configure AWS CLI
If you are using an **AWS Student Account (AWS Educate/Academy)**, you typically get temporary credentials.
1. Run `aws configure`.
2. Enter your `Access Key ID` and `Secret Access Key` from the portal.
3. Set default region to `us-east-1` (common for student accounts).
4. **Note:** Student accounts often require a `Session Token`. If provided, you must manually add `aws_session_token` to your `~/.aws/credentials` file.

### 3. Verify Installations
```bash
aws --version
terraform -version  # Should be >= 1.5.0
kubectl version --client
helm version
```

## 🔑 GitHub Secrets Configuration
In your GitHub repo, go to **Settings > Secrets and variables > Actions** and add:

| Secret Name | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Key |
| `AWS_SESSION_TOKEN` | (Required for Student Accounts) |
| `AWS_REGION` | e.g., `us-east-1` |
| `DB_PASSWORD` | Secure password for RDS |

> [!TIP]
> **AWS Student Account Management**: With a $113 credit, monitor your usage in the **AWS Billing Dashboard**. EKS clusters cost ~$72/month, so ensure you `terraform destroy` when not active to preserve your credits!

## Step 1: Infrastructure Deployment (Terraform)
1. Navigate to the `terraform` directory.
2. Create a `terraform.tfvars` file with your credentials:
   ```hcl
   db_username = "admin"
   db_password = "your-secure-password"
   aws_region  = "us-east-1"
   domain_name = "puspo.online"
   subdomain_name = "takatrack.puspo.online"
   ```
3. Initialize and apply:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```
4. Note the outputs (EKS Cluster Name, RDS Endpoint, ACM Certificate ARN).

## Step 2: Kubernetes Configuration
1. Update your kubeconfig:
   ```bash
   aws eks update-kubeconfig --name takatrack-eks --region us-east-1
   ```
2. Update placeholders in `kubernetes/secrets.yaml` and `kubernetes/ingress.yaml` with the values from Step 1.
3. Apply the manifests (initially for manual verification if needed, or let CI/CD handle it).

## Step 3: GitHub Actions Setup
1. Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
2. Push your code to the `main` branch to trigger the deployment.

## Step 4: Domain DNS Configuration (Namecheap)
1. Go to your Namecheap Dashboard.
2. Select your domain `puspo.online`.
3. Add a CNAME record:
   - Host: `takatrack`
   - Value: [The ALB DNS Name from AWS Console or Terraform]
4. Add ACM Validation records (CNAME) provided by AWS ACM in the console.

## Step 5: Monitoring Setup
1. Install Prometheus and Grafana using Helm:
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
   ```
2. Apply the custom alerts and dashboards from the `monitoring` directory.

## Step 6: Load Testing
1. Install JMeter locally.
2. Run the tests:
   ```bash
   jmeter -n -t tests/load/backend_api_test.jmx -l results.jtl -e -o reports/
   ```

## Troubleshooting
- **Pod Crash**: Check logs using `kubectl logs <pod-name> -n takatrack`.
- **Ingress Not Working**: Verify the ALB Controller is installed and the Ingress resource has the correct annotations.
- **RDS Not Reachable**: Ensure EKS node security groups are allowed in the RDS security group.
