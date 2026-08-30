import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

// serverless-offline sets IS_OFFLINE so we talk to DynamoDB Local
// (started by the serverless-dynamodb plugin) instead of real AWS.
const client = new DynamoDBClient(
  process.env.IS_OFFLINE
    ? {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
      }
    : {}
);

export const ddb = DynamoDBDocumentClient.from(client);
export const TASKS_TABLE = process.env.TASKS_TABLE as string;
