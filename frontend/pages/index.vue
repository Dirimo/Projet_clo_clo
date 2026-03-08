<template>
  <div class="home">

    <!-- ── HERO ─────────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero__inner container">

        <!-- Texte gauche -->
        <div
          v-motion
          :initial="{ opacity: 0, x: -40 }"
          :enter="{ opacity: 1, x: 0, transition: { duration: 700 } }"
          class="hero__text"
        >
          <span class="hero__eyebrow">{{ $t('home.hero.eyebrow') }}</span>
          <h1 class="hero__title">{{ $t('home.hero.title') }}</h1>
          <p class="hero__sub">{{ $t('home.hero.subtitle') }}</p>
          <div class="hero__actions">
            <NuxtLink :to="localePath('/shop')" class="btn btn-primary hero__cta">
              {{ $t('home.hero.cta') }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
            <NuxtLink :to="localePath('/shop?categorySlug=t-shirts')" class="btn btn-ghost hero__cta-ghost">
              {{ $t('home.hero.ctaSecondary') }}
            </NuxtLink>
          </div>
          <!-- Stats bar -->
          <div class="hero__stats">
            <div class="hero__stat">
              <span class="hero__stat-num">5+</span>
              <span class="hero__stat-label">{{ $t('home.hero.statCategories') }}</span>
            </div>
            <div class="hero__stat-divider" />
            <div class="hero__stat">
              <span class="hero__stat-num">100%</span>
              <span class="hero__stat-label">{{ $t('home.hero.statHandmade') }}</span>
            </div>
            <div class="hero__stat-divider" />
            <div class="hero__stat">
              <span class="hero__stat-num">FR</span>
              <span class="hero__stat-label">{{ $t('home.hero.statMade') }}</span>
            </div>
          </div>
        </div>

        <!-- Visuel droit — showcase produits -->
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.92 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 800, delay: 200 } }"
          class="hero__showcase"
        >
          <!-- Grande carte produit (t-shirt) -->
          <div class="showcase__main-card">
            <div class="showcase__product-img">
              <img src="/t_shirt.png" alt="T-shirt CLO-CLO" class="showcase__photo" />
              <div class="showcase__badge">Nouveau</div>
            </div>
            <div class="showcase__product-info">
              <span class="showcase__cat-tag">T-shirts</span>
              <p class="showcase__product-name">T-shirt CLO-CLO Signature</p>
              <p class="showcase__product-price">29,00 €</p>
            </div>
          </div>

          <!-- Cartes mini (autres catégories) -->
          <div class="showcase__mini-cards">
            <div class="showcase__mini" style="--mc: var(--burning-orange)">
              <img src="/stickers_3.png" alt="Puzzles & Pins" class="showcase__mini-photo" />
              <span>Puzzles & Pins</span>
            </div>
            <div class="showcase__mini" style="--mc: var(--wattle)">
              <img src="/livre.png" alt="Livres" class="showcase__mini-photo" />
              <span>Livres</span>
            </div>
            <div class="showcase__mini" style="--mc: var(--burning-orange)">
              <img src="/stickers_4.png" alt="Stickers" class="showcase__mini-photo" />
              <span>Autocollants</span>
            </div>
          </div>

          <!-- Deco blobs -->
          <div class="showcase__blob showcase__blob--1" />
          <div class="showcase__blob showcase__blob--2" />
        </div>
      </div>

      <!-- Colorbar -->
      <div class="hero__colorbar">
        <span style="background: var(--burning-orange)" />
        <span style="background: var(--neon-carrot)" />
        <span style="background: var(--bright-sun)" />
        <span style="background: var(--wattle)" />
        <span style="background: var(--paradiso)" />
      </div>
    </section>

    <!-- ── BANDE CATÉGORIES ─────────────────────────────────── -->
    <section class="cat-strip">
      <div class="container">
        <div class="cat-strip__grid">
          <NuxtLink
            v-for="(cat, i) in categoriesData"
            :key="cat.slug"
            :to="localePath(`/shop?categorySlug=${cat.slug}`)"
            class="cat-strip__item"
            :style="`--cc: ${cat.color}; --cc-light: ${cat.colorLight}`"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: i * 80 } }"
          >
            <div class="cat-strip__visual">
              <img v-if="cat.photo" :src="cat.photo" :alt="$t(cat.label)" class="cat-strip__photo" />
              <div v-else class="cat-strip__icon" v-html="cat.icon" />
            </div>
            <div class="cat-strip__label">{{ $t(cat.label) }}</div>
            <div class="cat-strip__arrow">→</div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── SECTION PRODUIT VEDETTE ──────────────────────────── -->
    <section class="feature-block">
      <div class="feature-block__inner container">
        <div class="feature-block__image-wrap">
          <div class="feature-block__image-bg">
            <img src="/t_shirts_2.png" alt="T-shirts CLO-CLO" class="feature-block__photo" />
            <div class="feature-block__tag">⭐ Best-seller</div>
          </div>
        </div>
        <div class="feature-block__text">
          <span class="feature-block__eyebrow">T-shirts CLO-CLO</span>
          <h2 class="feature-block__title">{{ $t('home.feature.title') }}</h2>
          <p class="feature-block__body">{{ $t('home.feature.body') }}</p>
          <ul class="feature-block__list">
            <li>{{ $t('home.feature.li1') }}</li>
            <li>{{ $t('home.feature.li2') }}</li>
            <li>{{ $t('home.feature.li3') }}</li>
          </ul>
          <NuxtLink :to="localePath('/shop?categorySlug=t-shirts')" class="btn btn-primary">
            {{ $t('home.feature.cta') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── COUPS DE CŒUR ───────────────────────────────────── -->
    <section class="featured section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">{{ $t('home.featured.title') }}</h2>
            <p class="section-sub">{{ $t('home.featured.subtitle') }}</p>
          </div>
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
        <div v-else class="featured-empty">
          <p>{{ $t('home.featured.empty') }}</p>
        </div>
      </div>
    </section>

    <!-- ── VALEURS CLO-CLO ──────────────────────────────────── -->
    <section class="values section">
      <div class="container">
        <h2 class="section-title" style="text-align:center">{{ $t('home.values.title') }}</h2>
        <div class="values__grid">
          <div v-for="v in valuesData" :key="v.icon" class="value-card">
            <div class="value-card__icon" :style="`color: ${v.color}`" v-html="v.icon" />
            <h3 class="value-card__title">{{ $t(v.label) }}</h3>
            <p class="value-card__desc">{{ $t(v.desc) }}</p>
          </div>
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
    color: '#ff6933',
    colorLight: 'rgba(255,105,51,0.12)',
    photo: '/stickers_3.png',
    icon: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="15" height="15" rx="2" fill="#ff6933" opacity="0.85"/>
      <rect x="27" y="6" width="15" height="15" rx="2" fill="#ff9b3d" opacity="0.85"/>
      <rect x="6" y="27" width="15" height="15" rx="2" fill="#ffc83d" opacity="0.85"/>
      <rect x="27" y="27" width="15" height="15" rx="2" fill="#3d8f8d" opacity="0.85"/>
      <circle cx="21" cy="14" r="3.5" fill="white"/>
      <circle cx="27" cy="34" r="3.5" fill="white"/>
    </svg>`,
  },
  {
    slug: 'livres-activites',
    label: 'nav.activites',
    color: '#ffc83d',
    colorLight: 'rgba(255,200,61,0.12)',
    photo: '/livre.png',
    icon: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <path d="M8 10C8 8.9 8.9 8 10 8h20l10 10v22a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="#ffc83d" opacity="0.85"/>
      <path d="M28 8v10h10" stroke="#3d2d00" stroke-width="2"/>
      <path d="M14 22h20M14 28h14" stroke="#3d2d00" stroke-width="2" stroke-linecap="round"/>
      <circle cx="32" cy="34" r="5" fill="#ff6933" opacity="0.9"/>
      <path d="M30 34l1.5 1.5L34 32" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    slug: 'livres-colorier',
    label: 'nav.colorier',
    color: '#d3e156',
    colorLight: 'rgba(211,225,86,0.15)',
    photo: '/livre.png',
    icon: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <path d="M8 10C8 8.9 8.9 8 10 8h20l10 10v22a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="#d3e156" opacity="0.85"/>
      <path d="M28 8v10h10" stroke="#2d3a00" stroke-width="2"/>
      <path d="M30 36l-4-10 7-7 4 10-7 7z" fill="#ff6933" opacity="0.9"/>
      <circle cx="27" cy="38" r="2.5" fill="#ff6933"/>
    </svg>`,
  },
  {
    slug: 'cahiers-vacances',
    label: 'nav.vacances',
    color: '#ff9b3d',
    colorLight: 'rgba(255,155,61,0.12)',
    photo: '/livre.png',
    icon: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="16" r="9" fill="#ffc83d" opacity="0.9"/>
      <rect x="12" y="28" width="24" height="14" rx="2" fill="#3d8f8d" opacity="0.8"/>
      <path d="M16 34h16M16 38h10" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    slug: 't-shirts',
    label: 'nav.tshirts',
    color: '#3d8f8d',
    colorLight: 'rgba(61,143,141,0.12)',
    photo: '/t_shirt.png',
    icon: `<svg width="36" height="36" viewBox="0 0 48 48" fill="none">
      <path d="M16 6h16l6 8-6 4v24H16V18l-6-4 6-8z" fill="#3d8f8d" opacity="0.85" stroke="#3d8f8d" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M16 6c0 4 4 6 8 6s8-2 8-6" stroke="white" stroke-width="2"/>
    </svg>`,
  },
]

