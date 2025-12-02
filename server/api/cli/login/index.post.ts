export default defineEventHandler(async (event) => {
  const { token } = await readBody(event)

  if (!token) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: 'Missing token',
    }
  }

  const data = await auth.api.verifyApiKey({
    body: {
      key: token,
    },
  })

  if (!data.valid || data.error) {
    return {
      error: true,
      statusCode: 401,
      statusMessage: 'Unauthorized',
    }
  }

  return {
    valid: true,
    userId: data.key?.userId,
  }
})
