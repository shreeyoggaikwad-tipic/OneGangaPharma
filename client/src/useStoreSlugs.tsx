import { useQuery } from "@tanstack/react-query";

function useStoreSlugs(p0: (state: any) => any) {
  const { data,isLoading: isLoadingSlug, error } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const res = await fetch("/api/getStoreSlugs");
      if (!res.ok) throw new Error("Failed to fetch stores");
      return res.json(); // This already returns an array of strings
    },
  });

  return { slugArray: data || [],isLoadingSlug ,error};
}

export default useStoreSlugs;
