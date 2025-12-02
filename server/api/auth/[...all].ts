import { auth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  return auth.handler(toWebRequest(event))
})
