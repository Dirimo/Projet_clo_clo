<template>
  <div class="home">

    <!-- ── HERO ─────────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero__content container">
        <div
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="hero__text"
        >
          <span class="hero__eyebrow">CLO-CLO</span>
          <h1 class="hero__title">{{ $t('home.hero.title') }}</h1>
          <p class="hero__sub">{{ $t('home.hero.subtitle') }}</p>
          <NuxtLink :to="localePath('/shop')" class="btn btn-primary hero__cta">
            {{ $t('home.hero.cta') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 700, delay: 150 } }"
          class="hero__visual"
        >
          <!-- Palette de couleurs décorative -->
          <div class="hero__palette-deco">
            <div class="hero__palette-card" style="background: var(--burning-orange); transform: rotate(-4deg)">
              <span>Puzzles</span>
            </div>
            <div class="hero__palette-card" style="background: var(--neon-carrot); transform: rotate(2deg)">
              <span>Livres</span>
            </div>
            <div class="hero__palette-card" style="background: var(--bright-sun); color: #3d2d00; transform: rotate(-1deg)">
              <span>Cahiers</span>
            </div>
            <div class="hero__palette-card" style="background: var(--wattle); color: #2d3a00; transform: rotate(3deg)">
              <span>T-shirts</span>
            </div>
            <div class="hero__palette-card" style="background: var(--paradiso); transform: rotate(-2deg)">
              <span>Pins</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Barre de couleurs -->
      <div class="hero__colorbar">
        <span style="background: var(--burning-orange)" />
        <span style="background: var(--neon-carrot)" />
        <span style="background: var(--bright-sun)" />
        <span style="background: var(--wattle)" />
        <span style="background: var(--paradiso)" />
      </div>
    </section>

    <!-- ── CATÉGORIES ──────────────────────────────────────── -->
    <section class="categories section">
      <div class="container">
        <h2 class="section-title">{{ $t('home.categories.title') }}</h2>
        <div class="categories__grid">
          <NuxtLink
            v-for="(cat, i) in categoriesData"
            :key="cat.slug"
            :to="localePath(`/shop?categorySlug=${cat.slug}`)"
            class="category-card"
            :style="`--cat-color: ${cat.color}`"
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: i * 80 } }"
          >
            <div class="category-card__icon" v-html="cat.icon" />
            <div class="category-card__body">
              <h3 class="category-card__name">{{ $t(cat.label) }}</h3>
              <p class="category-card__desc">{{ $t(cat.desc) }}</p>
            </div>
            <svg class="category-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── COUPS DE CŒUR ───────────────────────────────────── -->
    <section class="featured section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.featured.title') }}</h2>
          <NuxtLink :to="localePath('/shop?isFeatured=true')" class="section-link">
            {{ $t('common.seeAll') }} →
          </NuxtLink>
        </div>

        <div v-if="featuredLoading" class="products-grid">
          <div v-for="n in 4" :key="n" class="product-skeleton" />
        </div>
        <div v-else-if="featured.length" class="products-grid">
          <ProductCard v-for="p in featured" :key="p.id" :product="p" />
        </div>
      </div>
    </section>

    <!-- ── NEWSLETTER ──────────────────────────────────────── -->
    <section class="newsletter">
      <div class="container">
        <div class="newsletter__inner">
          <div class="newsletter__text">
            <h2>{{ $t('home.newsletter.title') }}</h2>
            <p>{{ $t('home.newsletter.subtitle') }}</p>
          </div>
          <form class="newsletter__form" @submit.prevent>
            <input
              type="email"
              :placeholder="$t('home.newsletter.placeholder')"
              class="newsletter__input"
            />
            <button type="submit" class="btn btn-primary">
              {{ $t('home.newsletter.cta') }}
            </button>
          </form>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'

const localePath = useLocalePath()
const { fetchFeatured } = useProducts()

// SEO
const { t } = useI18n()
useSeoMeta({
  title: 'CLO-CLO — Puzzles, Livres & T-shirts',
  description: t('home.hero.subtitle'),
})

const featured = ref<any[]>([])
const featuredLoading = ref(true)

onMounted(async () => {
  try {
    const res = await fetchFeatured()
    featured.value = res.data
  } finally {
    featuredLoading.value = false
  }
})

