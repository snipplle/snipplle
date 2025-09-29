<template>
  <div />
</template>

<script setup lang="ts">
  import { useActiveCode } from 'sandpack-vue3'

  const emits = defineEmits(['change'])

  const { code } = useActiveCode()

  watch(code, (newCode) => {
    emits('change', newCode)
  })
</script>
