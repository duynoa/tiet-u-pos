import api from "@/src/lib/axios";

export const baseApi = {
  getListBase: (params?: any) =>
    api.get('/base', { params }),

  getBaseDetail: (id: string) =>
    api.get(`/base/${id}`),

  createBase: (data: any) =>
    api.post('/base', data),

  updateBase: (id: string, data: any) =>
    api.patch(`/base/${id}`, data),

  deleteBase: (id: string) =>
    api.delete(`/base/${id}`),
};