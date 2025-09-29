import type { UseEvent, Events } from '~/types/global.types'

export function useEvent(): UseEvent {
  const eventStore = useEventStore()

  const callEvent = (event: keyof Events): void => {
    eventStore.setEvent(event, true)
  }

  const subscribeEvent = computed(() => {
    const hasEvent = eventStore.getEvent()

    return hasEvent
  })

  const unsubscribeEvent = (): void => {
    eventStore.resetEvent()
  }

  return {
    callEvent,
    subscribeEvent,
    unsubscribeEvent,
  }
}
