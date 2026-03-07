<template>
  <header class="navbar">
    <div class="navbar__inner container">

      <!-- Logo -->
      <NuxtLink :to="localePath('/')" class="navbar__logo">
        <div class="logo-mark">
          <span>CLO</span>
          <span>CLO</span>
        </div>
      </NuxtLink>

      <!-- Navigation catégories (style Cool Bottles Co) -->
      <nav class="navbar__cats">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.slug"
          :to="localePath(`/shop?categorySlug=${cat.slug}`)"
          class="navbar__cat"
          active-class="navbar__cat--active"
        >
          <span class="navbar__cat-icon" v-html="cat.icon" />
          <span class="navbar__cat-label">{{ $t(cat.label) }}</span>
        </NuxtLink>
      </nav>

      <!-- Actions droite -->
      <div class="navbar__actions">
        <LanguageSwitcher />

        <!-- Recherche -->
        <button class="navbar__action-btn" aria-label="Rechercher" @click="searchOpen = !searchOpen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        <!-- Compte -->
        <NuxtLink
          :to="localePath(isLoggedIn ? '/account' : '/login')"
          class="navbar__action-btn"
          aria-label="Compte"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </NuxtLink>

        <!-- Panier -->
        <button class="navbar__cart-btn" aria-label="Panier" @click="cartOpen = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span v-if="itemCount > 0" class="navbar__cart-badge">{{ itemCount }}</span>
        </button>
      </div>
    </div>

    <!-- Barre de recherche (slide down) -->
    <Transition name="search">
      <div v-if="searchOpen" class="navbar__search-bar container">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="$t('common.search')"
          class="navbar__search-input"
          @keyup.enter="goSearch"
          @keyup.esc="searchOpen = false"
        />
        <button class="navbar__search-close" @click="searchOpen = false">✕</button>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

const localePath = useLocalePath()
const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const cartOpen = useState('cartOpen', () => false)
const searchOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()

const itemCount = computed(() => cartStore.itemCount)
const isLoggedIn = computed(() => authStore.isLoggedIn)

watch(searchOpen, (v) => {
  if (v) nextTick(() => searchInput.value?.focus())
})

function goSearch() {
  if (!searchQuery.value.trim()) return
  router.push(localePath(`/shop?search=${encodeURIComponent(searchQuery.value.trim())}`))
  searchOpen.value = false
  searchQuery.value = ''
}

