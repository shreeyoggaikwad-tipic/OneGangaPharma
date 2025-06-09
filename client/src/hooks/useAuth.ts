import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
