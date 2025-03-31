import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';

export class ServerlessDataPipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create the S3 bucket (trigger for the pipeline)
    const dataBucket = new s3.Bucket(this, 'DataBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(7), // Auto-delete after 7 days
          prefix: 'temp/', // Optional: Only apply to files in "temp/" folder
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1), // Cleanup failed uploads
        },
      ],
    });

    // 2. Create DynamoDB table (stores processed data)
    const processedDataTable = new dynamodb.Table(this, 'ProcessedDataTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED, // Switch from PAY_PER_REQUEST to PROVISIONED
      readCapacity: 5, // Base capacity
      writeCapacity: 5, // Base capacity
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Deletes table when stack is destroyed
    });

    // Add auto-scaling for read capacity
    processedDataTable.autoScaleReadCapacity({
      minCapacity: 5,
      maxCapacity: 100,
    }).scaleOnUtilization({ targetUtilizationPercent: 70 });

    // Add auto-scaling for write capacity
    processedDataTable.autoScaleWriteCapacity({
      minCapacity: 5,
      maxCapacity: 100,
    }).scaleOnUtilization({ targetUtilizationPercent: 70 });

    const processFileLambda = new lambda.Function(this, 'ProcessFileLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'index.handler',
      environment: {
        TABLE_NAME: processedDataTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      // Remove reservedConcurrentExecutions or set it to a safe value that doesn't affect unreserved capacity
    });
    

    const lambdaErrors = processFileLambda.metricErrors({
      period: cdk.Duration.minutes(5),
      statistic: 'Sum',
    });

    new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
      metric: lambdaErrors,
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: 'Alert when Lambda fails',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // 4. Grant permissions
    processedDataTable.grantWriteData(processFileLambda);

    // Allow S3 to trigger Lambda
    dataBucket.grantRead(processFileLambda);
    processFileLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [dataBucket.bucketArn + '/*'],
      })
    );

    // Add S3 event trigger (runs Lambda when a file is uploaded)
    processFileLambda.addEventSource(
      new lambdaEventSources.S3EventSource(dataBucket, {
        events: [s3.EventType.OBJECT_CREATED], // Trigger on file upload
      })
    );

    // Output the bucket name and table name for reference
    new cdk.CfnOutput(this, 'DataBucketName', { value: dataBucket.bucketName });
    new cdk.CfnOutput(this, 'ProcessedDataTableName', { value: processedDataTable.tableName });
  }
}
