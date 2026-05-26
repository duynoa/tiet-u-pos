//dùng type thì thêm vào đây

export interface OrderItemDetail {
  id: number
  quantity: number
  name?: string
  price?: number
  image?: string
}

export interface OrderData {
  id?: string
  items: OrderItemDetail[]
  total_price?: number
  total_amount?: number
  total_quantity?: number
  total_items?: number
}

export interface PaymentInfo {
  code?: string
  id?: string
  qr?: string
  info_payment?: {
    qr: string
    bank?: {
      account_bank?: string
      account_number?: string
      account_name?: string
      amount?: number
      note?: string
      bank_short_bank?: string
      logo_bank?: string
    }
  }
}