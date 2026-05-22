import api from "@/src/lib/axios";

export const settingsApi = {
  getInfoSettings: () =>
    api.get('/get_info_settings'),
};