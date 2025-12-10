<template>
  <ClientOnly>
    <div class="h-full relative">
      <Codemirror
        v-model="code"
        :class="[type]"
        :style="style"
        :autofocus="false"
        :disabled="true"
        :extensions="extensionList"
        :indent-with-tab="true"
      />

      <UButton
        v-if="hasCopy"
        icon="i-hugeicons-copy-01"
        color="neutral"
        variant="subtle"
        size="sm"
        class="absolute top-2 right-2"
        @click="copyCode"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { Codemirror } from 'vue-codemirror'
  import { catppuccinMocha } from '@catppuccin/codemirror'

  const props = withDefaults(
    defineProps<{
      view?: string
      content: string
      styles?: Record<string, string>
      extensions: any[]
      hasCopy?: boolean
    }>(),
    {
      view: 'card-preview',
      hasCopy: false,
      styles: undefined,
    },
  )

  const { copy } = useClipboard()
  const toast = useToast()

  let extensionList = [catppuccinMocha]
  const code = ref()
  const type = ref()
  const style = ref()

  watch(
    () => props.extensions,
    (newExtensions) => {
      extensionList = [...extensionList, ...newExtensions]
    },
    { immediate: true },
  )

  watch(
    () => props.content,
    (newContent) => {
      code.value = newContent
    },
    { immediate: true },
  )

  watch(
    () => props.view,
    (newView) => {
      type.value = newView

      if (props.styles) {
        style.value = props.styles
      } else {
        style.value =
          newView === 'card-preview'
            ? {
                maxHeight: '160px',
                fontSize: '8px',
                overflow: 'hidden',
                borderRadius: '10px',
              }
            : {
                height: '100%',
              }
      }
    },
    { immediate: true },
  )

  function copyCode(): void {
    copy(props.content)

    toast.add({
      title: 'Success',
      description: 'Snippet code copied to clipboard',
      color: 'success',
      icon: 'i-hugeicons-checkmark-circle-01',
      duration: 1500,
    })
  }
</script>

<style>
  .card-preview .cm-editor,
  .card-preview .cm-gutter {
    background-color: var(--color-neutral-800);
    min-height: 160px;
  }

  .public-view .cm-editor,
  .public-view .cm-gutter {
    background-color: var(--ui-bg-light-dark);
    padding: 4px;
    height: 100%;
  }

  .card-preview .cm-activeLine,
  .public-view .cm-activeLine {
    background-color: transparent;
  }

  .card-preview .cm-gutters {
    display: none;
  }

  .card-preview .cm-editor {
    user-select: none;
    pointer-events: none;
    border-radius: 10px;
  }

  .card-preview .cm-editor,
  .card-preview .cm-gutter {
    padding: 4px;
  }

  .public-view .cm-activeLineGutter {
    background-color: transparent !important;
  }

  .public-view.cm-lineNumbers {
    font-size: 12px !important;
  }
</style>
