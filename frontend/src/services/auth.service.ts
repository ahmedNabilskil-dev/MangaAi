// Frontend Auth Service - NestJS Backend Integration
import { apiRequest } from "@/lib/api-client";
import type { User } from "@/types/auth";

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<RegisterResponse> {
    try {
      const response = await apiRequest.post<RegisterResponse>(
        "/auth/register",
        {
          email,
          password,
          name,
        }
      );

      // Store tokens
      localStorage.setItem("authToken", response.tokens.accessToken);
      localStorage.setItem("refreshToken", response.tokens.refreshToken);

      return response;
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(error.response?.data?.message || "Failed to register");
    }
  }

  // Alias for register to match hook usage
  async signup(
    email: string,
    password: string,
    name?: string
  ): Promise<RegisterResponse> {
    return this.register(email, password, name);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiRequest.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // Store tokens
      localStorage.setItem("authToken", response.tokens.accessToken);
      localStorage.setItem("refreshToken", response.tokens.refreshToken);

      return response;
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Failed to login");
    }
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint if it exists
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          await apiRequest.post("/auth/logout");
        } catch (error) {
          // Ignore errors on logout endpoint
          console.warn("Logout endpoint error (ignored):", error);
        }
      }
    } finally {
      // Always clear local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return null;
      }

      return await apiRequest.get<User>("/auth/me");
    } catch (error: any) {
      console.error("Get current user error:", error);

      // If unauthorized, clear tokens
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      }

      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return null;
      }

      const response = await apiRequest.post<{
        accessToken: string;
        refreshToken: string;
      }>("/auth/refresh", {
        refreshToken: refreshToken,
      });

      // Update stored tokens
      localStorage.setItem("authToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      return response.accessToken;
    } catch (error: any) {
      console.error("Refresh token error:", error);

      // If refresh fails, clear tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

      throw new Error("Session expired. Please log in again.");
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiRequest.post("/auth/forgot-password", { email });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to send reset email"
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiRequest.post("/auth/reset-password", {
        token,
        password: newPassword,
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      return await apiRequest.patch<User>(`/auth/profile/${userId}`, updates);
    } catch (error: any) {
      console.error("Update profile error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }

  // Credit-related methods
  async getUserCredits(userId: string): Promise<{
    credits: number;
    daily_credits_used: number;
  }> {
    try {
      return await apiRequest.get<{
        credits: number;
        daily_credits_used: number;
      }>(`/auth/credits`);
    } catch (error: any) {
      console.error("Get user credits error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get user credits"
      );
    }
  }

  async getCreditHistory(userId: string): Promise<any[]> {
    try {
      // For now, return empty array - can be enhanced later
      return [];
    } catch (error: any) {
      console.error("Get credit history error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to get credit history"
      );
    }
  }

  // Google OAuth - redirect to backend Google auth endpoint
  async googleAuth(): Promise<void> {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    window.location.href = `${backendUrl}/auth/google`;
  }

  // Alias for backward compatibility
  async signInWithGoogle(): Promise<void> {
    return this.googleAuth();
  }

  // Email authentication aliases for compatibility
  async signInWithEmail(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    return this.login(email, password);
  }

  async signUpWithEmail(
    email: string,
    password: string,
    name?: string
  ): Promise<RegisterResponse> {
    return this.signup(email, password, name);
  }

  // Sign out alias
  async signOut(): Promise<void> {
    return this.logout();
  }

  getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      await apiRequest.post("/auth/resend-verification", { email });
    } catch (error: any) {
      console.error("Resend verification error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to resend verification email"
      );
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
