<template>
  <ClientOnly>
    <div class="h-full relative">
      <NuxtCodeMirror
        v-model="code"
        :class="[type]"
        :style="style"
        :auto-focus="!isPreview"
        :editable="!isPreview"
        :read-only="isPreview"
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
      if (!newContent) {
        return
      }

      code.value = newContent
    },
    { immediate: true },
  )

  watch(
    () => props.isPreview,
    (newIsPreview) => {
      type.value = newIsPreview ? 'preview' : 'editor'

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
  .preview .cm-scroller {
    overflow: hidden;
  }

  .preview .cm-editor,
  .preview .cm-gutter {
    background-color: #1f1f27;
  }

  .preview .cm-activeLineGutter {
    display: none;
  }

  .preview .cm-activeLine {
    background-color: transparent;
  }

  .preview .cm-gutters {
    display: none;
  }

  .preview .cm-editor {
    user-select: none;
    pointer-events: none;
  }

  .editor .cm-editor {
    border: 1px solid #24273a;
  }

  .editor .cm-editor,
  .editor .cm-gutter {
    background-color: #181923;
    padding: 4px;
    height: 100%;
  }

  .editor .cm-activeLineGutter {
    background-color: transparent !important;
  }

  .editor .cm-activeLine {
    border-radius: 4px !important;
  }

  .editor .cm-editor,
  .editor .cm-scroller {
    border-radius: 8px;
  }

  .editor.cm-lineNumbers {
    font-size: 12px !important;
  }
</style>