const valuesData = [
  {
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    label: 'home.values.quality',
    desc: 'home.values.qualityDesc',
    color: '#ff6933',
  },
  {
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
    label: 'home.values.delivery',
    desc: 'home.values.deliveryDesc',
    color: '#3d8f8d',
  },
  {
    icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    label: 'home.values.passion',
    desc: 'home.values.passionDesc',
    color: '#ffc83d',
  },
]
</script>

<style scoped>
/* ── HERO ── */
.hero {
  background: var(--color-bg);
  overflow: hidden;
  position: relative;
}

.hero__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding-top: 70px;
  padding-bottom: 70px;
  min-height: calc(100vh - var(--nav-h));
}

.hero__eyebrow {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--burning-orange);
  background: rgba(255,105,51,0.1);
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 18px;
}

.hero__title {
  font-size: clamp(2.4rem, 4.5vw, 3.8rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin-bottom: 20px;
  color: var(--color-text);
}

.hero__sub {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  line-height: 1.65;
  max-width: 420px;
  margin-bottom: 36px;
}

.hero__actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.hero__cta { font-size: 1rem; display: flex; align-items: center; gap: 8px; }
.hero__cta-ghost {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  background: transparent;
  border: 2px solid var(--color-border);
  padding: 10px 20px;
  border-radius: var(--radius);
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}
.hero__cta-ghost:hover { border-color: var(--color-text); }

.hero__stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.hero__stat { text-align: center; }
.hero__stat-num {
  display: block;
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--burning-orange);
  letter-spacing: -0.02em;
}
.hero__stat-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.hero__stat-divider {
  width: 1px;
  height: 32px;
  background: var(--color-border);
}

