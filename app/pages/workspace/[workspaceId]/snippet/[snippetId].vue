<template>
  <ClientOnly>
    <NuxtLayout name="workspace" :show-toolbar="true">
      <div class="h-full">
        <SandpackProvider
          :theme="{
            colors: {
              surface1: '#181923',
            },
          }"
          :options="{
            autorun: false,
            classes: {
              'sp-preview-container': '!bg-[#181923]',
            },
          }"
          template="vanilla-ts"
          :files="{
            'index.html': html,
            'index.ts': code,
          }"
          class="!rounded-md !h-full"
        >
          <SandpackLayout
            class="group min-h-24 h-full text-xs !border border-neutral-700 !rounded-md"
          >
            <div class="flex flex-col">
              <SandpackCodeEditor
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
            <SandpackPreview
              :show-open-in-code-sandbox="false"
              class="!h-full"
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </NuxtLayout>
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

  const html =
    '<!DOCTYPE html><html><head><style>html, body { background: #181923 !important; }</style></head><body><div id="root"></div></body></html>'
  const code =
    'const users: { id: number; name: string }[] = [\n  { id: 1, name: "Alice" },\n  { id: 2, name: "Bob" },\n  { id: 3, name: "Charlie" },\n]\n\nfunction findUser(id: number) {\n  return users.find(u => u.id === id) ?? { id, name: "Unknown" }\n}\n\nconsole.log(findUser(2))'
</script>
