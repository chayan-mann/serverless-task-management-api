import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TASKS_TABLE } from '../db';

function jsonResponse(statusCode: number, body?: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? '' : JSON.stringify(body),
  };
}

// DELETE /tasks/{id} — ConditionExpression makes DynamoDB reject the
// delete (instead of silently no-op'ing) when the id doesn't exist, so
// we can tell the caller 404 rather than a false-positive success.
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) {
    return jsonResponse(400, { error: 'id path parameter is required' });
  }

  try {
    await ddb.send(
      new DeleteCommand({
        TableName: TASKS_TABLE,
        Key: { id },
        ConditionExpression: 'attribute_exists(id)',
      })
    );
    return jsonResponse(204);
  } catch (err) {
    if (err instanceof Error && err.name === 'ConditionalCheckFailedException') {
      return jsonResponse(404, { error: `task ${id} not found` });
    }
    throw err;
  }
};
