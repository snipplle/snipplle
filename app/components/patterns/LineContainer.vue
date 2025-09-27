<template>
  <ClientOnly>
    <div class="relative -right-0 col-start-3 row-span-full row-start-1 w-px dashed-vertical bg-fixed"/>
    <div class="relative -left-px col-start-4 row-span-full row-start-1 w-px dashed-vertical bg-fixed"/>
    <div class="relative -bottom-px col-span-full col-start-1 row-start-2 h-px dashed-horizontal"/>
    <div class="relative -top-px col-span-full col-start-1 row-start-4 h-px dashed-horizontal"/>
  </ClientOnly>
</template>

<style>
  .dashed-vertical {
    background-image: repeating-linear-gradient(to bottom, var(--color-light-gray-800) 0 4px, transparent 2px 10px);
    width: 1px;
  }

  .dashed-horizontal {
    background-image: repeating-linear-gradient(to right, var(--color-light-gray-800) 0 4px, transparent 2px 10px);
    height: 1px;
  }
</style>