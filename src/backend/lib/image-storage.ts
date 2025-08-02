interface ImgBBResponse {
  data: {
    url: string; // Permanent image URL
    delete_url?: string; // Optional deletion URL
  };
  success: boolean;
}

export class ImageStorage {
  /**
   * Get the API key from environment variables
   * @returns API key or null if not set
   */
  private static getApiKey(): string | null {
    return process.env.IMGBB_API_KEY || null;
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
