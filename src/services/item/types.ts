//types
export interface Item {
  id: number
  name: string
  code: string
  price: string | number
  image?: string
}

export interface CartItem {
  id: number
  image: string
  name: string
  sku: string
  price: number
}