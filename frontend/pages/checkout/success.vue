<template>
  <div class="success-page container">
    <div
      class="success-card"
      v-motion
      :initial="{ opacity: 0, scale: 0.9 }"
      :enter="{ opacity: 1, scale: 1, transition: { duration: 500 } }"
    >
      <!-- Icône check animée -->
      <div class="success-icon">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" fill="rgba(61,143,141,0.1)" stroke="var(--paradiso)" stroke-width="3"/>
          <path
            class="success-check"
            d="M24 40l12 12 20-24"
            stroke="var(--paradiso)"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <h1 class="success-title">{{ $t('checkout.success.title') }}</h1>
      <p class="success-sub">{{ $t('checkout.success.subtitle') }}</p>

      <!-- Palette décorative -->
      <div class="success-palette">
        <span style="background: var(--burning-orange)" />
        <span style="background: var(--neon-carrot)" />
        <span style="background: var(--bright-sun)" />
        <span style="background: var(--wattle)" />
        <span style="background: var(--paradiso)" />
      </div>

      <div class="success-actions">
        <NuxtLink :to="localePath('/')" class="btn btn-primary">
          {{ $t('checkout.success.cta') }}
        </NuxtLink>
        <NuxtLink v-if="isLoggedIn" :to="localePath('/account/orders')" class="btn btn-ghost">
          Voir mes commandes
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const localePath = useLocalePath()
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)

useSeoMeta({ title: 'Commande confirmée — CLO-CLO' })
</script>

<style scoped>
.success-page {
  min-height: calc(100vh - var(--nav-h));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
}

.success-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 60px 48px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 28px;
}
.success-icon svg { width: 100%; height: 100%; }

.success-check {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: draw 0.6s ease 0.3s forwards;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}

.success-title {
  font-size: 1.75rem;
  font-weight: 900;
  margin-bottom: 12px;
}

.success-sub {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 32px;
}

.success-palette {
  display: flex;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 36px;
}
.success-palette span { flex: 1; }

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
