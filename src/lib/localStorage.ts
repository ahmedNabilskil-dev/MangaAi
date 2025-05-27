interface ImgBBResponse {
  data: {
    url: string; // Permanent image URL
    delete_url?: string; // Optional deletion URL
  };
  success: boolean;
}

export class ImageStorage {
  private static STORAGE_KEY = "image_api_key";

  /**
   * Set the API key in local storage
   * @param key - ImgBB API key
   */
  static setApiKey(key: string): void {
    localStorage.setItem(this.STORAGE_KEY, key);
  }

  /**
   * Get the API key from local storage
   * @returns API key or null if not set
   */
  static getApiKey(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Check if API key is configured
   */
  static isConfigured(): boolean {
    return this.getApiKey() !== null;
  }

  /**
   * Upload image to ImgBB
   * @param base64Data - Image data
   * @param name - Optional image name
   * @returns Permanent image URL
   */
  static async uploadImage(base64Data: string, name?: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("ImgBB API key not configured. Please set it first.");
    }

    // Extract base64 content (remove data:image/... prefix if present)
    const base64Content = base64Data.split(",")[1] || base64Data;

    const formData = new FormData();
    formData.append("image", base64Content);
    if (name) formData.append("name", name);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result: ImgBBResponse = await response.json();

      if (!result.success) {
        throw new Error("Image upload failed");
      }

      return result.data.url;
    } catch (error) {
      console.error("ImgBB upload error:", error);
      throw new Error("Failed to upload image to ImgBB");
    }
  }
}
