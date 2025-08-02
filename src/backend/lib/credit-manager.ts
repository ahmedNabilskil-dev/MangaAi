// src/lib/credit-manager.ts

export interface CreditRates {
  // Text-based operations (per 1000 tokens or 1000 characters)
  textGeneration: {
    perToken: number; // Credits per 1000 tokens
    perCharacter: number; // Credits per 1000 characters (fallback)
  };

  // Image generation (based on dimensions and quality)
  imageGeneration: {
    baseRate: number; // Base credits for standard image
    perMegapixel: number; // Additional credits per megapixel
    qualityMultiplier: {
      standard: number; // 1x multiplier
      hd: number; // 2x multiplier
      ultra: number; // 3x multiplier
    };
  };
}

// Dynamic credit rates based on actual usage
export const CREDIT_RATES: CreditRates = {
  textGeneration: {
    perToken: 1, // 1 credit per 1000 tokens
    perCharacter: 0.5, // 0.5 credits per 1000 characters
  },

  imageGeneration: {
    baseRate: 2, // Base 2 credits for any image
    perMegapixel: 3, // 3 additional credits per megapixel
    qualityMultiplier: {
      standard: 1, // No additional cost
      hd: 2, // 2x the cost
      ultra: 3, // 3x the cost
    },
  },
};

export type OperationType = "textGeneration" | "imageGeneration";

// Helper to calculate text generation cost based on tokens or characters
export const calculateTextCost = (
  tokens?: number,
  characters?: number
): number => {
  if (tokens) {
    return Math.ceil(tokens / 1000) * CREDIT_RATES.textGeneration.perToken;
  } else if (characters) {
    return (
      Math.ceil(characters / 1000) * CREDIT_RATES.textGeneration.perCharacter
    );
  }
  return CREDIT_RATES.textGeneration.perToken; // Default to 1000 tokens worth
};

// Helper to calculate image generation cost based on dimensions and quality
export const calculateImageCost = (
  width: number = 512,
  height: number = 512,
  quality: "standard" | "hd" | "ultra" = "standard"
): number => {
  const megapixels = (width * height) / 1000000;
  const baseRate = CREDIT_RATES.imageGeneration.baseRate;
  const megapixelCost =
    Math.ceil(megapixels) * CREDIT_RATES.imageGeneration.perMegapixel;
  const qualityMultiplier =
    CREDIT_RATES.imageGeneration.qualityMultiplier[quality];

  return Math.ceil((baseRate + megapixelCost) * qualityMultiplier);
};

// Legacy function for backward compatibility
export const getCreditCost = (
  operation: OperationType,
  params?: any
): number => {
  switch (operation) {
    case "textGeneration":
      return calculateTextCost(params?.tokens, params?.characters);
    case "imageGeneration":
      return calculateImageCost(params?.width, params?.height, params?.quality);
    default:
      return 1;
  }
};

// Helper to calculate total credits for multiple operations
export const calculateTotalCredits = (
  operations: Array<{
    type: OperationType;
    count: number;
    params?: any; // For dynamic parameters like tokens, dimensions, etc.
  }>
): number => {
  return operations.reduce((total, op) => {
    const costPerOperation = getCreditCost(op.type, op.params);
    return total + costPerOperation * op.count;
  }, 0);
};

// Helper to format operation type for display
export const formatOperationType = (operation: OperationType): string => {
  const formatMap: Record<OperationType, string> = {
    textGeneration: "Text Generation",
    imageGeneration: "Image Generation",
  };
  return formatMap[operation];
};

// Helper to estimate cost before operation
export const estimateOperationCost = (
  operation: OperationType,
  params: {
    // For text operations
    estimatedTokens?: number;
    estimatedCharacters?: number;

    // For image operations
    width?: number;
    height?: number;
    quality?: "standard" | "hd" | "ultra";
  }
): number => {
  return getCreditCost(operation, params);
};
