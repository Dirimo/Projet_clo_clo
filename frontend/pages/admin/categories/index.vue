<template>
  <div class="admin-categories">
    <!-- Formulaire création -->
    <div class="admin-card" style="margin-bottom:24px;padding:24px">
      <h3 style="font-weight:800;margin-bottom:16px">{{ $t('admin.newCategory') }}</h3>
      <form class="cat-form" @submit.prevent="createCategory">
        <input v-model="form.name" type="text" placeholder="Nom" class="cat-input" required />
        <input v-model="form.slug" type="text" placeholder="Slug (auto si vide)" class="cat-input" />
        <input v-model="form.description" type="text" placeholder="Description" class="cat-input" />
        <button type="submit" class="btn btn-primary" :disabled="creating">
          {{ creating ? 'Création…' : '+ Créer' }}
        </button>
      </form>
    </div>

    <div class="admin-card">
      <div v-if="loading" class="admin-loading">Chargement…</div>
      <table v-else-if="categories.length" class="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom</th>
            <th>Slug</th>
            <th>Produits</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td>
              <div class="cat-thumb">
                <img v-if="cat.imageUrl" :src="cat.imageUrl" :alt="cat.name" />
                <div v-else class="cat-thumb-empty" />
              </div>
            </td>
            <td>
              <span v-if="editingId !== cat.id" class="cat-name">{{ cat.name }}</span>
              <input
                v-else
                v-model="editName"
                class="cat-input cat-input--inline"
                @keyup.enter="saveEdit(cat)"
                @keyup.esc="editingId = null"
              />
            </td>
            <td><code class="cat-slug">{{ cat.slug }}</code></td>
            <td>{{ cat._count?.products ?? 0 }}</td>
            <td>
              <div class="row-actions">
                <button
                  v-if="editingId !== cat.id"
                  class="action-btn action-btn--edit"
                  title="Renommer"
                  @click="startEdit(cat)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button
                  v-else
                  class="action-btn action-btn--save"
                  title="Sauvegarder"
                  @click="saveEdit(cat)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
                <button
                  class="action-btn action-btn--delete"
                  title="Supprimer"
                  @click="deleteCategory(cat)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="admin-empty">Aucune catégorie.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'admin', middleware: ['admin'] })
useSeoMeta({ title: 'Catégories — CLO-CLO Admin' })

const { apiFetch } = useApi()
const categories = ref<any[]>([])
const loading = ref(true)
const creating = ref(false)
const editingId = ref<string | null>(null)
const editName = ref('')

const form = reactive({ name: '', slug: '', description: '' })

async function loadCategories() {
  loading.value = true
  try {
    categories.value = await apiFetch<any[]>('/categories')
  } finally {
    loading.value = false
  }
}

async function createCategory() {
  creating.value = true
  try {
    const cat = await apiFetch<any>('/categories', {
      method: 'POST',
      body: { ...form },
    })
    categories.value.unshift(cat)
    form.name = ''
    form.slug = ''
    form.description = ''
  } finally {
    creating.value = false
  }
}

function startEdit(cat: any) {
  editingId.value = cat.id
  editName.value = cat.name
}

async function saveEdit(cat: any) {
  await apiFetch(`/categories/${cat.id}`, { method: 'PATCH', body: { name: editName.value } })
  cat.name = editName.value
  editingId.value = null
}

async function deleteCategory(cat: any) {
  if (!confirm(`Supprimer "${cat.name}" ? Ses produits ne seront pas supprimés.`)) return
  await apiFetch(`/categories/${cat.id}`, { method: 'DELETE' })
  categories.value = categories.value.filter((c) => c.id !== cat.id)
}

onMounted(loadCategories)
</script>

<style scoped>
.cat-form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.cat-input {
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  flex: 1;
  min-width: 140px;
}
.cat-input:focus { border-color: var(--burning-orange); }
.cat-input--inline { padding: 6px 10px; min-width: 120px; flex: none; }

.cat-thumb {
  width: 44px; height: 44px;
  border-radius: var(--radius); overflow: hidden; background: var(--color-bg);
}
.cat-thumb img { width: 100%; height: 100%; object-fit: cover; }
.cat-thumb-empty { width: 100%; height: 100%; background: var(--color-border); }

.cat-name { font-weight: 700; font-size: 0.875rem; }
.cat-slug { font-size: 0.75rem; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; color: var(--color-text-muted); }

.row-actions { display: flex; gap: 4px; }
.action-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius); border: none; cursor: pointer;
  background: transparent; color: var(--color-text-muted); transition: all 0.15s;
}
.action-btn:hover { background: var(--color-bg); }
.action-btn--delete:hover { color: #e63946; background: #fef2f2; }
.action-btn--save:hover { color: var(--paradiso); }

.admin-card { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.admin-loading, .admin-empty { padding: 32px 24px; text-align: center; color: var(--color-text-muted); font-size: 0.875rem; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.admin-table th { padding: 12px 16px; text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); font-weight: 700; background: #fafafa; border-bottom: 1px solid var(--color-border); }
.admin-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border); }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: #fafafa; }
</style>
