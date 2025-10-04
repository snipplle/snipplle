<template>
  <div></div>
</template>

<script setup lang="ts">
  import { useSandpackClient, useActiveCode } from 'sandpack-vue3'

  const props = defineProps<{
    enableAutoRun: boolean
  }>()

  const emits = defineEmits(['change'])

  const { sandpack } = useSandpackClient()
  const { code } = useActiveCode()

  watch(code, (newCode) => {
    emits('change', newCode)
  })

  watch(
    () => props.enableAutoRun,
    (newEnableAutoRun) => {
      sandpack.autorun = newEnableAutoRun
      sandpack.autoReload = !newEnableAutoRun
    },
    { immediate: true },
  )
</script>
