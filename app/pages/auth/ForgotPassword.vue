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
              title="Forgot Password"
              :fields="fields"
              :submit="{
                label: 'Send Reset Link',
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
                Are you remember your password?
                <ULink to="/auth/sign-in" class="text-primary font-medium">
                  Sign in
                </ULink>
              </template>

              <template #footer>
                <div class="flex flex-col items-center text-xs space-y-4">
                  <div class="flex space-x-6">
                    <p>© {{ new Date().getFullYear() }} Snipplle</p>
                    <ULink to="https://snipplle.com/privacy-policy" external>
                      Privacy Policy
                    </ULink>
                    <ULink to="https://snipplle.com/terms-of-use" external>
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
    path: '/auth/forgot-password',
  })

  type size = 'lg' | 'xs' | 'sm' | 'md' | 'xl' | undefined

  const runtimeConfig = useRuntimeConfig()
  const { authClient } = useAuthClient()
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
  ]

  const schema = z.object({
    email: z.email('Email is not valid'),
  })

  type Schema = z.output<typeof schema>

  async function onSubmit(event: FormSubmitEvent<Schema>): Promise<void> {
    const { SSL_PREFIX, BASE_URL } = runtimeConfig.public

    const { error } = await authClient.requestPasswordReset({
      email: event.data.email,
      redirectTo: `${SSL_PREFIX}://${BASE_URL}/auth/reset-password`,
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

    await navigateTo('/auth/sign-in')
  }
</script>
