//queries
import { useQuery } from "@tanstack/react-query";
import { itemApi } from "./api";
import { Item } from "./types";

export const useGetItems = (branchId: string, qrcode: number, options?: { enabled?: boolean }) => {
  const fetchData = async (): Promise<Item | null> => {
    const response = await itemApi.getItems({ branch_id: branchId, qrcode });
    return response.data.data ?? null;
  };
  return useQuery({
    queryKey: ["items", branchId, qrcode],
    queryFn: fetchData,
    enabled: options?.enabled ?? qrcode > 0,
  });
};
