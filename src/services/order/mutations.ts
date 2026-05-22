import { useMutation } from "@tanstack/react-query"
import { orderApi } from "./api"

interface CreateOrderPayload {
  phone: string
  branch_id: string
  items: any[]
}

export const useCreateOrder = () =>
  useMutation({
    mutationFn: (data: CreateOrderPayload) => orderApi.createOrder(data),
  })

export const useDeleteOrder = () =>
  useMutation({
    mutationFn: (id: string) => orderApi.deleteOrder(id),
  })