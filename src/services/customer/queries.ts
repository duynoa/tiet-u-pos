//queries
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "./api";

export const useGetCheckPhone = (phone: string) => {
  const fetchData = async () => {
    const response = await customerApi.getCheckPhone(phone);
    return response.data;
  };
  return useQuery({
    queryKey: ["check-phone", phone],
    queryFn: fetchData,
    enabled: phone.length > 0,
  });
};