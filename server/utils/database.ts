import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import * as schema from '../db/schema'

export * from 'drizzle-orm'

const config = useRuntimeConfig()

const queryClient = postgres(config.DATABASE_URL || '', {
  prepare: false,
})

export function useDrizzle(): PostgresJsDatabase<typeof schema> & {
  $client: postgres.Sql<Record<string, unknown>>
} {
  return drizzle(queryClient, { schema })
}

export const tables = schema
