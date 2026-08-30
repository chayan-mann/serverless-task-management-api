import { APIGatewayProxyResult } from 'aws-lambda';
import { tasks } from '../store';

// GET /tasks takes no path params or body, so unlike createTask it
// doesn't even need to read the incoming `event` — it just returns
// whatever is currently in the store.
export const handler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tasks),
  };
};
