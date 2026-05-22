import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "./api";

export const useGetInfoSettings = () => {
  const fetchData = async () => {
    const response = await settingsApi.getInfoSettings();
    return response.data.data;
  };
  return useQuery({
    queryKey: ["info-settings"],
    queryFn: fetchData,
  });
};