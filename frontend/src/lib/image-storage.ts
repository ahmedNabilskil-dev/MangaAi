import { apiRequest } from "@/lib/api-client";

export class ImageStorage {
  /**
   * Upload image to backend via NestJS API
   * @param base64Data - Image data
   * @param name - Optional image name
   * @returns Permanent image URL
   */
  static async uploadImage(base64Data: string, name?: string): Promise<string> {
    try {
      // Convert base64 to file for upload
      const response = await fetch(base64Data);
      const blob = await response.blob();
      const file = new File([blob], name || "image.png", { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);
      if (name) {
        formData.append("name", name);
      }

      const result = await apiRequest.post<{ url: string }>(
        "/upload-image",
        formData,
        {
          headers: {
            // Don't set Content-Type, let browser handle it for FormData
          },
        }
      );

      return result.url;
    } catch (error: any) {
      console.error("Image upload error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to upload image"
      );
    }
  }

  /**
   * Check if image upload is available (always true for API-based uploads)
   */
  static isConfigured(): boolean {
    return true;
  }
}
