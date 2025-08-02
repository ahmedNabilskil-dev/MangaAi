// src/lib/credit-integration-example.ts
// Example integration showing how to use the new dynamic credit system

import {
  calculateImageCost,
  calculateTextCost,
  estimateOperationCost,
} from "./credit-manager";

/**
 * Example: Text Generation with Dynamic Token-Based Pricing
 * Instead of fixed costs, credits are calculated based on actual token usage
 */
export async function handleTextGeneration(prompt: string, userId: string) {
  // Estimate tokens (rough estimation: ~4 characters per token)
  const estimatedTokens = Math.ceil(prompt.length / 4) * 2; // Multiply by 2 for response

  // Calculate cost before operation
  const estimatedCost = calculateTextCost(estimatedTokens);

  console.log(`💰 Text Generation Cost Calculation:
    - Prompt: "${prompt.substring(0, 50)}..."
    - Estimated tokens: ${estimatedTokens}
    - Cost: ${estimatedCost} credits (${
    (estimatedCost / estimatedTokens) * 1000
  } per 1000 tokens)
  `);

  // Deduct credits with actual token count
  const response = await fetch("/api/deduct-credits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      operation: "textGeneration",
      tokens: estimatedTokens, // Actual token count from API response
      description: `Text generation: ${prompt.substring(0, 30)}...`,
    }),
  });

  return response;
}

/**
 * Example: Image Generation with Dynamic Size-Based Pricing
 * Credits calculated based on image dimensions and quality
 */
export async function handleImageGeneration(
  prompt: string,
  userId: string,
  width: number = 512,
  height: number = 512,
  quality: "standard" | "hd" | "ultra" = "standard"
) {
  // Calculate cost before operation
  const estimatedCost = calculateImageCost(width, height, quality);

  console.log(`🎨 Image Generation Cost Calculation:
    - Prompt: "${prompt.substring(0, 50)}..."
    - Dimensions: ${width}x${height}
    - Quality: ${quality}
    - Megapixels: ${((width * height) / 1000000).toFixed(2)}
    - Cost: ${estimatedCost} credits
    - Breakdown:
      * Base rate: 2 credits
      * Megapixel cost: ${Math.ceil((width * height) / 1000000) * 3} credits
      * Quality multiplier: ${
        quality === "standard" ? "1x" : quality === "hd" ? "2x" : "3x"
      }
  `);

  // Deduct credits with actual parameters
  const response = await fetch("/api/deduct-credits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      operation: "imageGeneration",
      width,
      height,
      quality,
      description: `Image generation (${width}x${height}, ${quality}): ${prompt.substring(
        0,
        30
      )}...`,
    }),
  });

  return response;
}

/**
 * Cost Estimation Examples
 */
export function demonstratePricing() {
  console.log("🏷️  Dynamic Credit Pricing Examples:\n");

  // Text Generation Examples
  console.log("📝 Text Generation:");
  console.log(`  - Short text (500 tokens): ${calculateTextCost(500)} credits`);
  console.log(
    `  - Medium text (2000 tokens): ${calculateTextCost(2000)} credits`
  );
  console.log(
    `  - Long text (5000 tokens): ${calculateTextCost(5000)} credits`
  );
  console.log(
    `  - Character-based (1000 chars): ${calculateTextCost(
      undefined,
      1000
    )} credits\n`
  );

  // Image Generation Examples
  console.log("🎨 Image Generation:");
  console.log(
    `  - Small (512x512, standard): ${calculateImageCost(
      512,
      512,
      "standard"
    )} credits`
  );
  console.log(
    `  - Medium (768x768, standard): ${calculateImageCost(
      768,
      768,
      "standard"
    )} credits`
  );
  console.log(
    `  - Large (1024x1024, standard): ${calculateImageCost(
      1024,
      1024,
      "standard"
    )} credits`
  );
  console.log(
    `  - HD (1024x1024, hd): ${calculateImageCost(1024, 1024, "hd")} credits`
  );
  console.log(
    `  - Ultra (1536x1536, ultra): ${calculateImageCost(
      1536,
      1536,
      "ultra"
    )} credits`
  );

  // Cost comparison
  console.log("\n💡 Cost Comparison (Old vs New):");
  console.log("  Old System: Fixed 5 credits per image");
  console.log("  New System: 2-15+ credits based on actual size/quality");
  console.log("  Result: More fair pricing based on computational cost");
}

/**
 * Pre-operation Cost Check
 */
export async function checkAffordability(
  userId: string,
  operation: "textGeneration" | "imageGeneration",
  params: {
    tokens?: number;
    characters?: number;
    width?: number;
    height?: number;
    quality?: "standard" | "hd" | "ultra";
  }
): Promise<{ canAfford: boolean; cost: number; userCredits?: number }> {
  const cost = estimateOperationCost(operation, params);

  // Check user's current credits
  const response = await fetch(`/api/debug-user?userId=${userId}`);
  const userData = await response.json();

  return {
    canAfford: userData.user?.credits >= cost,
    cost,
    userCredits: userData.user?.credits,
  };
}
