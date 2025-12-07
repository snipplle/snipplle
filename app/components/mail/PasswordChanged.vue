<template>
  <Html lang="en">
    <Head>
      <Font
        font-family="Inter"
        :web-font="{
          url: 'https://fonts.gstatic.com/s/inter/v19/UcCo3FwrK3iLTcvvYwYZ8UA3J58.woff2',
          format: 'woff2',
        }"
        :font-weight="500"
        font-style="normal"
      />
    </Head>

    <Tailwind>
      <div
        class="max-w-lg mx-auto bg-[#141416] rounded-2xl shadow-sm border border-neutral-800 overflow-hidden"
      >
        <div class="px-6 py-4">
          <Img
            src="https://snipplle.com/logo.png"
            alt="Snipplle"
            class="w-10"
          />
        </div>

        <div class="px-6 py-2">
          <Text
            class="text-2xl font-bold text-neutral-100 mb-4"
            style="font-family: 'Inter', sans-serif"
          >
            Password Changed
          </Text>

          <Text
            class="text-neutral-300 mb-4"
            style="font-family: 'Inter', sans-serif"
          >
            Hello {{ name }},
          </Text>

          <Text
            class="text-neutral-300 mb-4"
            style="font-family: 'Inter', sans-serif"
          >
            Your password has been changed. If you didn't change your password,
            please contact our support team.
          </Text>
        </div>

        <div class="bg-[#1B1B1D] px-6 py-4 border-t border-neutral-800">
          <Text
            class="text-neutral-300 text-sm text-center"
            style="font-family: 'Inter', sans-serif"
          >
            This email was sent by Snipplle. If you have any questions, please
            contact our support team at
            <a href="mailto:support@snipplle.com" class="text-[#BBEAA6]">
              support@snipplle.com</a
            >.
          </Text>

          <Text
            class="text-neutral-300 text-xs text-center"
            style="font-family: 'Inter', sans-serif"
          >
            © 2025 Snipplle. All rights reserved.
          </Text>
        </div>
      </div>
    </Tailwind>
  </Html>
</template>

<script setup lang="ts">
  import { Html, Head, Font, Tailwind, Img, Text } from '@vue-email/components'

  defineProps<{
    name: string
  }>()
</script>
