<template>
  <ClientOnly>
    <div class="border border-neutral-700 rounded-lg">
      <UTable
        :data="data"
        :columns="columns"
        :ui="{
          root: 'rounded-lg',
          thead: 'bg-default',
          th: 'first:rounded-tl-lg last:rounded-tr-lg',
          tbody: 'bg-neutral-800',
          td: 'first:rounded-bl-lg last:rounded-br-lg',
        }"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center space-y-2">
            <UIcon name="i-hugeicons-key-01" size="32" />

            <div class="space-y-2">
              <div>
                <h1 class="font-medium">No API Keys</h1>
                <p class="text-sm text-neutral-400">
                  You have not created any API keys.
                </p>
              </div>
            </div>
          </div>
        </template>
      </UTable>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  defineProps<{
    data: any[]
  }>()

  interface ApiKey {
    id: string
    name: string | null
    createdAt: Date
    lastRequest?: Date | null
    permissions: { [key: string]: string[] } | null
    start: string | null
    prefix: string | null
    userId: string
    refillInterval: number | null
    refillAmount: number | null
    metadata: Record<string, unknown> | null
  }

  interface TableCellProps {
    row: {
      original: ApiKey
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: TableCellProps): string => {
        return new Date(row.original.createdAt).toLocaleString()
      },
    },
    {
      accessorKey: 'lastRequest',
      header: 'Last Used',
      cell: ({ row }: TableCellProps): string => {
        return row.original.lastRequest
          ? new Date(row.original.lastRequest).toLocaleString()
          : 'Never'
      },
    },
  ]
</script>
