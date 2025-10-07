<template>
  <ClientOnly>
    <div class="h-full relative">
      <NuxtCodeMirror
        v-model="code"
        :class="[type]"
        :style="style"
        :auto-focus="false"
        :editable="false"
        :read-only="true"
        :extensions="extensionList"
        :basic-setup="true"
        :indent-with-tab="true"
      />

      <UButton
        v-if="hasCopy"
        icon="i-hugeicons-copy-01"
        color="neutral"
        variant="link"
        size="sm"
        class="absolute top-2 right-2"
        @click="copyCode"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { catppuccinMocha } from '@catppuccin/codemirror'

  const props = withDefaults(
    defineProps<{
      isPreview?: boolean
      content: string
      styles?: Record<string, string>
      extensions: any[]
      hasCopy?: boolean
    }>(),
    {
      isPreview: false,
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
    () => props.isPreview,
    (newIsPreview) => {
      type.value = newIsPreview ? 'preview' : 'editor-style'

      if (props.styles) {
        style.value = props.styles
      } else {
        style.value = newIsPreview
          ? {
              maxHeight: '160px',
              fontSize: '8px',
              overflow: 'hidden',
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
  .editor-style .cm-scroller {
    overflow: hidden;
  }

  .preview .cm-editor,
  .preview .cm-gutter {
    background-color: #1f1f27;
  }

  .editor-style .cm-activeLineGutter {
    display: none;
  }

  .editor-style .cm-activeLine,
  .preview .cm-activeLine {
    background-color: transparent;
  }

  .editor-style .cm-gutters,
  .preview .cm-gutters {
    display: none;
  }

  .editor-style .cm-editor {
    user-select: none;
    pointer-events: none;
  }

  .editor-style .cm-editor,
  .editor-style .cm-gutter {
    background-color: #181923;
    padding: 4px;
    height: 100%;
  }

  .editor-style .cm-activeLineGutter {
    background-color: transparent !important;
  }

  .editor-style .cm-activeLine {
    border-radius: 4px !important;
  }

  .editor-style .cm-editor,
  .editor-style .cm-scroller {
    border-radius: 8px;
  }

  .editor-style.cm-lineNumbers {
    font-size: 12px !important;
  }
</style>
