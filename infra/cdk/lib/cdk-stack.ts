import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //cdk-stack-s3-bucket
    const bucket = new s3.Bucket(this, 'MyBucket', {
      versioned: true,
      encryption:s3.BucketEncryption.S3_MANAGED,
      //removalPolicy: cdk.RemovalPolicy.DESTROY,
      //autoDeleteObjects: true,
    });

    //cdk-stack-sqs-queue
    const dlq = new sqs.Queue(this, 'MyDeadLetterQueue');

    const queue = new sqs.Queue(this, 'MyWorkerQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: dlq,
      },
    });

    //cdk-stack-sns-topic

    const topic = new sns.Topic(this, 'MyTopic', {
      displayName: 'System EventsTopic',
    });

    topic.addSubscription(new subs.SqsSubscription(queue));

    //Iam role
    const workerRole = new iam.Role(this, 'MyWorkerRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description:'Role for workers to access queues and buckets'
    });

    //permissions

    bucket.grantReadWrite(workerRole);
    queue.grantConsumeMessages(workerRole);
    topic.grantPublish(workerRole);



    new cdk.CfnOutput(this, 'BucketName',{value: bucket.bucketName});
    new cdk.CfnOutput(this, 'TopicArn',{value: topic.topicArn});
    new cdk.CfnOutput(this, 'QueueUrl',{value: queue.queueUrl});
  }
}
