import type { Config } from 'drizzle-kit';
export default {
  schema: 'src/db/schemas/*.schema.ts',
  out: './drizzle',
} satisfies Config;
