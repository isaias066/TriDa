import { apiClient } from "./Client";
import { API_ENDPOINTS } from "@/constants/Api";
import {
  ApiMessageData,
  ApiSuccess,
  AuthResponseData,
  RegisterResponseData,
  LoginCredentials,
  RegisterCredentials,
  User,
  SessionUser,
  ChangePasswordPayload,
  UpdateProfilePayload,
  ForgotPasswordPayload,
  VerifyResetTokenPayload,
  VerifyEmailPayload,
  ResetPasswordPayload,
} from "@/types";

interface LoginApiResponse {
  token: string;
  usuario: SessionUser;
}

export const AuthApi = {
  /**
   * POST /api/v2/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiSuccess<LoginApiResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return {
      token: response.data.data.token,
      user: response.data.data.usuario,
    };
  },

  /**
   * POST /api/v2/auth/register
   */
  async register(
    credentials: RegisterCredentials,
  ): Promise<RegisterResponseData> {
    const response = await apiClient.post<ApiSuccess<RegisterResponseData>>(
      API_ENDPOINTS.AUTH.REGISTER,
      credentials,
    );
    return response.data.data;
  },

  async verifyEmail(payload: VerifyEmailPayload): Promise<ApiMessageData> {
    const response = await apiClient.post<ApiSuccess<ApiMessageData>>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      payload,
    );
    return response.data.data;
  },

  /**
   * GET /api/v2/auth/me
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiSuccess<User>>(
      API_ENDPOINTS.AUTH.ME,
    );
    return response.data.data;
  },

  /**
   * PATCH /api/v2/auth/me
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.patch<ApiSuccess<User>>(
      API_ENDPOINTS.AUTH.ME,
      payload,
    );
    return response.data.data;
  },

  /**
   * POST /api/v2/auth/change-password
   */
  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<ApiMessageData> {
    const response = await apiClient.post<ApiSuccess<ApiMessageData>>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload,
    );
    return response.data.data;
  },

  async logout(): Promise<ApiMessageData> {
    const response = await apiClient.post<ApiSuccess<ApiMessageData>>(
      API_ENDPOINTS.AUTH.LOGOUT,
    );
    return response.data.data;
  },

  /**
   * POST /api/v2/auth/forgot-password
   */
  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<ApiMessageData> {
    const response = await apiClient.post<ApiSuccess<ApiMessageData>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      payload,
    );
    return response.data.data;
  },

  /**
   * POST /api/v2/auth/verify-reset-token
   */
  async verifyResetToken(payload: VerifyResetTokenPayload): Promise<boolean> {
    const response = await apiClient.post<ApiSuccess<{ valid: boolean }>>(
      API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN,
      payload,
    );
    return response.data.data.valid;
  },

  /**
   * POST /api/v2/auth/reset-password
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ApiMessageData> {
    const response = await apiClient.post<ApiSuccess<ApiMessageData>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      payload,
    );
    return response.data.data;
  },
};
