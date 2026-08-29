import serverlessHttp from 'serverless-http';
import app from './app';

// This file is the whole lesson: how does an HTTP request become
// a Lambda event, and how does a Lambda response become HTTP again?
//
// 1. A client sends "POST /tasks" with a JSON body.
// 2. API Gateway does NOT forward raw HTTP to Lambda. It packages the
//    request into a JSON object called an APIGatewayProxyEvent:
//      { httpMethod: 'POST', path: '/tasks', headers: {...}, body: '{"title":"..."}', ... }
//    Note "body" is a STRING here, not a parsed object.
// 3. AWS invokes this file's exported handler as handler(event, context).
// 4. serverless-http takes that event, builds a fake (but accurate)
//    Express `req`/`res` pair from it, and runs it through `app` exactly
//    like a normal Express server would — so app.ts never has to know
//    it's running inside Lambda at all.
// 5. Whatever app.ts writes via res.status(...).json(...) is captured by
//    serverless-http and converted back into the shape API Gateway expects
//    to return to the client: { statusCode, headers, body }.
// 6. API Gateway takes that object and sends it back as a real HTTP response.
export const handler = serverlessHttp(app);
