import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TASKS_TABLE } from '../db';

function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// GET /tasks/{id} — API Gateway lifts the {id} segment out of the path
// and hands it to us as event.pathParameters.id.
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) {
    return jsonResponse(400, { error: 'id path parameter is required' });
  }

  const result = await ddb.send(new GetCommand({ TableName: TASKS_TABLE, Key: { id } }));

  if (!result.Item) {
    return jsonResponse(404, { error: `task ${id} not found` });
  }

  return jsonResponse(200, result.Item);
};
