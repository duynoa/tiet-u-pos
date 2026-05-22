import { useMutation } from "@tanstack/react-query"
import { customerApi } from "./api"

interface CreateClientPayload {
  phone: string
  fullname: string
  branch_id: string
}

export const useCreateClient = () =>
  useMutation({
    mutationFn: (data: CreateClientPayload) => customerApi.createClient(data),
  })