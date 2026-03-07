<template>
  <div class="lang-switcher" @mouseleave="open = false">
    <button class="lang-switcher__btn" @click="open = !open">
      {{ currentLocale?.code.toUpperCase() }}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>

    <Transition name="dropdown">
      <ul v-if="open" class="lang-switcher__menu">
        <li
          v-for="locale in availableLocales"
          :key="locale.code"
        >
          <NuxtLink
            :to="switchLocalePath(locale.code)"
            class="lang-switcher__option"
            :class="{ 'lang-switcher__option--active': locale.code === currentLocale?.code }"
            @click="open = false"
          >
            {{ locale.code.toUpperCase() }}
            <span class="lang-switcher__name">{{ locale.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const open = ref(false)

const currentLocale = computed(() =>
  (locales.value as any[]).find((l) => l.code === locale.value)
)

const availableLocales = computed(() =>
  (locales.value as any[]).filter((l) => l.code !== locale.value)
)
</script>

<style scoped>
.lang-switcher {
  position: relative;
}

.lang-switcher__btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: transparent;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font-sans);
}
.lang-switcher__btn:hover {
  border-color: var(--burning-orange);
  color: var(--burning-orange);
}

.lang-switcher__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  list-style: none;
  overflow: hidden;
  min-width: 110px;
  z-index: 300;
}

.lang-switcher__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text);
  transition: background 0.1s;
  text-decoration: none;
}
.lang-switcher__option:hover {
  background: var(--color-bg);
  color: var(--burning-orange);
}
.lang-switcher__option--active {
  color: var(--burning-orange);
}

.lang-switcher__name {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-text-muted);
}

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
