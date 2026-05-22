import api from "@/src/lib/axios";

export const slideApi = {
  getListSlide: () =>
    api.get('/pos/get_slide'),
};