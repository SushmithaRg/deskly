import { defineConfig } from 'prisma/config';
import path from 'path';

export default defineConfig({
  datasourceUrl: `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`,
});
