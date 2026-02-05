#!/bin/bash
# Force Cleanup Script
# Usage: ./force_cleanup.sh
# Warning: This script deletes ALL non-default Security Groups and specific Elastic IPs.
# Run this after configuring AWS CLI with ROOT or ADMIN credentials.

REGION="us-east-1"
EIP_TO_RELEASE="98.90.244.97"

echo "🧹 Starting Force Cleanup in $REGION..."

# 1. Release Elastic IP
echo "🌐 Checking Elastic IP: $EIP_TO_RELEASE"
ALLOC_ID=$(aws ec2 describe-addresses --region $REGION --public-ips $EIP_TO_RELEASE --query "Addresses[0].AllocationId" --output text 2>/dev/null)

if [ "$ALLOC_ID" != "None" ] && [ -n "$ALLOC_ID" ]; then
    echo "   Found Allocation ID: $ALLOC_ID. Releasing..."
    aws ec2 release-address --region $REGION --allocation-id $ALLOC_ID
    echo "   ✅ Released $EIP_TO_RELEASE"
else
    echo "   ⚠️ IP $EIP_TO_RELEASE not found or already released."
fi

# 2. Cleanup Security Groups (Iterative to handle dependencies)
echo "🛡️  Scanning for Non-Default Security Groups..."
# Get all SGs that are NOT 'default'
SGS=$(aws ec2 describe-security-groups --region $REGION --filters Name=group-name,Values='*' --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)

if [ -z "$SGS" ]; then
    echo "   ✅ No non-default security groups found."
else
    echo "   🚨 Found SGs: $SGS"
    echo "   Attempting deletion (may require multiple passes for dependencies)..."

    # Try deleting in a loop to resolve dependencies
    for i in {1..3}; do
        echo "   🔄 Pass $i..."
        for ORDERED_SG in $SGS; do
            aws ec2 delete-security-group --region $REGION --group-id $ORDERED_SG 2>/dev/null
        done
        # Refresh list
        REMAINING=$(aws ec2 describe-security-groups --region $REGION --filters Name=group-name,Values='*' --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)
        if [ -z "$REMAINING" ]; then
            echo "   ✅ All SGs deleted!"
            break
        fi
        sleep 2
    done
fi

# 3. Final Check for NAT Gateway (Just in case)
echo "🌉 Checking for leftover NAT Gateways..."
NATS=$(aws ec2 describe-nat-gateways --region $REGION --filter "Name=state,Values=available" --query "NatGateways[].NatGatewayId" --output text)
for NAT in $NATS; do
    echo "   Deleting NAT Gateway: $NAT"
    aws ec2 delete-nat-gateway --region $REGION --nat-gateway-id $NAT
done

echo "🎉 Cleanup Run Complete. Determine success by checking console."
