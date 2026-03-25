import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth.api";
import { setTokens, clearTokens } from "@/lib/api/axios";
import { useAuthStore } from "@/stores/auth.store";
import { LoginRequest } from "@/types";

export const AUTH_QUERY_KEYS = {
  user: ["user"] as const,
};

// -----------------------------------------------
// useLogin
// -----------------------------------------------
export function useLogin() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response) => {
      setTokens(response.accessToken, response.refreshToken);

      // Fetch user info after login
      try {
        const userInfo = await authApi.getUserInfo();
        setUser(userInfo);
        queryClient.setQueryData(AUTH_QUERY_KEYS.user, userInfo);
        toast.success("Đăng nhập thành công!");
        router.push("/dashboard");
      } catch {
        toast.error("Không thể lấy thông tin người dùng");
      }
    },
    onError: () => {
      toast.error("Tên đăng nhập hoặc mật khẩu không đúng");
    },
  });
}

// -----------------------------------------------
// useLogout
// -----------------------------------------------
export function useLogout() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearTokens();
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });
}

// -----------------------------------------------
// useUserInfo
// -----------------------------------------------
export function useUserInfo() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: () => authApi.getUserInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
