<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <NuxtLink to="/" class="admin-sidebar__logo">
        <span class="logo-text">CLO-CLO</span>
        <span class="logo-badge">Admin</span>
      </NuxtLink>

      <nav class="admin-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="admin-nav__item"
          active-class="admin-nav__item--active"
        >
          <span class="admin-nav__icon" v-html="item.icon" />
          <span>{{ $t(item.label) }}</span>
        </NuxtLink>
      </nav>

      <button class="admin-sidebar__logout" @click="logout">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
        {{ $t('auth.logout') }}
      </button>
    </aside>

    <!-- Contenu principal -->
    <div class="admin-content">
      <header class="admin-header">
        <h1 class="admin-header__title">{{ pageTitle }}</h1>
        <div class="admin-header__user">
          <span>{{ authStore.fullName }}</span>
        </div>
      </header>
      <main class="admin-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useAuth } from '~/composables/useAuth'

defineOptions({ name: 'AdminLayout' })

const authStore = useAuthStore()
const { logout } = useAuth()
const route = useRoute()
const { t } = useI18n()

const navItems = [
  {
    to: '/admin',
    label: 'admin.dashboard',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  },
  {
    to: '/admin/products',
    label: 'admin.products',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  },
  {
    to: '/admin/categories',
    label: 'admin.categories',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  },
  {
    to: '/admin/orders',
    label: 'admin.orders',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  },
]

const pageTitle = computed(() => {
  const item = navItems.find((i) => route.path.startsWith(i.to) && i.to !== '/admin')
    || navItems.find((i) => route.path === i.to)
  return item ? t(item.label) : t('admin.dashboard')
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f8f6;
}

/* ── Sidebar ── */
.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--color-text);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
}

.admin-sidebar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 24px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 16px;
}

.logo-text {
  font-weight: 900;
  font-size: 1.2rem;
  color: var(--burning-orange);
  letter-spacing: 0.05em;
}

.logo-badge {
  background: var(--paradiso);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
}

.admin-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 12px;
}

.admin-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: var(--radius);
  color: rgba(255,255,255,0.7);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.15s ease;
}

.admin-nav__item:hover,
.admin-nav__item--active {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.admin-nav__item--active {
  background: var(--burning-orange) !important;
  color: #fff !important;
}

.admin-sidebar__logout {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 12px;
  padding: 11px 14px;
  border-radius: var(--radius);
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.admin-sidebar__logout:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

/* ── Content ── */
.admin-content {
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}

.admin-header__title {
  font-size: 1.2rem;
  font-weight: 800;
}

.admin-header__user {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.admin-main {
  padding: 32px;
}
</style>
