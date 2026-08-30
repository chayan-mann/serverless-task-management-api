import { APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TASKS_TABLE } from '../db';

// GET /tasks takes no path params or body, so unlike createTask it
// doesn't even need to read the incoming `event` — it just returns
// whatever is currently in the table.
export const handler = async (): Promise<APIGatewayProxyResult> => {
  const result = await ddb.send(new ScanCommand({ TableName: TASKS_TABLE }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.Items ?? []),
  };
};
