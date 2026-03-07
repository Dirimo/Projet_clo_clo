<template>
  <footer class="footer">
    <div class="footer__main container">
      <div class="footer__brand">
        <div class="footer__logo">
          <span>CLO</span>
          <span>CLO</span>
        </div>
        <p class="footer__tagline">{{ $t('home.hero.subtitle') }}</p>
        <div class="footer__socials">
          <a href="#" aria-label="Instagram" class="footer__social">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
          <a href="#" aria-label="Facebook" class="footer__social">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          <a href="#" aria-label="TikTok" class="footer__social">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
            </svg>
          </a>
        </div>
      </div>

      <div class="footer__nav">
        <div class="footer__col">
          <h4>{{ $t('nav.shop') }}</h4>
          <ul>
            <li><NuxtLink :to="localePath('/shop?categorySlug=puzzles-pins')">{{ $t('nav.puzzles') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/shop?categorySlug=livres-activites')">{{ $t('nav.activites') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/shop?categorySlug=livres-colorier')">{{ $t('nav.colorier') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/shop?categorySlug=cahiers-vacances')">{{ $t('nav.vacances') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/shop?categorySlug=t-shirts')">{{ $t('nav.tshirts') }}</NuxtLink></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>{{ $t('footer.about') }}</h4>
          <ul>
            <li><NuxtLink :to="localePath('/about')">{{ $t('footer.about') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/contact')">{{ $t('footer.contact') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/faq')">FAQ</NuxtLink></li>
          </ul>
        </div>
        <div class="footer__col">
          <h4>Légal</h4>
          <ul>
            <li><NuxtLink :to="localePath('/legal')">{{ $t('footer.legal') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/cgv')">{{ $t('footer.cgv') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/privacy')">{{ $t('footer.privacy') }}</NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Barre de couleurs palette 1984 -->
    <div class="footer__palette">
      <span style="background: var(--burning-orange)" />
      <span style="background: var(--neon-carrot)" />
      <span style="background: var(--bright-sun)" />
      <span style="background: var(--wattle)" />
      <span style="background: var(--paradiso)" />
    </div>

    <div class="footer__bottom container">
      <p>© {{ new Date().getFullYear() }} CLO-CLO. {{ $t('footer.rights') }}</p>
      <LanguageSwitcher />
    </div>
  </footer>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>

<style scoped>
.footer {
  background: var(--color-text);
  color: rgba(255,255,255,0.85);
  margin-top: 80px;
}

.footer__main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  padding: 60px 24px;
}

.footer__logo {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 2.5px solid var(--burning-orange);
  border-radius: 50%;
  font-weight: 900;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  line-height: 1.1;
  color: var(--burning-orange);
  margin-bottom: 16px;
}

.footer__tagline {
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.55);
  max-width: 240px;
  margin-bottom: 20px;
}

.footer__socials {
  display: flex;
  gap: 8px;
}
.footer__social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.6);
  transition: all 0.15s;
  text-decoration: none;
}
.footer__social:hover { border-color: var(--burning-orange); color: var(--burning-orange); }

.footer__nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.footer__col h4 {
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.4);
  margin-bottom: 16px;
}

.footer__col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.footer__col ul a {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: color 0.15s;
}
.footer__col ul a:hover { color: var(--burning-orange); }

/* Palette bar */
.footer__palette {
  display: flex;
  height: 5px;
}
.footer__palette span {
  flex: 1;
}

.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.footer__bottom p {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.35);
}

@media (max-width: 768px) {
  .footer__main {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .footer__nav {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