// Catégories CLO-CLO avec icônes SVG inline
const categories = [
  {
    slug: 'puzzles-pins',
    label: 'nav.puzzles',
    icon: `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="15" height="15" rx="2" fill="#ff6933" opacity="0.15" stroke="#ff6933" stroke-width="2"/>
      <rect x="27" y="6" width="15" height="15" rx="2" fill="#ff9b3d" opacity="0.15" stroke="#ff9b3d" stroke-width="2"/>
      <rect x="6" y="27" width="15" height="15" rx="2" fill="#ffc83d" opacity="0.15" stroke="#ffc83d" stroke-width="2"/>
      <rect x="27" y="27" width="15" height="15" rx="2" fill="#3d8f8d" opacity="0.15" stroke="#3d8f8d" stroke-width="2"/>
      <circle cx="21" cy="14" r="3" fill="#ff6933"/>
      <circle cx="27" cy="34" r="3" fill="#3d8f8d"/>
    </svg>`,
  },
  {
    slug: 'livres-activites',
    label: 'nav.activites',
    icon: `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10C8 8.9 8.9 8 10 8h20l10 10v22a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="#ffc83d" opacity="0.2" stroke="#ffc83d" stroke-width="2"/>
      <path d="M28 8v10h10" stroke="#ffc83d" stroke-width="2"/>
      <path d="M14 22h20M14 28h14" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="34" r="5" fill="#ff6933" opacity="0.8"/>
      <path d="M30 34l1.5 1.5L34 32" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    slug: 'livres-colorier',
    label: 'nav.colorier',
    icon: `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10C8 8.9 8.9 8 10 8h20l10 10v22a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="#d3e156" opacity="0.2" stroke="#d3e156" stroke-width="2"/>
      <path d="M28 8v10h10" stroke="#d3e156" stroke-width="2"/>
      <path d="M30 36l-4-10 7-7 4 10-7 7z" fill="#ff6933" opacity="0.8" stroke="#ff6933" stroke-width="1"/>
      <path d="M26 26l4 4" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="27" cy="38" r="2" fill="#ff6933"/>
    </svg>`,
  },
  {
    slug: 'cahiers-vacances',
    label: 'nav.vacances',
    icon: `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="16" r="8" fill="#ffc83d" opacity="0.8" stroke="#ffc83d" stroke-width="2"/>
      <path d="M24 8V4M24 28v4M8 16H4M44 16h-4M11.5 11.5 8.7 8.7M36.5 36.5l2.8 2.8M11.5 20.5 8.7 23.3M36.5 11.5l2.8-2.8" stroke="#ffc83d" stroke-width="2" stroke-linecap="round"/>
      <rect x="12" y="28" width="24" height="14" rx="2" fill="#3d8f8d" opacity="0.15" stroke="#3d8f8d" stroke-width="2"/>
      <path d="M16 34h16M16 38h10" stroke="#3d8f8d" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    slug: 't-shirts',
    label: 'nav.tshirts',
    icon: `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 6h16l6 8-6 4v24H16V18l-6-4 6-8z" fill="#ff9b3d" opacity="0.2" stroke="#ff9b3d" stroke-width="2" stroke-linejoin="round"/>
      <path d="M16 6c0 4 4 6 8 6s8-2 8-6" stroke="#ff9b3d" stroke-width="2"/>
    </svg>`,
  },
]
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  height: var(--nav-h);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.navbar__inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: var(--nav-h);
}

/* Logo */
.navbar__logo {
  flex-shrink: 0;
  text-decoration: none;
}

.logo-mark {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 2.5px solid var(--color-text);
  border-radius: 50%;
  font-weight: 900;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  line-height: 1.1;
  color: var(--color-text);
  transition: border-color 0.2s;
}
.navbar__logo:hover .logo-mark {
  border-color: var(--burning-orange);
  color: var(--burning-orange);
}

/* Catégories */
.navbar__cats {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.navbar__cat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.15s;
}

.navbar__cat:hover,
.navbar__cat--active {
  color: var(--burning-orange);
}

.navbar__cat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}
.navbar__cat:hover .navbar__cat-icon {
  transform: scale(1.1);
}

.navbar__cat-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

/* Actions */
.navbar__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s;
}
.navbar__action-btn:hover {
  background: var(--color-bg);
  color: var(--burning-orange);
}

.navbar__cart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s;
}
.navbar__cart-btn:hover {
  background: var(--color-bg);
  color: var(--burning-orange);
}

.navbar__cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--burning-orange);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 900;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Barre de recherche */
.navbar__search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 0;
  padding-bottom: 12px;
}

.navbar__search-input {
  flex: 1;
  border: none;
  border-bottom: 2px solid var(--color-primary);
  padding: 8px 0;
  font-size: 1rem;
  font-family: var(--font-sans);
  background: transparent;
  outline: none;
  color: var(--color-text);
}

.navbar__search-close {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.15s;
}
.navbar__search-close:hover { color: var(--burning-orange); }

/* Transition barre de recherche */
.search-enter-active, .search-leave-active { transition: all 0.2s ease; }
.search-enter-from, .search-leave-to { opacity: 0; transform: translateY(-8px); }

/* Responsive */
@media (max-width: 900px) {
  .navbar__cat-label { display: none; }
  .navbar__cats { gap: 0; }
}
@media (max-width: 640px) {
  .navbar__cats { display: none; }
}
</style>
