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

export type ProductsResponse = {
  data: Product[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export type ProductQuery = {
  search?: string
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  isFeatured?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc'
  page?: number
  limit?: number
}

export function useProducts() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiUrl

  async function fetchProducts(query: ProductQuery = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })

    return $fetch<ProductsResponse>(`${baseURL}/products?${params.toString()}`)
  }

  async function fetchProductBySlug(slug: string): Promise<Product> {
    return $fetch<Product>(`${baseURL}/products/${slug}`)
  }

  async function fetchFeatured(): Promise<ProductsResponse> {
    return fetchProducts({ isFeatured: true, limit: 6 })
  }

  return {
    fetchProducts,
    fetchProductBySlug,
    fetchFeatured,
  }
}
