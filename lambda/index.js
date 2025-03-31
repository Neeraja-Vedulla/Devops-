const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const record = event.Records[0].s3;
    const bucket = record.bucket.name;
    const key = decodeURIComponent(record.object.key.replace(/\+/g, ' '));

    console.log(JSON.stringify({
      level: "INFO",
      message: "Processing new file",
      bucket: bucket,
      key: key,
      timestamp: new Date().toISOString()
    }));

    // Validate file (example: check if empty)
    const s3 = new AWS.S3();
    const head = await s3.headObject({ Bucket: bucket, Key: key }).promise();
    
    if (head.ContentLength === 0) {
      throw new Error("Empty file detected");
    }

    // Process and store in DynamoDB
    await dynamodb.put({
      TableName: process.env.TABLE_NAME,
      Item: {
        id: key,
        bucket: bucket,
        size: head.ContentLength,
        processedAt: new Date().toISOString(),
        status: "SUCCESS"
      }
    }).promise();

    return { status: "success" };

  } catch (error) {
    console.error(JSON.stringify({
      level: "ERROR",
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }));

    // Optional: Send to error tracking (e.g., SNS)
    throw error; // Ensures Lambda retries or goes to DLQ
  }
};