<template>
  <ClientOnly>
    <div class="min-w-xl max-w-xl mx-auto space-y-10">
      <div class="space-y-6">
        <div>
          <h1 class="font-semibold">General</h1>
          <p class="text-sm text-neutral-400">
            Your basic profile information and preferences.
          </p>
        </div>

        <div class="space-y-4">
          <UFormField label="Name">
            <UInput
              variant="subtle"
              class="w-full"
              :default-value="user?.user_metadata?.display_name"
              disabled
            />
          </UFormField>

          <UFormField label="Email">
            <UInput
              variant="subtle"
              class="w-full"
              :default-value="user?.email"
              disabled
            />
          </UFormField>
        </div>
      </div>

      <USeparator />

      <div class="space-y-6">
        <div>
          <h1 class="font-semibold">Security</h1>
          <p class="text-sm text-neutral-400">
            Update your security settings, such as password.
          </p>
        </div>

        <UForm
          :state="state"
          :schema="schema"
          class="space-y-4"
          @submit="changePassword"
        >
          <UFormField label="Password" name="password" required>
            <UInput
              v-model="state.password"
              variant="subtle"
              class="w-full"
              type="password"
            />
          </UFormField>

          <UFormField label="Confirm Password" name="confirmPassword" required>
            <UInput
              v-model="state.confirmPassword"
              variant="subtle"
              class="w-full"
              type="password"
            />
          </UFormField>

          <div class="flex justify-end">
            <UButton type="submit">Change Password</UButton>
          </div>
        </UForm>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  definePageMeta({
    layout: 'setting',
  })

  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const toast = useToast()

  const state = ref({
    password: '',
    confirmPassword: '',
  })

  const schema = z
    .object({
      password: z
        .string('Password is required')
        .min(8, 'Must be at least 8 characters'),
      confirmPassword: z
        .string('Confirm Password is required')
        .min(8, 'Must be at least 8 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

  type Schema = z.output<typeof schema>

  async function changePassword(event: FormSubmitEvent<Schema>): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: event.data.confirmPassword,
    })

    if (error) {
      toast.add({
        title: 'Oops',
        description: error.message,
        color: 'error',
        icon: 'i-hugeicons-fire',
        duration: 1500,
      })

      return
    }
  }
</script>
