#!/bin/bash
set -e

# Account ID and Region
ACCOUNT_ID="135247151840"
REGION="us-east-1"
ECR_URL="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URL

echo "🐳 Building Backend..."
cd backend
# Build directly with Maven using Buildpacks (no Dockerfile needed if you use this, but better to use Dockerfile if present)
# Assuming standard Docker file usage:
docker build --platform linux/amd64 -t takatrack-backend .
docker tag takatrack-backend:latest $ECR_URL/takatrack-backend:latest
docker push $ECR_URL/takatrack-backend:latest
cd ..

echo "🐳 Building Frontend..."
cd frontend
docker build --platform linux/amd64 -t takatrack-frontend .
docker tag takatrack-frontend:latest $ECR_URL/takatrack-frontend:latest
docker push $ECR_URL/takatrack-frontend:latest
cd ..

echo "✅ Build & Push Complete!"
