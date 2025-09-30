import type { UseToolbarEvent } from '~/types/global.types'
import type { ToolbarEvent } from '~/types/event.types'

export function useToolbarEvent(): UseToolbarEvent {
  const emitter = useEmitter()

  const call = (event: ToolbarEvent): void => {
    emitter.emit(event)
  }

  const listen = (
    event: ToolbarEvent,
    callback: (...args: any[]) => void,
  ): void => {
    emitter.on(event, callback)

    onBeforeUnmount(() => {
      emitter.off(event, callback)
    })
  }

  return {
    call,
    listen,
  }
}
