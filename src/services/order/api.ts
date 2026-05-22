import api from "@/src/lib/axios";

export const orderApi = {
  createOrder: (data: any) =>
    api.post('/pos/create_order', data),
  deleteOrder: (id: string) =>
    api.post(`/pos/delete_order/${id}`),
};