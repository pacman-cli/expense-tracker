#!/bin/bash
# AWS Inventory Scan Script
# Scans all regions for active resources

echo "🔎 Starting AWS Global Inventory Scan..."
echo "Date: $(date)"

# Get all enabled regions
REGIONS=$(aws ec2 describe-regions --query "Regions[].RegionName" --output text)

echo "Detected Regions: $REGIONS"
echo "----------------------------------------"

for REGION in $REGIONS; do
    echo "🌍 Scanning Region: $REGION"

    # EC2 Instances
    INSTANCES=$(aws ec2 describe-instances --region $REGION --query "Reservations[].Instances[].InstanceId" --output text)
    if [ -n "$INSTANCES" ]; then
        echo "   🚨 FOUND EC2 Instances: $INSTANCES"
    fi

    # VPCs (Non-default check needed, defaulting to listing all for now and filtering later)
    # Showing only VPCs with Tags (often user created) or just listing counts
    VPCS=$(aws ec2 describe-vpcs --region $REGION --query "Vpcs[].VpcId" --output text)
    if [ -n "$VPCS" ]; then
        echo "   ℹ️  VPCs: $VPCS"
    fi

    # EKS Clusters
    CLUSTERS=$(aws eks list-clusters --region $REGION --query "clusters[]" --output text)
    if [ -n "$CLUSTERS" ]; then
        echo "   🚨 FOUND EKS Clusters: $CLUSTERS"
    fi

    # RDS Instances
    DBS=$(aws rds describe-db-instances --region $REGION --query "DBInstances[].DBInstanceIdentifier" --output text)
    if [ -n "$DBS" ]; then
         echo "   🚨 FOUND RDS Instances: $DBS"
    fi

    # Load Balancers (v2)
    LBS=$(aws elbv2 describe-load-balancers --region $REGION --query "LoadBalancers[].LoadBalancerArn" --output text)
    if [ -n "$LBS" ]; then
        echo "   🚨 FOUND Load Balancers: $LBS"
    fi

    # NAT Gateways
    NATS=$(aws ec2 describe-nat-gateways --region $REGION --filter "Name=state,Values=available" --query "NatGateways[].NatGatewayId" --output text)
    if [ -n "$NATS" ]; then
        echo "   🚨 FOUND NAT Gateways: $NATS"
    fi

    # Elastic IPs
    EIPS=$(aws ec2 describe-addresses --region $REGION --query "Addresses[].PublicIp" --output text)
    if [ -n "$EIPS" ]; then
        echo "   🚨 FOUND Elastic IPs: $EIPS"
    fi

done

echo "----------------------------------------"
echo "🌐 Scanning Global Resources..."

# S3 Buckets
echo "📦 Checking S3 Buckets..."
BUCKETS=$(aws s3 ls --query "Buckets[].Name" --output text)
if [ -n "$BUCKETS" ]; then
    echo "   🚨 FOUND S3 Buckets: $BUCKETS"
    for b in $BUCKETS; do
        echo "      - $b"
    done
fi

# IAM Users
echo "👤 Checking IAM Users..."
USERS=$(aws iam list-users --query "Users[].UserName" --output text)
echo "   ℹ️  IAM Users: $USERS"

# IAM Roles (filtered for common custom prefixes or just listing count)
echo "🎭 Checking IAM Roles (Count)..."
ROLE_COUNT=$(aws iam list-roles --query "Roles[] | length(@)" --output text)
echo "   ℹ️  Total Roles: $ROLE_COUNT"

echo "✅ Scan Complete."
