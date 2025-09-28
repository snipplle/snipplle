<template>
  <ClientOnly>
    <div class="h-full">
      <SandpackProvider
        :theme="{
          colors: {
            surface1: '#1f1f27',
          },
        }"
        :options="{
          autorun: false,
          classes: {
            'sp-preview-container': '!bg-neutral-800',
          },
        }"
        template="vanilla-ts"
        :files="{
          'index.html': html,
          'index.ts': code,
        }"
        class="!rounded-md !p-2 !h-full"
      >
        <SandpackLayout
          class="group min-h-24 h-full text-xs !border-none !rounded-md"
        >
          <div class="flex flex-col">
            <SandpackCodeEditor
              :code="code"
              :show-tabs="false"
              class="rounded-l-md h-full"
            />
            <USeparator
              orientation="horizontal"
              :ui="{
                border: 'border-zinc-800',
              }"
            />
            <SandpackConsole class="!h-40" />
          </div>
          <SandpackPreview :show-open-in-code-sandbox="false" class="!h-full" />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackConsole,
  } from 'sandpack-vue3'

  definePageMeta({
    layout: 'workspace',
  })

  const html =
    '<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<style>\n\t\t\thtml, body { background: #1e1e1e !important; }\n\t\t</style>\n\t</head>\n\t<body>\n\t\t<div id="root"></div>\n\t</body>\n</html>'
  const code =
    'const users: { id: number; name: string }[] = [\n  { id: 1, name: "Alice" },\n  { id: 2, name: "Bob" },\n  { id: 3, name: "Charlie" },\n]\n\nfunction findUser(id: number) {\n  return users.find(u => u.id === id) ?? { id, name: "Unknown" }\n}\n\nconsole.log(findUser(2))'
</script>
