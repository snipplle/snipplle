import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

const config = useRuntimeConfig()

const queryClient = postgres(config.DATABASE_URL || '', {
  prepare: false,
})

export const database = drizzle(queryClient, { schema })
