import api from "@/src/lib/axios";

export const customerApi = {
  getCheckPhone: (phone: string) =>
    api.post('/pos/check_phone', { phone }),
  createClient: (data: any) =>
    api.post('/pos/create_client', data),
};