/* Hero showcase */
.hero__showcase {
  position: relative;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.showcase__main-card {
  flex: 1;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(255,105,51,0.12);
  overflow: hidden;
  border: 1.5px solid var(--color-border);
}

.showcase__product-img {
  position: relative;
  background: linear-gradient(145deg, #fff5f0 0%, #fff8f0 50%, #f0f9f8 100%);
  aspect-ratio: 3/3.2;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.showcase__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.showcase__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--burning-orange);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
}

.showcase__product-info {
  padding: 14px 16px 16px;
}

.showcase__cat-tag {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--paradiso);
}

.showcase__product-name {
  font-size: 0.9rem;
  font-weight: 800;
  margin: 4px 0 2px;
  color: var(--color-text);
}

.showcase__product-price {
  font-size: 1rem;
  font-weight: 900;
  color: var(--burning-orange);
}

/* Mini cards */
.showcase__mini-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 20px;
}

.showcase__mini {
  background: #fff;
  border: 1.5px solid var(--color-border);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.showcase__mini:hover {
  border-color: var(--mc);
  transform: translateX(3px);
}

.showcase__mini-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--mc);
  opacity: 0.15;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.showcase__mini-photo {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
}

/* Blobs déco */
.showcase__blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
}
.showcase__blob--1 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(255,105,51,0.15) 0%, transparent 70%);
  top: -80px; right: -100px;
}
.showcase__blob--2 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(61,143,141,0.12) 0%, transparent 70%);
  bottom: -60px; left: -50px;
}

