# 🚀 AWS Serverless Event-Driven Data Pipeline

![Architecture Diagram](./screenshots/architecture.png)  
*An automated pipeline that processes files upon upload to S3, stores metadata in DynamoDB, and monitors performance with CloudWatch.*

## 🌟 Key Features
- **Event-Driven Processing**: Automatically triggers Lambda when files are uploaded to S3
- **Data Persistence**: Stores processed file metadata in DynamoDB
- **Error Handling**: CloudWatch Alarms for failure notifications
- **Cost Optimized**: 
  - S3 lifecycle rules auto-delete old files
  - DynamoDB auto-scaling adjusts capacity
- **Infrastructure as Code**: Deployed using AWS CDK (TypeScript)

## 🛠️ Tech Stack
| Service          | Use Case                          |
|------------------|-----------------------------------|
| AWS Lambda       | Serverless file processing        |
| Amazon S3        | File storage & event source       |
| DynamoDB         | Metadata storage                 |
| CloudWatch       | Logging & monitoring             |
| AWS CDK          | Infrastructure as Code (IaC)      |

## 📦 Installation

# Install dependencies
npm install

# Deploy to AWS
cdk deploy
