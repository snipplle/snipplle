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
            Reset your password
          </Text>

          <Text
            class="text-neutral-300 mb-4"
            style="font-family: 'Inter', sans-serif"
          >
            Hello {{ name }},
          </Text>

          <Text
            class="text-neutral-300 mb-4 leading-relaxed"
            style="font-family: 'Inter', sans-serif"
          >
            We received a request to reset your password. If you didn't initiate
            this request, please ignore this email.
          </Text>

          <Text
            class="text-neutral-300 mb-4 leading-relaxed"
            style="font-family: 'Inter', sans-serif"
          >
            To reset your password, please click the button below:
          </Text>

          <div class="text-center mb-6">
            <Button
              :href="url"
              class="bg-[#BBEAA6] text-[#141416] px-8 py-4 rounded-lg text-lg shadow-lg"
            >
              <span style="font-family: 'Inter', sans-serif; font-weight: 600">
                Reset password
              </span>
            </Button>
          </div>

          <Hr class="my-6 border-neutral-800" />

          <div>
            <Text
              class="text-neutral-300 mb-4 leading-relaxed"
              style="font-family: 'Inter', sans-serif"
            >
              If the button doesn't work, you can copy and paste this link into
              your browser:
            </Text>
            <Text
              class="text-[#BBEAA6] text-sm break-all mt-2"
              style="font-family: 'Inter', sans-serif"
            >
              {{ url }}
            </Text>
          </div>
        </div>

        <div class="bg-[#1B1B1D] px-6 py-4 border-t border-neutral-800">
          <Text
            class="text-neutral-300 text-sm text-center"
            style="font-family: 'Inter', sans-serif"
          >
            This email was sent by Loglybase. If you have any questions, please
            contact our support team at
            <a href="mailto:support@snipplle.com" class="text-[#BBEAA6]">
              support@snipplle.com </a
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
  import {
    Html,
    Head,
    Font,
    Tailwind,
    Img,
    Text,
    Button,
    Hr,
  } from '@vue-email/components'

  defineProps<{
    name: string
    url: string
  }>()
</script>
