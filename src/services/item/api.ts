import api from "@/src/lib/axios";

export const itemApi = {
  getItems: (params?: any) =>
    api.post('/pos/get_items', params),
};