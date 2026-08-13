console.log('[probe] api/index.ts module scope begin');
import serverless from 'serverless-http';
import app from '../src/backend/server.js';
console.log('[probe] api/index.ts module scope end, app typeof =', typeof app);

const handler = serverless(app as any);
console.log('[probe] handler created');

export default async function handlerWrapper(req: any, res: any) {
  console.log('[probe] handlerWrapper invoked', req.method, req.path);
  const r = await handler(req, res);
  console.log('[probe] handler resolved');
  return r;
}
