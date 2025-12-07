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
              <template #leading>
                <div class="flex items-center justify-center">
                  <SLogo class="w-10" />
                  <h1 class="text-xl font-semibold text-primary">Snipplle</h1>
                </div>
              </template>

              <template #description>
                Already have an account?
                <ULink to="/auth/sign-in" class="text-primary font-medium">
                  Sign in
                </ULink>
              </template>

              <template #footer>
                <div class="flex flex-col items-center text-xs space-y-4">
                  <p class="w-80 text-center">
                    By proceeding you acknowledge that you have read, understood
                    and agree to our
                    <ULink to="https://snipplle.com/privacy" external>
                      Privacy Policy
                    </ULink>
                    and
                    <ULink to="https://snipplle.com/terms" external>
                      Terms and Conditions.
                    </ULink>
                  </p>

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
    path: '/auth/sign-up',
    middleware: 'logged-in',
  })

  type size = 'lg' | 'xs' | 'sm' | 'md' | 'xl' | undefined

  const { authClient } = useAuthClient()
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
        await authClient.signIn.social({
          provider: 'google',
          callbackURL: '/auth/confirm',
        })
      },
    },
    {
      label: 'GitHub',
      icon: 'i-simple-icons-github',
      size: 'lg' as size,
      onClick: async (): Promise<void> => {
        await authClient.signIn.social({
          provider: 'github',
          callbackURL: '/auth/confirm',
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
    const { error } = await authClient.signUp.email({
      email: payload.data.email,
      password: payload.data.password,
      name: payload.data.name,
      onboardingCompleted: false,
      callbackURL: '/auth/confirm',
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
