import { useQuery } from "@tanstack/react-query";
import { checkBranchApi } from "./api";

export const useGetCheckBranchDetail = (id: string) => {
  const fetchData = async () => {
    const response = await checkBranchApi.getCheckBranchDetail(id);
    return response.data.data;
  };
  return useQuery({
    queryKey: ["check-branch-detail", id],
    queryFn: fetchData,
  });
};