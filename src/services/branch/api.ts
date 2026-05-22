import api from "@/src/lib/axios";

export const checkBranchApi = {
  getCheckBranchDetail: (id: string) =>
    api.get(`/pos/check_branches/${id}`),
};