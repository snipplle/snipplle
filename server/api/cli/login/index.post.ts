import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const { token } = await readBody(event)

  const admin = createClient(
    runtimeConfig.SUPABASE_URL,
    runtimeConfig.SUPABASE_SERVICE_ROLE_KEY,
  )

  const { data, error } = await admin
    .from('api_tokens')
    .select('id, user_id')
    .eq('token', token)
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  const authToken = jwt.sign(
    {
      sub: data.user_id,
      role: 'authenticated',
      api_token_id: data.id,
    },
    runtimeConfig.SUPABASE_JWT_SECRET,
    {
      expiresIn: '30d',
    },
  )

  return {
    sessionToken: authToken,
    userId: data.user_id,
  }
})
