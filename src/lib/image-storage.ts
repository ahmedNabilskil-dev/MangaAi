export class ImageStorage {
  /**
   * Upload image to ImgBB via backend API
   * @param base64Data - Image data
   * @param name - Optional image name
   * @returns Permanent image URL
   */
  static async uploadImage(base64Data: string, name?: string): Promise<string> {
    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Data,
          name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Failed to upload image");
    }
  }

  /**
   * Check if image upload is available (always true for API-based uploads)
   */
  static isConfigured(): boolean {
    return true;
  }
}
