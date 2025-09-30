import mitt, { type Emitter } from 'mitt'

import type { ToolbarEvent } from '~/types/event.types'

const emitter = mitt<Record<ToolbarEvent, unknown>>()

export function useEmitter(): Emitter<Record<ToolbarEvent, unknown>> {
  return emitter
}
