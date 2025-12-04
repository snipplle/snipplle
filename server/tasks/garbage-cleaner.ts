import { SnippetService } from '../services/snippet.service'

export default defineTask({
  meta: {
    name: 'garbage-cleaner',
  },
  async run() {
    const snippetService = new SnippetService()

    const { success } = await snippetService.cleanGarbage()

    if (!success) {
      console.error('Garbage cleaner failed')
    }

    return {
      result: true,
    }
  },
})
