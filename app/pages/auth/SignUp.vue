<template>
  <ClientOnly>
    <div
      class="relative grid min-h-screen grid-cols-[1fr_1px_auto_1px_1fr] grid-rows-[1fr_1px_auto_1px_1fr] [--pattern-fg:var(--color-gray-950)]/5 dark:[--pattern-fg:var(--color-white)]/10"
    >
      <div class="col-start-3 row-start-3 flex flex-col">
        <div
          class="h-full flex flex-col items-center justify-center gap-4 p-2 z-50"
        >
          <UPageCard class="w-full min-w-md max-w-md rounded-lg">
            <UAuthForm
              :schema="schema"
              title="Create an account"
              icon="i-hugeicons-note"
              :fields="fields"
              :providers="providers"
              :submit="{
                label: 'Create account',
                size: 'lg',
              }"
              :ui="{
                providers: 'flex space-y-0 space-x-2',
              }"
              @submit="onSubmit"
            >
              <template #description>
                Already have an account?
                <ULink to="/auth/signin" class="text-primary font-medium"
                  >Sign in</ULink
                >
              </template>

              <template #footer>
                <div class="flex flex-col items-center text-xs space-y-4">
                  <p class="w-80 text-center">
                    By proceeding you acknowledge that you have read, understood
                    and agree to our
                    <ULink to="https://loglybase.com/privacy" external
                      >Privacy Policy</ULink
                    >
                    and
                    <ULink to="https://loglybase.com/terms" external
                      >Terms and Conditions</ULink
                    >.
                  </p>

                  <div class="flex space-x-6">
                    <p>© 2025 Snipplle</p>
                    <ULink to="https://loglybase.com/privacy" external
                      >Privacy Policy</ULink
                    >
                    <ULink to="https://loglybase.com/terms" external
                      >Terms of Use</ULink
                    >
                  </div>
                </div>
              </template>
            </UAuthForm>

            <ColorAngleContainer />
          </UPageCard>
        </div>
      </div>

      <LineContainer />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  definePageMeta({
    middleware: 'logged-in',
  })

  type size = 'lg' | 'xs' | 'sm' | 'md' | 'xl' | undefined

  const supabase = useSupabaseClient()
  const toast = useToast()

  const fields = [
    {
      name: 'name',
      type: 'text' as const,
      label: 'Name',
      placeholder: 'Enter your username',
      variant: 'subtle',
      size: 'lg' as size,
      required: true,
    },
    {
      name: 'email',
      type: 'text' as const,
      label: 'Email',
      placeholder: 'Enter your email',
      variant: 'subtle',
      size: 'lg' as size,
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password' as const,
      placeholder: 'Enter your password',
      variant: 'subtle',
      size: 'lg' as size,
      required: true,
    },
  ]

  const providers = [
    {
      label: 'Google',
      icon: 'i-simple-icons-google',
      size: 'lg' as size,
      onClick: async (): Promise<void> => {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'http://localhost:3000/auth/callback',
          },
        })
      },
    },
    {
      label: 'GitHub',
      icon: 'i-simple-icons-github',
      size: 'lg' as size,
      onClick: async (): Promise<void> => {
        await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: 'http://localhost:3000/auth/callback',
          },
        })
      },
    },
  ]

  const schema = z.object({
    name: z.string('Name is required'),
    email: z.email('Email is not valid'),
    password: z.string().min(8, 'Must be at least 8 characters'),
  })

  type Schema = z.output<typeof schema>

  async function onSubmit(payload: FormSubmitEvent<Schema>): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email: payload.data.email,
      password: payload.data.password,
      options: {
        data: {
          display_name: payload.data.name,
          onboarding_completed: false,
        },
      },
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

    await navigateTo('/auth/confirm')
  }
</script>
