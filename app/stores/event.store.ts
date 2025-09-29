import type { Events } from '~/types/global.types'

export const useEventStore = defineStore('event', () => {
  const events = ref<Events>({
    'toolbar.update-version': false,
    'toolbar.preview': false,
    'toolbar.edit': false,
    'toolbar.save': false,
  })

  function setEvent(event: keyof Events, value: boolean): void {
    events.value[event] = value
  }

  function getEvent(): keyof Events | undefined {
    return Object.keys(events.value).find(
      (key) => events.value[key as keyof Events],
    ) as keyof Events
  }

  function resetEvent(): void {
    Object.keys(events.value).forEach((key) => {
      events.value[key as keyof Events] = false
    })
  }

  return {
    events,
    setEvent,
    getEvent,
    resetEvent,
  }
})
