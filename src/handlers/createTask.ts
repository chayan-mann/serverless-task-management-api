import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { Task, tasks } from '../store';

function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// No Express, no serverless-http — this handler receives the raw
// APIGatewayProxyEvent and must return the raw {statusCode, headers, body}
// shape itself. Doing it by hand once makes clear exactly what
// serverless-http was doing for us before:
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let parsedBody: { title?: unknown };
  try {
    parsedBody = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'body must be valid JSON' });
  }

  const { title } = parsedBody;
  if (typeof title !== 'string' || title.trim().length === 0) {
    return jsonResponse(400, { error: 'title is required and must be a non-empty string' });
  }

  const task: Task = { id: randomUUID(), title, completed: false };
  tasks.push(task);

  return jsonResponse(201, task);
};
