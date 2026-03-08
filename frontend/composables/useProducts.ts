/**
 * ============================================================
 * useProducts.ts — Composable de chargement des produits
 * ============================================================
 * Rôle : Fournit des fonctions pour interroger l'API produits.
 *        Pas d'état interne — chaque appel retourne une Promise.
 *
 * Fonctions exposées :
 *  - fetchProducts(query)      : liste paginée avec filtres et tri
 *  - fetchProductBySlug(slug)  : détail complet d'un produit
 *  - fetchFeatured()           : coups de cœur (isFeatured=true, max 6)
 *
 * ⚠️ Les prix retournés sont toujours en CENTIMES (Int en DB).
 *    Utiliser formatPrice() du store cart pour l'affichage.
 * ============================================================
 */

// ── Type d'un produit retourné par l'API ─────────────────────
export type Product = {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  stock: number
  isActive: boolean
  isFeatured: boolean
  category?: { id: string; name: string; slug: string }
  images: { id: string; url: string; alt?: string; order: number }[]
  variants: {
    id: string
    name: string
    value: string
    stock: number
    priceAdjustment: number
  }[]
}

/** Réponse paginée de l'endpoint GET /products */
export type ProductsResponse = {
  data: Product[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

/** Paramètres de filtrage/tri pour fetchProducts() */
export type ProductQuery = {
  search?: string           // Recherche full-text sur nom et description
  categorySlug?: string     // Filtre par slug de catégorie (ex: 't-shirts')
  minPrice?: number         // Prix minimum en centimes
  maxPrice?: number         // Prix maximum en centimes
  isFeatured?: boolean      // Uniquement les produits "coups de cœur"
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc'
  page?: number             // Page courante (défaut : 1)
  limit?: number            // Produits par page (défaut : 12)
}

export function useProducts() {
  // URL de l'API configurée dans nuxt.config.ts → runtimeConfig.public.apiUrl
  const config = useRuntimeConfig()
  const baseURL = config.public.apiUrl

  /**
   * fetchProducts — Récupère une liste paginée de produits
   * ───────────────────────────────────────────────────────
   * Construit une query string à partir des paramètres fournis.
   * Les valeurs undefined ou vides sont ignorées (non envoyées).
   * @example
   *   fetchProducts({ categorySlug: 't-shirts', page: 2, sortBy: 'price_asc' })
   *   → GET /products?categorySlug=t-shirts&page=2&sortBy=price_asc
   */
  async function fetchProducts(query: ProductQuery = {}): Promise<ProductsResponse> {
    // Construit les paramètres URL en filtrant les valeurs vides
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })

    return $fetch<ProductsResponse>(`${baseURL}/products?${params.toString()}`)
  }

  /**
   * fetchProductBySlug — Récupère le détail complet d'un produit
   * ─────────────────────────────────────────────────────────────
   * Utilisé sur la page /product/[slug].vue
   * Lève une erreur 404 si le produit n'existe pas ou est inactif (isActive=false).
   */
  async function fetchProductBySlug(slug: string): Promise<Product> {
    return $fetch<Product>(`${baseURL}/products/${slug}`)
  }

  /**
   * fetchFeatured — Raccourci pour les coups de cœur
   * ──────────────────────────────────────────────────
   * Retourne les 6 produits marqués isFeatured=true.
   * Utilisé sur la page d'accueil dans la section "Nos coups de cœur".
   */
  async function fetchFeatured(): Promise<ProductsResponse> {
    return fetchProducts({ isFeatured: true, limit: 6 })
  }

  return {
    fetchProducts,
    fetchProductBySlug,
    fetchFeatured,
  }
}
