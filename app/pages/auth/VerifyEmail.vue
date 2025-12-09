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
            <div class="flex flex-col items-center space-y-4">
              <div class="flex flex-col items-center space-y-2">
                <UIcon name="i-hugeicons-mail-open" size="52" />
                <h1 class="font-semibold text-2xl">Email confirmation</h1>
              </div>

              <p>
                We’ve sent you a message to confirm your email address. Please
                check your inbox — it should arrive in just a moment.
              </p>

              <p>
                If you don’t see it, take a look in your spam folder or try
                sending it again.
                <ULink
                  class="text-primary font-semibold text-sm"
                  @click="resendEmail"
                >
                  Resend email.
                </ULink>
              </p>

              <UButton to="/auth/sign-in">Sign In</UButton>
            </div>

            <ColorAngleContainer />
          </UPageCard>
        </div>
      </div>

      <LineContainer />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  definePageMeta({
    path: '/auth/verify-email',
    middleware: 'logged-in',
  })

  const { query } = useRoute()
  const runtimeConfig = useRuntimeConfig()
  const { authClient } = useAuthClient()
  const toast = useToast()

  async function resendEmail(): Promise<void> {
    const { SSL_PREFIX, BASE_URL } = runtimeConfig.public

    const { error } = await authClient.sendVerificationEmail({
      email: query.email as string,
      callbackURL: `${SSL_PREFIX}${BASE_URL}/auth/sign-in`,
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
