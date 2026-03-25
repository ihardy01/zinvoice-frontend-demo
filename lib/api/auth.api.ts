import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/config";
import { LoginRequest, LoginResponse, UserInfo } from "@/types";

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      API_ENDPOINTS.LOGIN,
      data,
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.LOGOUT);
  },

  getUserInfo: async (): Promise<UserInfo> => {
    const response = await axiosInstance.get<UserInfo>(API_ENDPOINTS.USER_INFO);
    return response.data;
  },
};