.hero__colorbar {
  display: flex;
  height: 8px;
}
.hero__colorbar span { flex: 1; }

/* ── CAT STRIP ── */
.cat-strip {
  padding: 48px 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.cat-strip__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.cat-strip__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  background: #fff;
  border: 2px solid transparent;
  border-radius: 16px;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s;
  cursor: pointer;
  text-align: center;
}

.cat-strip__item:hover {
  border-color: var(--cc);
  background: var(--cc-light);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.cat-strip__visual {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: var(--cc-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cat-strip__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 14px;
  transition: transform 0.2s;
}
.cat-strip__item:hover .cat-strip__photo {
  transform: scale(1.08);
}

.cat-strip__label {
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.2;
}

.cat-strip__arrow {
  font-size: 0.75rem;
  color: var(--cc);
  opacity: 0;
  transition: opacity 0.15s;
}
.cat-strip__item:hover .cat-strip__arrow { opacity: 1; }

/* ── FEATURE BLOCK ── */
.feature-block {
  padding: 100px 0;
  background: var(--color-bg);
  overflow: hidden;
}

.feature-block__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.feature-block__image-wrap {
  position: relative;
}

.feature-block__image-bg {
  background: linear-gradient(145deg, #fff5f0 0%, #fff8f0 40%, #f0f9f8 100%);
  border-radius: 24px;
  aspect-ratio: 4/5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(255,105,51,0.12), 0 4px 20px rgba(0,0,0,0.06);
  border: 1.5px solid rgba(255,105,51,0.1);
}

.feature-block__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.feature-block__tag {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--bright-sun);
  color: #3d2d00;
  font-size: 0.7rem;
  font-weight: 900;
  padding: 6px 14px;
  border-radius: 999px;
}

.feature-block__eyebrow {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--paradiso);
  background: rgba(61,143,141,0.1);
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 14px;
}

.feature-block__title {
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  margin-bottom: 18px;
  line-height: 1.1;
}

.feature-block__body {
  font-size: 1rem;
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-bottom: 24px;
}

.feature-block__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 36px;
}
.feature-block__list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 600;
}
.feature-block__list li::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--burning-orange);
  flex-shrink: 0;
}

/* ── FEATURED ── */
.section { padding: 80px 0; }
.section-title {
  font-size: 1.75rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  margin-bottom: 6px;
}
.section-sub {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 36px;
}
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 36px;
}
.section-link {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--burning-orange);
  text-decoration: none;
  white-space: nowrap;
  margin-top: 4px;
}
.section-link:hover { opacity: 0.7; }

.featured-empty {
  text-align: center;
  padding: 60px 24px;
  color: var(--color-text-muted);
}

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

/* ── VALUES ── */
.values__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 40px;
}

.value-card {
  padding: 32px 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all 0.2s;
}
.value-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.value-card__icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}
.value-card__title {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 8px;
}
.value-card__desc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* ── NEWSLETTER ── */
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

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .cat-strip__grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .hero__inner { grid-template-columns: 1fr; gap: 40px; }
  .hero__showcase { display: none; }
  .feature-block__inner { grid-template-columns: 1fr; gap: 40px; }
  .feature-block { padding: 60px 0; }
  .cat-strip__grid { grid-template-columns: repeat(2, 1fr); }
  .values__grid { grid-template-columns: 1fr; }
  .newsletter__inner { flex-direction: column; align-items: flex-start; }
  .newsletter__input { width: 100%; }
  .newsletter__form { width: 100%; flex-direction: column; }
}
</style>
