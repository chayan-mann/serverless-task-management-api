import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TASKS_TABLE } from '../db';

function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// PUT /tasks/{id} — updates whichever of title/completed are present in
// the body, leaving the rest untouched.
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) {
    return jsonResponse(400, { error: 'id path parameter is required' });
  }

  let parsedBody: { title?: unknown; completed?: unknown };
  try {
    parsedBody = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'body must be valid JSON' });
  }

  const { title, completed } = parsedBody;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return jsonResponse(400, { error: 'title must be a non-empty string' });
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return jsonResponse(400, { error: 'completed must be a boolean' });
  }
  if (title === undefined && completed === undefined) {
    return jsonResponse(400, { error: 'at least one of title or completed must be provided' });
  }

  const updates: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};

  if (title !== undefined) {
    updates.push('#title = :title');
    names['#title'] = 'title';
    values[':title'] = title;
  }
  if (completed !== undefined) {
    updates.push('#completed = :completed');
    names['#completed'] = 'completed';
    values[':completed'] = completed;
  }

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: TASKS_TABLE,
        Key: { id },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ConditionExpression: 'attribute_exists(id)',
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      })
    );
    return jsonResponse(200, result.Attributes);
  } catch (err) {
    if (err instanceof Error && err.name === 'ConditionalCheckFailedException') {
      return jsonResponse(404, { error: `task ${id} not found` });
    }
    throw err;
  }
};