const categoriesData = [
  {
    slug: 'puzzles-pins',
    label: 'nav.puzzles',
    desc: 'home.hero.subtitle',
    color: 'var(--burning-orange)',
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="15" height="15" rx="2" fill="#ff6933" opacity="0.2" stroke="#ff6933" stroke-width="2"/>
      <rect x="27" y="6" width="15" height="15" rx="2" fill="#ff9b3d" opacity="0.2" stroke="#ff9b3d" stroke-width="2"/>
      <rect x="6" y="27" width="15" height="15" rx="2" fill="#ffc83d" opacity="0.2" stroke="#ffc83d" stroke-width="2"/>
      <rect x="27" y="27" width="15" height="15" rx="2" fill="#3d8f8d" opacity="0.2" stroke="#3d8f8d" stroke-width="2"/>
      <circle cx="21" cy="14" r="3" fill="#ff6933"/>
      <circle cx="27" cy="34" r="3" fill="#3d8f8d"/>
    </svg>`,
  },
  {
    slug: 'livres-activites',
    label: 'nav.activites',
    desc: 'home.hero.subtitle',
    color: 'var(--bright-sun)',
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
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
    desc: 'home.hero.subtitle',
    color: 'var(--wattle)',
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M8 10C8 8.9 8.9 8 10 8h20l10 10v22a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="#d3e156" opacity="0.2" stroke="#d3e156" stroke-width="2"/>
      <path d="M28 8v10h10" stroke="#d3e156" stroke-width="2"/>
      <path d="M30 36l-4-10 7-7 4 10-7 7z" fill="#ff6933" opacity="0.8" stroke="#ff6933" stroke-width="1"/>
      <circle cx="27" cy="38" r="2" fill="#ff6933"/>
    </svg>`,
  },
  {
    slug: 'cahiers-vacances',
    label: 'nav.vacances',
    desc: 'home.hero.subtitle',
    color: 'var(--neon-carrot)',
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="16" r="8" fill="#ffc83d" opacity="0.8" stroke="#ffc83d" stroke-width="2"/>
      <rect x="12" y="28" width="24" height="14" rx="2" fill="#3d8f8d" opacity="0.15" stroke="#3d8f8d" stroke-width="2"/>
      <path d="M16 34h16M16 38h10" stroke="#3d8f8d" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    slug: 't-shirts',
    label: 'nav.tshirts',
    desc: 'home.hero.subtitle',
    color: 'var(--paradiso)',
    icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M16 6h16l6 8-6 4v24H16V18l-6-4 6-8z" fill="#3d8f8d" opacity="0.2" stroke="#3d8f8d" stroke-width="2" stroke-linejoin="round"/>
      <path d="M16 6c0 4 4 6 8 6s8-2 8-6" stroke="#3d8f8d" stroke-width="2"/>
    </svg>`,
  },
]
</script>

<style scoped>
/* ── Hero ── */
.hero {
  background: var(--color-bg);
  min-height: calc(100vh - var(--nav-h));
  display: flex;
  flex-direction: column;
}

.hero__content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding-top: 60px;
  padding-bottom: 60px;
}

.hero__eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--burning-orange);
  background: rgba(255, 105, 51, 0.1);
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
}

.hero__title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  color: var(--color-text);
}

.hero__sub {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  max-width: 440px;
  margin-bottom: 32px;
}

.hero__cta { font-size: 1rem; }

/* Palette décorative */
.hero__palette-deco {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  padding: 20px;
}

.hero__palette-card {
  padding: 20px 28px;
  border-radius: 16px;
  color: #fff;
  font-weight: 900;
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  box-shadow: var(--shadow-lg);
  width: 180px;
}

.hero__colorbar {
  display: flex;
  height: 8px;
}
.hero__colorbar span { flex: 1; }

/* Section utilitaires */
.section { padding: 80px 0; }
.section-title {
  font-size: 1.75rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  margin-bottom: 36px;
}
.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 36px;
}
.section-header .section-title { margin-bottom: 0; }
.section-link {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--burning-orange);
  text-decoration: none;
  transition: opacity 0.15s;
}
.section-link:hover { opacity: 0.7; }

/* Catégories */
.categories__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.category-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 20px;
  background: var(--color-surface);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text);
  box-shadow: var(--shadow);
  transition: all 0.2s;
  position: relative;
}
.category-card:hover {
  border-color: var(--cat-color);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.category-card__name {
  font-size: 0.9rem;
  font-weight: 800;
}
.category-card__desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  display: none; /* masqué pour l'instant, l'icon suffit */
}
.category-card__arrow {
  margin-top: auto;
  color: var(--cat-color);
  opacity: 0;
  transition: opacity 0.15s, transform 0.15s;
}
.category-card:hover .category-card__arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Skeleton */
.product-skeleton {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, var(--color-border) 25%, var(--color-bg) 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Newsletter */
.newsletter {
  background: linear-gradient(135deg, var(--burning-orange) 0%, var(--neon-carrot) 100%);
  padding: 80px 0;
  color: #fff;
}

.newsletter__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}

.newsletter__text h2 {
  font-size: 1.75rem;
  font-weight: 900;
  margin-bottom: 8px;
}
.newsletter__text p { opacity: 0.85; font-size: 1rem; }

.newsletter__form {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.newsletter__input {
  padding: 13px 20px;
  border-radius: var(--radius);
  border: none;
  font-size: 0.95rem;
  font-family: var(--font-sans);
  width: 280px;
  outline: none;
}
.newsletter__form .btn-primary {
  background: var(--color-text);
  color: #fff;
}
.newsletter__form .btn-primary:hover { background: #333; }

@media (max-width: 768px) {
  .hero__content { grid-template-columns: 1fr; }
  .hero__visual { display: none; }
  .newsletter__inner { flex-direction: column; align-items: flex-start; }
  .newsletter__input { width: 100%; }
  .newsletter__form { width: 100%; flex-direction: column; }
}
</style>
