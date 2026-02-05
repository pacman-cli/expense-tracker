#!/bin/bash
set -e

PROJECT="takatrack"
REGION="us-east-1"
BUCKET_NAME="${PROJECT}-terraform-state-$(date +%s)"
TABLE_NAME="${PROJECT}-terraform-lock"

echo "Creating S3 Bucket: $BUCKET_NAME..."
aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"

echo "Enabling Versioning..."
aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled

echo "Creating DynamoDB Table: $TABLE_NAME..."
aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region "$REGION"

echo "State setup complete."
echo "Bucket: $BUCKET_NAME"
echo "Table: $TABLE_NAME"

# Write backend config to a file for reference
cat <<EOF > backend-config.txt
bucket = "$BUCKET_NAME"
dynamodb_table = "$TABLE_NAME"
region = "$REGION"
EOF
