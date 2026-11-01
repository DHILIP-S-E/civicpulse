# CivicPulse — AWS Deployment & Provisioning Guide

## 1. Prerequisites

1. **AWS CLI** (version 2.x or 1.x) installed and configured with credentials:
   ```bash
   aws sts get-caller-identity
   ```
2. **Target Region:** Recommended `ap-south-1` (Mumbai) for low latency to Madurai, or `us-east-1`.
3. **AWS SAM CLI** or standard CloudFormation for deploying templates.
4. **Python 3.11+** & **Node.js 18+**.

---

## 2. Infrastructure Deployment (CloudFormation / SAM)

The repository provides a single declarative infrastructure definition in `aws/infrastructure/template.yaml` that provisions:
- Amazon S3 Lakehouse bucket
- AWS Glue Data Catalog Database (`civicpulse_db`)
- Amazon Athena Workgroup (`civicpulse-workgroup`)
- Amazon Location Maps (`CivicPulseMaduraiMap`)
- Amazon Location Places (`CivicPulseMaduraiPlaces`)
- Amazon Location Routes (`CivicPulseMaduraiRoutes`)
- Amazon Location Geofences (`CivicPulseMaduraiGeofences`)
- Lambda Geofence event handler & EventBridge rule

### Deploying via AWS CLI:
```bash
aws cloudformation deploy \
  --template-file aws/infrastructure/template.yaml \
  --stack-name civicpulse-lakehouse-stack \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=development \
  --region ap-south-1
```

---

## 3. Data Lakehouse Table Initialization

Once the S3 bucket and Glue database are created, initialize the Apache Iceberg table:
```bash
# Set your deployed bucket in environment
export AWS_S3_BUCKET=$(aws cloudformation describe-stacks --stack-name civicpulse-lakehouse-stack --query "Stacks[0].Outputs[?OutputKey=='LakehouseBucket'].OutputValue" --output text)

# Execute the Iceberg table DDL
python scripts/create_iceberg_table.py
```

---

## 4. Amazon Location Geofences Setup

Upload the hazard perimeter polygons to your Amazon Location Geofence collection:
```bash
python scripts/initialize_geofences.py
```

---

## 5. Backend Deployment (Amazon ECS / AWS App Runner / Lambda)

To containerize and deploy the FastAPI backend:
```bash
cd backend
docker build -t civicpulse-backend .

# Authenticate with Amazon ECR and push
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <ECR_URL>
docker tag civicpulse-backend:latest <ECR_URL>/civicpulse-backend:latest
docker push <ECR_URL>/civicpulse-backend:latest
```

Configure App Runner or ECS Fargate pointing to the pushed container image with environment variables:
- `APP_MODE=live`
- `AWS_REGION=ap-south-1`
- `AWS_S3_BUCKET=<YOUR_BUCKET>`
- `AWS_ATHENA_DATABASE=civicpulse_db`
- `AWS_ATHENA_TABLE=civic_hazards_iceberg`

---

## 6. Frontend Deployment (AWS Amplify Hosting / S3 + CloudFront)

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist/` directory to AWS Amplify Hosting or an Amazon S3 static website bucket configured with Amazon CloudFront and SSL.

---

## 7. Resource Cleanup & Teardown

To prevent ongoing cloud charges after testing or evaluation:
```bash
# 1. Empty the S3 Lakehouse bucket
aws s3 rm s3://<YOUR_BUCKET> --recursive

# 2. Delete the CloudFormation stack
aws cloudformation delete-stack \
  --stack-name civicpulse-lakehouse-stack \
  --region ap-south-1
```

