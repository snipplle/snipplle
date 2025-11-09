export default defineTask({
  meta: {
    name: 'garbage-cleaner',
  },
  async run() {
    const config = useRuntimeConfig()

    const response = await fetch(config.GARBAGE_CLEANER_FUNCTION, {
      method: 'POST',
    })

    const { success } = await response.json()

    if (!success) {
      console.error('Garbage cleaner failed')
    }

    return {
      result: true,
    }
  },
})
