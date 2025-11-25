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
              title="Welcome back!"
              :fields="fields"
              :providers="providers"
              :submit="{
                label: 'Sign In',
                size: 'lg',
              }"
              :ui="{
                providers: 'flex space-y-0 space-x-2',
              }"
              @submit="onSubmit"
            >
              <template #leading>
                <div class="flex items-center justify-center">
                  <SLogo class="w-10" />
                  <h1 class="text-xl font-semibold text-primary">Snipplle</h1>
                </div>
              </template>

              <template #description>
                Don't have an account?
                <ULink to="/auth/sign-up" class="text-primary font-medium">
                  Sign up
                </ULink>
              </template>

              <template #password-hint>
                <ULink
                  to="/auth/forgot-password"
                  class="text-primary font-medium"
                  tabindex="-1"
                >
                  Forgot password?
                </ULink>
              </template>

              <template #footer>
                <div class="flex flex-col items-center text-xs space-y-4">
                  <div class="flex space-x-6">
                    <p>© {{ new Date().getFullYear() }} Snipplle</p>
                    <ULink to="https://snipplle.com/privacy" external>
                      Privacy Policy
                    </ULink>
                    <ULink to="https://snipplle.com/terms" external>
                      Terms of Use
                    </ULink>
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
    path: '/auth/sign-in',
    middleware: 'logged-in',
  })

  type size = 'lg' | 'xs' | 'sm' | 'md' | 'xl' | undefined

  const config = useRuntimeConfig()
  const supabase = useSupabaseClient()
  const toast = useToast()

  const fields = [
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
    {
      name: 'remember',
      label: 'Remember me',
      type: 'checkbox' as const,
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
            redirectTo: `${config.public.BASE_URL}/auth/confirm`,
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
            redirectTo: `${config.public.BASE_URL}/auth/confirm`,
          },
        })
      },
    },
  ]

  const schema = z.object({
    email: z.email('Email is not valid'),
    password: z.string().min(8, 'Must be at least 8 characters'),
  })

  type Schema = z.output<typeof schema>

  async function onSubmit(payload: FormSubmitEvent<Schema>): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email: payload.data.email,
      password: payload.data.password,
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
