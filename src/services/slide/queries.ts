import { useQuery } from "@tanstack/react-query";
import { slideApi } from "./api";

export const useGetListSlide = () => {
  const fetchData = async () => {
    const response = await slideApi.getListSlide();
    return response.data.data;
  };
  return useQuery({
    queryKey: ["list-slide"],
    queryFn: fetchData,
  });
};